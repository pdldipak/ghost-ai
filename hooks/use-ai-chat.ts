"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useSelf,
  useStatus,
} from "@liveblocks/react/suspense";

import { AI_USER_ID, AI_USER_NAME } from "@/lib/ai-identity";
import {
  parseAiChatEvent,
  type AiChatEvent,
  type AiChatRole,
} from "@/types/tasks";

export { AI_CHAT_FEED } from "@/types/tasks";

const FALLBACK_SENDER = "Guest";

function appendMessage(
  current: AiChatEvent[],
  incoming: AiChatEvent,
): AiChatEvent[] {
  if (current.some((message) => message.id === incoming.id)) {
    return current;
  }

  return [...current, incoming];
}

interface UseAiChatFeedOptions {
  projectId: string;
  seedMessages: AiChatEvent[];
  seedGeneration: number;
  persistEnabled: boolean;
  onPersistMessage: (message: AiChatEvent) => void;
}

export function useAiChatFeed({
  seedMessages,
  seedGeneration,
  persistEnabled,
  onPersistMessage,
}: UseAiChatFeedOptions) {
  const [messages, setMessages] = useState<AiChatEvent[]>(seedMessages);
  const broadcast = useBroadcastEvent();
  const connectionStatus = useStatus();
  const selfId = useSelf((me) => me.id);
  const selfName = useSelf((me) => me.info.name);
  const persistRef = useRef({ persistEnabled, onPersistMessage, seedMessages });
  const [seenGeneration, setSeenGeneration] = useState(seedGeneration);

  if (seenGeneration !== seedGeneration) {
    setSeenGeneration(seedGeneration);
    setMessages(seedMessages);
  }

  useEffect(() => {
    persistRef.current = { persistEnabled, onPersistMessage, seedMessages };
  }, [onPersistMessage, persistEnabled, seedMessages]);

  useEventListener(({ event }) => {
    const parsed = parseAiChatEvent(event);

    if (!parsed) {
      return;
    }

    setMessages((current) => appendMessage(current, parsed));
    if (persistRef.current.persistEnabled) {
      persistRef.current.onPersistMessage(parsed);
    }
  });

  const sendChatMessage = useCallback(
    (content: string, role: AiChatRole): boolean => {
      const trimmed = content.trim();

      if (trimmed.length === 0) {
        return false;
      }

      if (connectionStatus !== "connected") {
        return false;
      }

      const isAssistant = role === "assistant";
      const senderId = isAssistant ? AI_USER_ID : (selfId?.trim() ?? "");
      const sender = isAssistant
        ? AI_USER_NAME
        : selfName.trim() || FALLBACK_SENDER;
      const timestamp = Date.now();
      const parsed = parseAiChatEvent({
        type: "ai-chat",
        id: `ai-chat-${senderId}-${timestamp}`,
        sender,
        senderId,
        role,
        content: trimmed,
        timestamp,
      });

      if (!parsed) {
        return false;
      }

      try {
        broadcast(parsed);
        setMessages((current) => appendMessage(current, parsed));
        if (persistEnabled) {
          onPersistMessage(parsed);
        }
        return true;
      } catch {
        return false;
      }
    },
    [
      broadcast,
      connectionStatus,
      onPersistMessage,
      persistEnabled,
      selfId,
      selfName,
    ],
  );

  const sendMessage = useCallback(
    (content: string): boolean => sendChatMessage(content, "user"),
    [sendChatMessage],
  );

  const sendAssistantMessage = useCallback(
    (content: string): boolean => sendChatMessage(content, "assistant"),
    [sendChatMessage],
  );

  return {
    messages,
    sendMessage,
    sendAssistantMessage,
    currentUserId: selfId,
  };
}
