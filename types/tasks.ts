export const AI_STATUS_FEED = "ai-status-feed";

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
