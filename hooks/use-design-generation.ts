"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

import { parseDesignTriggerResponse } from "@/types/tasks";
import type { generateArchitecture } from "@/trigger/generate-architecture";

const TRIGGER_ERROR_TEXT = "Couldn't start design generation. Try again.";
const SUCCESS_FALLBACK = "I've updated the architecture on the canvas.";
const FAILURE_FALLBACK =
  "I wasn't able to complete this architecture update. Please try again.";

const TERMINAL_RUN_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]);

interface ActiveDesignRun {
  runId: string;
  publicToken: string;
}

export interface DesignRunCompleteResult {
  ok: boolean;
  summary: string;
}

interface UseDesignGenerationOptions {
  projectId: string;
  onRunComplete: (result: DesignRunCompleteResult) => void;
}

function readErrorMessage(value: unknown): string | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const message = (value as { error?: unknown }).error;
  return typeof message === "string" && message.trim().length > 0
    ? message.trim()
    : null;
}

function readRunSummary(run: {
  status: string;
  output?: unknown;
  error?: unknown;
}): DesignRunCompleteResult {
  const ok = run.status === "COMPLETED";
  const output = run.output;

  if (output !== null && typeof output === "object" && !Array.isArray(output)) {
    const summary = (output as { summary?: unknown }).summary;
    if (typeof summary === "string" && summary.trim().length > 0) {
      return { ok, summary: summary.trim() };
    }
  }

  if (
    !ok &&
    run.error !== null &&
    typeof run.error === "object" &&
    "message" in run.error
  ) {
    const message = (run.error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return { ok, summary: message.trim() };
    }
  }

  return { ok, summary: ok ? SUCCESS_FALLBACK : FAILURE_FALLBACK };
}

export function useDesignGeneration({
  projectId,
  onRunComplete,
}: UseDesignGenerationOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRun, setActiveRun] = useState<ActiveDesignRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeErrorDismissed, setIsRealtimeErrorDismissed] =
    useState(false);
  const completedRunIds = useRef(new Set<string>());
  const onRunCompleteRef = useRef(onRunComplete);

  useEffect(() => {
    onRunCompleteRef.current = onRunComplete;
  }, [onRunComplete]);

  const { run, error: realtimeError } = useRealtimeRun<
    typeof generateArchitecture
  >(activeRun?.runId, {
    accessToken: activeRun?.publicToken,
    enabled: Boolean(activeRun?.runId && activeRun?.publicToken),
    id: activeRun?.runId,
    skipColumns: ["payload"],
  });

  const isRunInFlight =
    Boolean(activeRun) &&
    !realtimeError &&
    (!run || !TERMINAL_RUN_STATUSES.has(run.status));

  useEffect(() => {
    if (!run || !TERMINAL_RUN_STATUSES.has(run.status)) {
      return;
    }

    if (completedRunIds.current.has(run.id)) {
      return;
    }

    completedRunIds.current.add(run.id);
    onRunCompleteRef.current(readRunSummary(run));
  }, [run]);

  const startDesign = useCallback(
    async (prompt: string): Promise<boolean> => {
      const trimmed = prompt.trim();

      if (trimmed.length === 0 || isSubmitting || isRunInFlight) {
        return false;
      }

      setIsSubmitting(true);
      setError(null);
      setIsRealtimeErrorDismissed(false);

      try {
        const response = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed, projectId }),
        });

        let body: unknown = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }

        if (!response.ok) {
          setError(readErrorMessage(body) ?? TRIGGER_ERROR_TEXT);
          return false;
        }

        const parsed = parseDesignTriggerResponse(body);
        if (!parsed) {
          setError(TRIGGER_ERROR_TEXT);
          return false;
        }

        setActiveRun(parsed);
        return true;
      } catch {
        setError(TRIGGER_ERROR_TEXT);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRunInFlight, isSubmitting, projectId],
  );

  const clearError = useCallback(() => {
    setError(null);
    setIsRealtimeErrorDismissed(true);
  }, []);

  return {
    startDesign,
    isActive: isSubmitting || isRunInFlight,
    error:
      error ??
      (isRealtimeErrorDismissed ? null : (realtimeError?.message ?? null)),
    clearError,
  };
}
