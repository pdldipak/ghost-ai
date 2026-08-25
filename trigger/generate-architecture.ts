import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { AbortTaskRunError, task } from "@trigger.dev/sdk";

import {
  AI_ARCHITECTURE_GRAPH_SCHEMA,
  architectureGraphToPlan,
  extractJsonObject,
  parseArchitectureGraph,
  type ArchitectureGraph,
} from "@/lib/ai-architecture-graph";
import {
  applyAiCanvasPlan,
  serializeCanvasForPrompt,
  type AiCanvasPlan,
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
  NODE_COLORS,
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
const MIN_NODES_FOR_FULL_DESIGN = 5;

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

  return `You are Ghost Assistant, a senior software architect.

Return an architecture graph for the user's request. Code will place it on a collaborative canvas. Do not return canvas operations.

The graph must match THIS request. Never use a generic Web and Mobile client template. If the user asks for e-commerce, include the gateway, services, stores, cache, and queue they named. If they ask for something else, include those components instead.

Include every necessary component as its own node:
- clients and channels that users actually need
- API gateways and BFF or edge layers
- application services and APIs
- databases, caches, search, and object storage
- message queues, streams, and workers
- external integrations and identity providers
- infrastructure that the request implies (CDN, load balancer, observability) when relevant

Kind must be one of: client, gateway, service, api, database, cache, queue, integration, infra.
Preferred shapes: client=pill, gateway=hexagon, service/api=rectangle, database/cache=cylinder, queue=diamond.
Allowed shapes: ${NODE_SHAPES.join(", ")}.
Allowed colors (fill hex or label): ${colors}.

Connect nodes with edges (HTTPS, gRPC, events, reads, writes). A summary is not a substitute for nodes.

When the canvas is empty, or the user asks to design, generate, replace, or start over, set replaceGraph to true and return the full graph.
For a small edit, set replaceGraph to false and return only nodes and edges to add.

Summary: one or two professional sentences. Do not mention JSON or operation names.`;
}

function buildUserPrompt(
  snapshot: CanvasSnapshot,
  prompt: string,
  extraInstruction?: string,
): string {
  const lines = [
    "CURRENT CANVAS",
    serializeCanvasForPrompt(snapshot),
    "",
    "DESIGN REQUEST",
    prompt,
    "",
    snapshot.nodes.length === 0
      ? "The canvas is empty. Set replaceGraph to true. Return the complete architecture graph for this request, with a node for every component and edges for every flow."
      : "Return an architecture graph that fulfills the design request against the current canvas.",
  ];

  if (extraInstruction) {
    lines.push("", extraInstruction);
  }

  return lines.join("\n");
}

function isFullDesignRequest(prompt: string): boolean {
  return /\b(design|architect|generate|replace|start over|from scratch)\b/i.test(
    prompt,
  );
}

function graphToPlan(
  graph: ArchitectureGraph,
  snapshot: CanvasSnapshot,
): AiCanvasPlan | string {
  return architectureGraphToPlan(graph, snapshot);
}

async function requestStructuredGraph(
  apiKey: string,
  snapshot: CanvasSnapshot,
  prompt: string,
  extraInstruction?: string,
): Promise<ArchitectureGraph | string> {
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await generateText({
    model: google("gemini-3.6-flash"),
    output: Output.object({
      name: "architectureGraph",
      description:
        "Complete system architecture graph. Every component is a node; every communication path is an edge.",
      schema: jsonSchema(AI_ARCHITECTURE_GRAPH_SCHEMA),
    }),
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(snapshot, prompt, extraInstruction),
  });

  return parseArchitectureGraph(result.output, snapshot);
}

async function requestUnstructuredGraph(
  apiKey: string,
  snapshot: CanvasSnapshot,
  prompt: string,
): Promise<ArchitectureGraph | string> {
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await generateText({
    model: google("gemini-3.6-flash"),
    system: buildSystemPrompt(),
    prompt: [
      buildUserPrompt(
        snapshot,
        prompt,
        "Reply with a single JSON object only. Do not wrap it in markdown. Include every component from the request as a node.",
      ),
    ].join("\n"),
  });

  return parseArchitectureGraph(extractJsonObject(result.text), snapshot);
}

function needsFullGraph(
  prompt: string,
  snapshot: CanvasSnapshot,
  graph: ArchitectureGraph,
): boolean {
  return (
    snapshot.nodes.length === 0 ||
    graph.replaceGraph ||
    isFullDesignRequest(prompt)
  );
}

async function requestCanvasPlan(
  apiKey: string,
  snapshot: CanvasSnapshot,
  prompt: string,
): Promise<AiCanvasPlan | string> {
  let graph = await requestStructuredGraph(apiKey, snapshot, prompt);

  if (typeof graph !== "string") {
    if (
      needsFullGraph(prompt, snapshot, graph) &&
      graph.nodes.length < MIN_NODES_FOR_FULL_DESIGN
    ) {
      const retry = await requestStructuredGraph(
        apiKey,
        snapshot,
        prompt,
        `The previous graph only had ${graph.nodes.length} node(s). Return the FULL architecture for this request: clients only if needed, plus gateway, each service, each datastore, cache, queue, and integrations named or implied. Do not stop at a Web and Mobile client.`,
      );

      if (typeof retry !== "string" && retry.nodes.length > graph.nodes.length) {
        graph = retry;
      }
    }
  }

  if (
    typeof graph !== "string" &&
    needsFullGraph(prompt, snapshot, graph) &&
    graph.nodes.length < MIN_NODES_FOR_FULL_DESIGN
  ) {
    const unconstrained = await requestUnstructuredGraph(
      apiKey,
      snapshot,
      prompt,
    );

    if (
      typeof unconstrained !== "string" &&
      unconstrained.nodes.length > graph.nodes.length
    ) {
      graph = unconstrained;
    }
  }

  if (typeof graph === "string") {
    const unconstrained = await requestUnstructuredGraph(
      apiKey,
      snapshot,
      prompt,
    );
    if (typeof unconstrained === "string") {
      return graph;
    }
    graph = unconstrained;
  }

  return graphToPlan(graph, snapshot);
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

      const plan = await requestCanvasPlan(apiKey, snapshot, prompt);

      if (typeof plan === "string") {
        await fail(plan);
        throw new AbortTaskRunError(plan);
      }

      applied = true;

      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        (flow) => {
          applyAiCanvasPlan(flow, plan, (cursor) => {
            if (!isFinitePosition(cursor)) {
              return;
            }

            void setAiPresence({
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
        nodeCount: plan.operations.filter((operation) => operation.type === "addNode")
          .length,
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
