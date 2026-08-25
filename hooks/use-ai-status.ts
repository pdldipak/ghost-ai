"use client";

import { useState } from "react";
import {
  useEventListener,
  useOthersMapped,
  useSelf,
} from "@liveblocks/react/suspense";

import {
  isAiStatusActive,
  parseAiStatusEvent,
  type AiStatusEvent,
} from "@/types/tasks";

export { AI_STATUS_FEED } from "@/types/tasks";

export function useAiStatusFeed(): AiStatusEvent | null {
  const [status, setStatus] = useState<AiStatusEvent | null>(null);

  useEventListener(({ event }) => {
    const parsed = parseAiStatusEvent(event);

    if (!parsed) {
      return;
    }

    setStatus(parsed);
  });

  return status;
}

export function useAiStatus(): AiStatusEvent | null {
  return useAiStatusFeed();
}

export function useAiGenerationActive(status: AiStatusEvent | null): boolean {
  const othersThinking = useOthersMapped((other) => other.presence.isThinking);
  const isSelfThinking = useSelf((me) => me.presence.isThinking === true);
  const isAnyoneThinking =
    isSelfThinking || othersThinking.some(([, thinking]) => thinking === true);

  return isAnyoneThinking || isAiStatusActive(status);
}
