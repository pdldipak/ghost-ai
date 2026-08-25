"use client";

import { useCallback, useEffect, useState } from "react";

import {
  parseAiMemorySnapshot,
  type AiChatEvent,
  type StoredSpecCard,
} from "@/types/tasks";

interface UseAiMemoryResult {
  persistEnabled: boolean;
  hasSavedData: boolean;
  seedMessages: AiChatEvent[];
  seedSpecs: StoredSpecCard[];
  seedGeneration: number;
  isLoading: boolean;
  error: string | null;
  setPersistEnabled: (
    enabled: boolean,
    sessionMessages: AiChatEvent[],
  ) => Promise<boolean>;
  persistMessage: (message: AiChatEvent) => void;
  clearSaved: () => Promise<boolean>;
}

function memoryUrl(projectId: string): string {
  return `/api/projects/${encodeURIComponent(projectId)}/ai-memory`;
}

export function useAiMemory(projectId: string): UseAiMemoryResult {
  const [persistEnabled, setPersistEnabledState] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [seedMessages, setSeedMessages] = useState<AiChatEvent[]>([]);
  const [seedSpecs, setSeedSpecs] = useState<StoredSpecCard[]>([]);
  const [seedGeneration, setSeedGeneration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(memoryUrl(projectId));
        const body: unknown = await response.json().catch(() => null);
        if (cancelled) {
          return;
        }

        const parsed = parseAiMemorySnapshot(body);

        if (!response.ok || !parsed) {
          setError("Couldn't load saved workspace history.");
          setSeedMessages([]);
          setSeedSpecs([]);
          setSeedGeneration((current) => current + 1);
          return;
        }

        setPersistEnabledState(parsed.persistAiData);
        setHasSavedData(parsed.hasSavedData);
        setSeedMessages(parsed.messages);
        setSeedSpecs(parsed.specs);
        setSeedGeneration((current) => current + 1);
      } catch {
        if (!cancelled) {
          setError("Couldn't load saved workspace history.");
          setSeedMessages([]);
          setSeedSpecs([]);
          setSeedGeneration((current) => current + 1);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const persistMessage = useCallback(
    (message: AiChatEvent) => {
      if (!persistEnabled) {
        return;
      }

      void fetch(`${memoryUrl(projectId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      }).then((response) => {
        if (response.ok) {
          setHasSavedData(true);
        }
      });
    },
    [persistEnabled, projectId],
  );

  const setPersistEnabled = useCallback(
    async (enabled: boolean, sessionMessages: AiChatEvent[]) => {
      setError(null);

      try {
        const response = await fetch(memoryUrl(projectId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persistAiData: enabled }),
        });

        if (!response.ok) {
          setError("Couldn't update Save history.");
          return false;
        }

        setPersistEnabledState(enabled);

        if (enabled && sessionMessages.length > 0) {
          await fetch(`${memoryUrl(projectId)}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: sessionMessages }),
          });
        }

        const snapshotResponse = await fetch(memoryUrl(projectId));
        const snapshotBody: unknown = await snapshotResponse.json().catch(
          () => null,
        );
        const parsed = parseAiMemorySnapshot(snapshotBody);

        if (parsed) {
          setPersistEnabledState(parsed.persistAiData);
          setHasSavedData(parsed.hasSavedData);
          if (enabled) {
            setSeedMessages(parsed.messages);
            setSeedSpecs(parsed.specs);
            setSeedGeneration((current) => current + 1);
          }
        }

        return true;
      } catch {
        setError("Couldn't update Save history.");
        return false;
      }
    },
    [projectId],
  );

  const clearSaved = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch(memoryUrl(projectId), {
        method: "DELETE",
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          body !== null &&
          typeof body === "object" &&
          typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : "Couldn't clear saved data.";
        setError(message);
        return false;
      }

      setHasSavedData(false);
      setSeedMessages([]);
      setSeedSpecs([]);
      setSeedGeneration((current) => current + 1);
      return true;
    } catch {
      setError("Couldn't clear saved data.");
      return false;
    }
  }, [projectId]);

  return {
    persistEnabled,
    hasSavedData,
    seedMessages,
    seedSpecs,
    seedGeneration,
    isLoading,
    error,
    setPersistEnabled,
    persistMessage,
    clearSaved,
  };
}
