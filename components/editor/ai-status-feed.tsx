"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

import { useAiStatusFeed } from "@/hooks/use-ai-status";
import { cn } from "@/lib/utils";
import { AI_STATUS_FEED, getAiStatusDisplayText, type AiStatusEvent } from "@/types/tasks";

const COMPLETE_HIDE_MS = 6000;

export function AiStatusFeed() {
  const status = useAiStatusFeed();
  const [dismissedStatus, setDismissedStatus] = useState<AiStatusEvent | null>(
    null,
  );

  useEffect(() => {
    if (status?.step !== "complete") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDismissedStatus(status);
    }, COMPLETE_HIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [status]);

  const text = status ? getAiStatusDisplayText(status) : "";

  if (!status || status === dismissedStatus || text.length === 0) {
    return null;
  }

  const toneClass =
    status.step === "failure"
      ? "text-state-error"
      : status.step === "complete"
        ? "text-state-success"
        : "text-ai-text";

  return (
    <div
      data-ai-status-feed={AI_STATUS_FEED}
      className="pointer-events-none absolute top-4 left-1/2 z-20 w-[min(100%-2rem,28rem)] -translate-x-1/2"
    >
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-2 rounded-xl border border-surface-border bg-elevated/95 px-3 py-2 shadow-lg"
      >
        <Bot className={cn("mt-0.5 size-4 shrink-0", toneClass)} aria-hidden />
        <p className={cn("text-sm leading-5", toneClass)}>{text}</p>
      </div>
    </div>
  );
}
