import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AbortTaskRunError, task } from "@trigger.dev/sdk";

import { serializeCanvasForPrompt } from "@/lib/ai-canvas-plan";
import { readCanvasSnapshot } from "@/lib/ai-canvas-snapshot";
import { generateText } from "@/lib/ai-sdk";
import { getGeminiApiKey } from "@/lib/gemini";
import { liveblocks } from "@/lib/liveblocks";
import type { AiChatRole } from "@/types/tasks";

interface ChatHistoryTurn {
  role?: AiChatRole | string;
  content?: string;
}

interface GenerateSpecPayload {
  projectId?: string;
  /** Alias for projectId. In this app the Liveblocks room ID is the project ID. */
  roomId?: string;
  history?: ChatHistoryTurn[];
}

const MAX_HISTORY_TURNS = 8;
const MAX_TURN_CHARS = 2000;
const FALLBACK_TITLE = "Technical specification";

function readPayloadString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function readHistory(value: unknown): { role: AiChatRole; content: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const turns: { role: AiChatRole; content: string }[] = [];

  for (const item of value.slice(-MAX_HISTORY_TURNS)) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const turn = item as ChatHistoryTurn;
    const role = turn.role;
    const content =
      typeof turn.content === "string" ? turn.content.trim() : "";

    if ((role !== "user" && role !== "assistant") || content.length === 0) {
      continue;
    }

    turns.push({
      role,
      content: content.slice(0, MAX_TURN_CHARS),
    });
  }

  return turns;
}

function requireGeminiApiKey(): string {
  const key = getGeminiApiKey();

  if (!key) {
    throw new AbortTaskRunError(
      "GOOGLE_AI_API_KEY is not set. Add it to .env.local and the Trigger.dev worker env.",
    );
  }

  return key;
}

function unwrapMarkdown(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);

  return (fenced?.[1] ?? trimmed).trim();
}

function readTitle(markdown: string): string {
  const heading = markdown.match(/^#\s+(.+?)\s*$/m);
  const title = heading?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  return title || FALLBACK_TITLE;
}

function buildSystemPrompt(): string {
  return `You are Ghost Assistant, a senior software architect in a collaborative design workspace.

Write a durable technical specification from the current canvas graph. Ground every component and flow in the canvas nodes and edge labels. Do not invent services that are not on the canvas.

Output Markdown only. Do not return JSON, canvas operations, or internal implementation details. Do not mention Trigger.dev, Liveblocks, or prompt internals.

Start with a single H1 title. Then include overview, components, data flows, integrations, and open questions when the graph implies them. Use clear user-facing language.

If the canvas is empty, return a short Markdown note that there is no design to specify yet. Do not invent a system.

Use recent discussion only as context. The graph is the source of truth.`;
}

function buildUserPrompt(
  canvasJson: string,
  isEmpty: boolean,
  history: { role: AiChatRole; content: string }[],
): string {
  const lines = ["CURRENT CANVAS", canvasJson, ""];

  if (history.length > 0) {
    lines.push("RECENT DISCUSSION");
    for (const turn of history) {
      lines.push(`${turn.role}: ${turn.content}`);
    }
    lines.push("");
  }

  if (isEmpty) {
    lines.push(
      "The canvas has no nodes. Write a short Markdown note that there is no design to specify yet. Do not invent a system.",
    );
  } else {
    lines.push(
      "Write a technical specification of this architecture from the canvas graph.",
    );
  }

  return lines.join("\n");
}

export const generateSpec = task({
  id: "generate-spec",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: GenerateSpecPayload, { ctx }) => {
    const roomId = readPayloadString(payload?.projectId, payload?.roomId);
    const history = readHistory(payload?.history);

    if (!roomId) {
      throw new AbortTaskRunError(
        "projectId (or roomId) is required and must be a non-empty string",
      );
    }

    console.log("generate-spec", roomId, "attempt", ctx.attempt.number);

    const apiKey = requireGeminiApiKey();

    await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [],
    });

    const snapshot = await readCanvasSnapshot(roomId);
    const google = createGoogleGenerativeAI({ apiKey });
    const result = await generateText({
      model: google("gemini-3.6-flash"),
      system: buildSystemPrompt(),
      prompt: buildUserPrompt(
        serializeCanvasForPrompt(snapshot),
        snapshot.nodes.length === 0,
        history,
      ),
    });

    const spec = unwrapMarkdown(result.text);

    if (!spec) {
      throw new AbortTaskRunError(
        "Ghost AI returned an empty specification. Please try again.",
      );
    }

    return {
      title: readTitle(spec),
      spec,
    };
  },
});
