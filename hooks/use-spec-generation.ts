"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

import {
  parseDesignTriggerResponse,
  parseSpecRunOutput,
  type ChatHistoryTurn,
} from "@/types/tasks";
import type { generateSpec } from "@/trigger/generate-spec";

const TRIGGER_ERROR_TEXT = "Couldn't start spec generation. Try again.";
const SUCCESS_FALLBACK_TITLE = "Technical specification";
const FAILURE_FALLBACK =
  "I wasn't able to generate a specification. Please try again.";

const TERMINAL_RUN_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]);

interface ActiveSpecRun {
  runId: string;
  publicToken: string;
}

export interface SpecRunCompleteResult {
  ok: boolean;
  title: string;
  spec: string;
  specId: string;
  message: string;
}

interface UseSpecGenerationOptions {
  projectId: string;
  onRunComplete: (result: SpecRunCompleteResult) => void;
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

function readSpecResult(run: {
  status: string;
  output?: unknown;
  error?: unknown;
}): SpecRunCompleteResult {
  const ok = run.status === "COMPLETED";
  const parsed = parseSpecRunOutput(run.output);

  if (ok && parsed) {
    return {
      ok: true,
      title: parsed.title,
      spec: parsed.spec,
      specId: parsed.specId,
      message: "",
    };
  }

  if (
    !ok &&
    run.error !== null &&
    typeof run.error === "object" &&
    "message" in run.error
  ) {
    const message = (run.error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return {
        ok: false,
        title: "",
        spec: "",
        specId: "",
        message: message.trim(),
      };
    }
  }

  return {
    ok,
    title: parsed?.title ?? SUCCESS_FALLBACK_TITLE,
    spec: parsed?.spec ?? "",
    specId: parsed?.specId ?? "",
    message: ok ? "" : FAILURE_FALLBACK,
  };
}

export function useSpecGeneration({
  projectId,
  onRunComplete,
}: UseSpecGenerationOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRun, setActiveRun] = useState<ActiveSpecRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeErrorDismissed, setIsRealtimeErrorDismissed] =
    useState(false);
  const completedRunIds = useRef(new Set<string>());
  const onRunCompleteRef = useRef(onRunComplete);

  useEffect(() => {
    onRunCompleteRef.current = onRunComplete;
  }, [onRunComplete]);

  const { run, error: realtimeError } = useRealtimeRun<typeof generateSpec>(
    activeRun?.runId,
    {
      accessToken: activeRun?.publicToken,
      enabled: Boolean(activeRun?.runId && activeRun?.publicToken),
      id: activeRun?.runId,
      skipColumns: ["payload"],
    },
  );

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
    onRunCompleteRef.current(readSpecResult(run));
  }, [run]);

  const startSpec = useCallback(
    async (history: ChatHistoryTurn[] = []): Promise<boolean> => {
      if (isSubmitting || isRunInFlight) {
        return false;
      }

      setIsSubmitting(true);
      setError(null);
      setIsRealtimeErrorDismissed(false);

      try {
        const response = await fetch("/api/ai/spec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            history,
          }),
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
    startSpec,
    isActive: isSubmitting || isRunInFlight,
    error:
      error ??
      (isRealtimeErrorDismissed ? null : (realtimeError?.message ?? null)),
    clearError,
  };
}
