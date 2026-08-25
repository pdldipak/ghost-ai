import {
  AI_USER_COLOR,
  AI_USER_ID,
  AI_USER_NAME,
} from "@/lib/ai-identity";
import { liveblocks } from "@/lib/liveblocks";
import type { AiStatusEvent, AiStatusStep } from "@/types/tasks";

export type { AiStatusEvent, AiStatusStep } from "@/types/tasks";
export { AI_USER_COLOR, AI_USER_ID, AI_USER_NAME };
export const AI_PRESENCE_TTL_SECONDS = 120;
export const AI_PRESENCE_LEAVE_TTL_SECONDS = 2;

export const AI_STATUS_MESSAGES: Record<AiStatusStep, string> = {
  start: "Analyzing the request and current canvas…",
  processing: "Updating the architecture on the canvas…",
  complete: "Architecture update complete.",
  failure: "Unable to complete this architecture update.",
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
    text: message,
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
