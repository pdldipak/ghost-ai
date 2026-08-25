"use client";

import { Bot } from "lucide-react";

import { useAiStatus } from "@/hooks/use-ai-status";
import { cn } from "@/lib/utils";

export function AiStatusFeed() {
  const status = useAiStatus();

  if (!status) {
    return null;
  }

  const toneClass =
    status.step === "failure"
      ? "text-state-error"
      : status.step === "complete"
        ? "text-state-success"
        : "text-ai-text";

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-20 w-[min(100%-2rem,28rem)] -translate-x-1/2">
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-2 rounded-xl border border-surface-border bg-elevated/95 px-3 py-2 shadow-lg"
      >
        <Bot className={cn("mt-0.5 size-4 shrink-0", toneClass)} aria-hidden />
        <p className={cn("text-sm leading-5", toneClass)}>{status.message}</p>
      </div>
    </div>
  );
}
