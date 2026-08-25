import { liveblocks } from "@/lib/liveblocks";

export const AI_USER_ID = "ghost-ai";
export const AI_USER_NAME = "Ghost AI";
export const AI_USER_COLOR = "#6457f9";
export const AI_PRESENCE_TTL_SECONDS = 120;
export const AI_PRESENCE_LEAVE_TTL_SECONDS = 2;

export type AiStatusStep = "start" | "processing" | "complete" | "failure";

export interface AiStatusEvent {
  type: "ai-status";
  step: AiStatusStep;
  message: string;
}

export const AI_STATUS_MESSAGES: Record<AiStatusStep, string> = {
  start: "Ghost AI started designing…",
  processing: "Ghost AI is updating the canvas…",
  complete: "Ghost AI finished designing.",
  failure: "Ghost AI could not complete this design.",
};

interface AiPresenceInput {
  roomId: string;
  cursor: { x: number; y: number } | null;
  isThinking: boolean;
  ttl?: number;
}

export async function publishAiStatus(
  roomId: string,
  step: AiStatusStep,
  message = AI_STATUS_MESSAGES[step],
): Promise<void> {
  const event: AiStatusEvent = {
    type: "ai-status",
    step,
    message,
  };

  await liveblocks.broadcastEvent(roomId, event);
}

export async function setAiPresence({
  roomId,
  cursor,
  isThinking,
  ttl = AI_PRESENCE_TTL_SECONDS,
}: AiPresenceInput): Promise<void> {
  await liveblocks.setPresence(roomId, {
    userId: AI_USER_ID,
    data: {
      cursor,
      isThinking,
    },
    userInfo: {
      name: AI_USER_NAME,
      avatar: "",
      color: AI_USER_COLOR,
    },
    ttl,
  });
}

export async function clearAiPresence(roomId: string): Promise<void> {
  await setAiPresence({
    roomId,
    cursor: null,
    isThinking: false,
    ttl: AI_PRESENCE_LEAVE_TTL_SECONDS,
  });
}
