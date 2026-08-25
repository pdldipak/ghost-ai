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

interface ExplainArchitecturePayload {
  projectId?: string;
  roomId?: string;
  prompt?: string;
  history?: ChatHistoryTurn[];
}

const MAX_HISTORY_TURNS = 8;
const MAX_TURN_CHARS = 2000;

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

function buildSystemPrompt(): string {
  return `You are Ghost Assistant, a senior software architect in a collaborative design workspace.

Answer the user's question using the current canvas graph. Name real components and flows from the canvas. Do not invent services that are not on the canvas unless the user asks for suggestions.

Write a clear professional reply in short paragraphs. Do not return JSON, canvas operations, or internal implementation details. Do not claim you changed the diagram.

If the canvas is empty, say there is no design to explain yet and invite them to generate one in AI Architect.`;
}

function buildUserPrompt(
  canvasJson: string,
  prompt: string,
  history: { role: AiChatRole; content: string }[],
): string {
  const lines = [
    "CURRENT CANVAS",
    canvasJson,
    "",
  ];

  if (history.length > 0) {
    lines.push("RECENT DISCUSSION");
    for (const turn of history) {
      lines.push(`${turn.role}: ${turn.content}`);
    }
    lines.push("");
  }

  lines.push("QUESTION", prompt);

  return lines.join("\n");
}

export const explainArchitecture = task({
  id: "explain-architecture",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: ExplainArchitecturePayload, { ctx }) => {
    const roomId = readPayloadString(payload?.projectId, payload?.roomId);
    const prompt = readPayloadString(payload?.prompt);
    const history = readHistory(payload?.history);

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
      "explain-architecture",
      roomId,
      prompt,
      "attempt",
      ctx.attempt.number,
    );

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
        prompt,
        history,
      ),
    });

    const summary = result.text.trim();

    if (!summary) {
      throw new AbortTaskRunError(
        "Ghost AI returned an empty reply. Please try again.",
      );
    }

    return {
      projectId: roomId,
      prompt,
      summary,
    };
  },
});
