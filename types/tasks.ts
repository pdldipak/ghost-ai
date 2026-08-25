export const AI_STATUS_FEED = "ai-status-feed";
export const AI_CHAT_FEED = "ai-chat";

export const AI_STATUS_STEPS = [
  "start",
  "processing",
  "complete",
  "failure",
] as const;

export type AiStatusStep = (typeof AI_STATUS_STEPS)[number];

export type AiStatusEvent = {
  type: "ai-status";
  step: AiStatusStep;
  text: string;
  message: string;
};

function isAiStatusStep(value: unknown): value is AiStatusStep {
  return AI_STATUS_STEPS.some((step) => step === value);
}

export function parseAiStatusEvent(value: unknown): AiStatusEvent | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  const event = value as Record<string, unknown>;

  if (event.type !== "ai-status" || !isAiStatusStep(event.step)) {
    return null;
  }

  if (event.text !== undefined && typeof event.text !== "string") {
    return null;
  }

  if (event.message !== undefined && typeof event.message !== "string") {
    return null;
  }

  const text = event.text?.trim() ?? "";
  const message = event.message?.trim() ?? "";
  const display = text || message;

  return {
    type: "ai-status",
    step: event.step,
    text: display,
    message: message || display,
  };
}

export function isAiStatusEvent(value: unknown): value is AiStatusEvent {
  return parseAiStatusEvent(value) !== null;
}

export function getAiStatusDisplayText(event: AiStatusEvent): string {
  const text = event.text.trim();
  if (text) {
    return text;
  }

  return event.message.trim();
}

export function isAiStatusActive(event: AiStatusEvent | null): boolean {
  return event?.step === "start" || event?.step === "processing";
}

export const AI_CHAT_ROLES = ["user", "assistant"] as const;

export type AiChatRole = (typeof AI_CHAT_ROLES)[number];

export type AiChatEvent = {
  type: "ai-chat";
  id: string;
  sender: string;
  senderId: string;
  role: AiChatRole;
  content: string;
  timestamp: number;
};

function isAiChatRole(value: unknown): value is AiChatRole {
  return AI_CHAT_ROLES.some((role) => role === value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseAiChatEvent(value: unknown): AiChatEvent | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  const event = value as Record<string, unknown>;

  if (event.type !== "ai-chat" || !isAiChatRole(event.role)) {
    return null;
  }

  if (!isNonEmptyString(event.id) || !isNonEmptyString(event.sender)) {
    return null;
  }

  if (!isNonEmptyString(event.senderId)) {
    return null;
  }

  if (!isNonEmptyString(event.content)) {
    return null;
  }

  if (typeof event.timestamp !== "number" || !Number.isFinite(event.timestamp)) {
    return null;
  }

  return {
    type: "ai-chat",
    id: event.id.trim(),
    sender: event.sender.trim(),
    senderId: event.senderId.trim(),
    role: event.role,
    content: event.content.trim(),
    timestamp: event.timestamp,
  };
}

export function isAiChatEvent(value: unknown): value is AiChatEvent {
  return parseAiChatEvent(value) !== null;
}

export interface ChatHistoryTurn {
  role: AiChatRole;
  content: string;
}

const MAX_CHAT_HISTORY_TURNS = 8;
const MAX_CHAT_HISTORY_CHARS = 2000;

export function parseChatHistory(value: unknown): ChatHistoryTurn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const turns: ChatHistoryTurn[] = [];

  for (const item of value.slice(-MAX_CHAT_HISTORY_TURNS)) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const turn = item as Record<string, unknown>;

    if (!isAiChatRole(turn.role) || !isNonEmptyString(turn.content)) {
      continue;
    }

    turns.push({
      role: turn.role,
      content: turn.content.trim().slice(0, MAX_CHAT_HISTORY_CHARS),
    });
  }

  return turns;
}

export interface DesignTriggerResponse {
  runId: string;
  publicToken: string;
}

export function parseDesignTriggerResponse(
  value: unknown,
): DesignTriggerResponse | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;

  if (!isNonEmptyString(body.runId) || !isNonEmptyString(body.publicToken)) {
    return null;
  }

  return {
    runId: body.runId.trim(),
    publicToken: body.publicToken.trim(),
  };
}

export interface SpecRunOutput {
  title: string;
  spec: string;
  specId: string;
}

export function parseSpecRunOutput(value: unknown): SpecRunOutput | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const output = value as Record<string, unknown>;

  if (
    !isNonEmptyString(output.title) ||
    !isNonEmptyString(output.spec) ||
    !isNonEmptyString(output.specId)
  ) {
    return null;
  }

  return {
    title: output.title.trim(),
    spec: output.spec.trim(),
    specId: output.specId.trim(),
  };
}

export interface StoredSpecCard {
  specId: string;
  title: string;
  snippet: string;
}

export interface AiMemorySnapshot {
  persistAiData: boolean;
  hasSavedData: boolean;
  messages: AiChatEvent[];
  specs: StoredSpecCard[];
}

export function parseStoredSpecCard(value: unknown): StoredSpecCard | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const card = value as Record<string, unknown>;

  if (!isNonEmptyString(card.specId) || !isNonEmptyString(card.title)) {
    return null;
  }

  return {
    specId: card.specId.trim(),
    title: card.title.trim(),
    snippet: typeof card.snippet === "string" ? card.snippet.trim() : "",
  };
}

export function parseAiMemorySnapshot(value: unknown): AiMemorySnapshot | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;

  if (typeof body.persistAiData !== "boolean" || typeof body.hasSavedData !== "boolean") {
    return null;
  }

  if (!Array.isArray(body.messages) || !Array.isArray(body.specs)) {
    return null;
  }

  const messages: AiChatEvent[] = [];
  for (const item of body.messages) {
    const parsed = parseAiChatEvent(item);
    if (parsed) {
      messages.push(parsed);
    }
  }

  const specs: StoredSpecCard[] = [];
  for (const item of body.specs) {
    const parsed = parseStoredSpecCard(item);
    if (parsed) {
      specs.push(parsed);
    }
  }

  return {
    persistAiData: body.persistAiData,
    hasSavedData: body.hasSavedData,
    messages,
    specs,
  };
}
