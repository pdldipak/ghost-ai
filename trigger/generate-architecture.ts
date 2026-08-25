import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { AbortTaskRunError, task } from "@trigger.dev/sdk";

import {
  applyAiCanvasPlan,
  AI_CANVAS_PLAN_SCHEMA,
  parseAiCanvasPlan,
  serializeCanvasForPrompt,
  validateAiCanvasPlan,
  type CanvasSnapshot,
} from "@/lib/ai-canvas-plan";
import {
  AI_STATUS_MESSAGES,
  clearAiPresence,
  publishAiStatus,
  setAiPresence,
} from "@/lib/ai-room";
import { generateText, jsonSchema, Output } from "@/lib/ai-sdk";
import { isFinitePosition } from "@/lib/canvas-nodes";
import { liveblocks } from "@/lib/liveblocks";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_HANDLE_IDS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas";

interface GenerateArchitecturePayload {
  projectId?: string;
  /** Alias for projectId. In this app the Liveblocks room ID is the project ID. */
  roomId?: string;
  prompt?: string;
}

const DEFAULT_CURSOR = { x: 80, y: 80 };

function readPayloadString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function getGeminiApiKey(): string {
  const key =
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new AbortTaskRunError(
      "GOOGLE_AI_API_KEY is not set. Add it to .env.local and the Trigger.dev worker env.",
    );
  }

  return key;
}

function buildSystemPrompt(): string {
  const colors = NODE_COLORS.map(
    (color) => `${color.label} (${color.fill})`,
  ).join(", ");

  return `You are Ghost Assistant, a senior software architect for a collaborative system-design canvas.

Translate the design request into a precise canvas operation plan. Collaborators may already be editing this diagram; treat the current graph as the source of truth.

Objectives:
- Model the request as a production architecture: services, APIs, data stores, queues, gateways, and the flows between them.
- Prefer incremental edits. Set replaceGraph to true only when the canvas is empty, or when the user explicitly asks to replace, start over, or generate a new design.
- Keep the diagram readable: short component labels, consistent spacing of about 80px, and no overlapping nodes.

Canvas contract:
- Nodes are type canvasNode with data.label, data.color, and data.shape.
- Edges are type canvasEdge with data.label and four-side handles.
- Allowed shapes: ${NODE_SHAPES.join(", ")}.
- Allowed colors (use the fill hex): ${colors}. Default color: ${DEFAULT_NODE_COLOR}.
- Connection handles: ${NODE_HANDLE_IDS.join(", ")}. Prefer sourceHandle "right" and targetHandle "left".
- Supported operations: addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge.
- Only move, resize, update, or delete nodes and edges that already exist, or that this plan adds earlier.

Summary:
- Write summary as one or two professional sentences for the user.
- Describe what was added or changed. Do not mention internal operation names, JSON, or implementation details.`;
}

function buildUserPrompt(snapshot: CanvasSnapshot, prompt: string): string {
  return [
    "CURRENT CANVAS",
    serializeCanvasForPrompt(snapshot),
    "",
    "DESIGN REQUEST",
    prompt,
    "",
    "Return a canvas operation plan that fulfills the design request against the current canvas.",
  ].join("\n");
}

async function readCanvasSnapshot(roomId: string): Promise<CanvasSnapshot> {
  let snapshot: CanvasSnapshot = { nodes: [], edges: [] };

  await mutateFlow<CanvasNode, CanvasEdge>(
    { client: liveblocks, roomId },
    (flow) => {
      snapshot = {
        nodes: [...flow.nodes],
        edges: [...flow.edges],
      };
    },
  );

  return snapshot;
}

export const generateArchitecture = task({
  id: "generate-architecture",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: GenerateArchitecturePayload, { ctx }) => {
    const roomId = readPayloadString(payload?.projectId, payload?.roomId);
    const prompt = readPayloadString(payload?.prompt);

    if (!roomId) {
      throw new AbortTaskRunError(
        "projectId (or roomId) is required and must be a non-empty string",
      );
    }

    if (!prompt) {
      throw new AbortTaskRunError(
        "prompt is required and must be a non-empty string",
      );
    }

    console.log(
      "generate-architecture",
      roomId,
      prompt,
      "attempt",
      ctx.attempt.number,
    );

    const apiKey = getGeminiApiKey();
    let applied = false;
    let publishedFailure = false;

    const fail = async (message: string) => {
      if (publishedFailure) {
        return;
      }

      publishedFailure = true;
      await publishAiStatus(roomId, "failure", message);
    };

    try {
      await liveblocks.getOrCreateRoom(roomId, {
        defaultAccesses: [],
      });

      await setAiPresence({
        roomId,
        cursor: DEFAULT_CURSOR,
        isThinking: true,
      });
      await publishAiStatus(roomId, "start");

      const snapshot = await readCanvasSnapshot(roomId);
      await publishAiStatus(roomId, "processing");

      const google = createGoogleGenerativeAI({ apiKey });
      const result = await generateText({
        model: google("gemini-3.6-flash"),
        output: Output.object({
          name: "canvasPlan",
          description: "Canvas mutation plan for the collaborative architecture diagram.",
          schema: jsonSchema(AI_CANVAS_PLAN_SCHEMA),
        }),
        system: buildSystemPrompt(),
        prompt: buildUserPrompt(snapshot, prompt),
      });

      const plan = parseAiCanvasPlan(result.output, snapshot);

      if (typeof plan === "string") {
        await fail(plan);
        throw new AbortTaskRunError(plan);
      }

      const validationError = validateAiCanvasPlan(plan, snapshot);

      if (validationError) {
        await fail(validationError);
        throw new AbortTaskRunError(validationError);
      }

      applied = true;

      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        async (flow) => {
          await applyAiCanvasPlan(flow, plan, async (cursor) => {
            if (!isFinitePosition(cursor)) {
              return;
            }

            await setAiPresence({
              roomId,
              cursor,
              isThinking: true,
            });
          });
        },
      );

      await publishAiStatus(
        roomId,
        "complete",
        plan.summary || AI_STATUS_MESSAGES.complete,
      );

      return {
        projectId: roomId,
        prompt,
        replaceGraph: plan.replaceGraph,
        operationCount: plan.operations.length,
        summary: plan.summary,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : AI_STATUS_MESSAGES.failure;

      try {
        await fail(message);
      } catch (statusError) {
        console.error("Failed to publish AI failure status:", statusError);
      }

      if (error instanceof AbortTaskRunError) {
        throw error;
      }

      if (applied) {
        throw new AbortTaskRunError(message);
      }

      throw error;
    } finally {
      try {
        await clearAiPresence(roomId);
      } catch (presenceError) {
        console.error("Failed to clear AI presence:", presenceError);
      }
    }
  },
});
