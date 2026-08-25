"use client";

import { useEffect, useState } from "react";
import { useEventListener } from "@liveblocks/react/suspense";

import type { AiStatusEvent } from "@/lib/ai-room";

const COMPLETE_HIDE_MS = 6000;

export function useAiStatus(): AiStatusEvent | null {
  const [status, setStatus] = useState<AiStatusEvent | null>(null);

  useEventListener(({ event }) => {
    if (event.type === "ai-status") {
      setStatus(event);
    }
  });

  useEffect(() => {
    if (status?.step !== "complete") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStatus(null);
    }, COMPLETE_HIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status]);

  return status;
}
