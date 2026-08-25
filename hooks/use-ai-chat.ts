"use client";

import { useCallback, useState } from "react";
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

export function useAiChatFeed() {
  const [messages, setMessages] = useState<AiChatEvent[]>([]);
  const broadcast = useBroadcastEvent();
  const connectionStatus = useStatus();
  const selfId = useSelf((me) => me.id);
  const selfName = useSelf((me) => me.info.name);

  useEventListener(({ event }) => {
    const parsed = parseAiChatEvent(event);

    if (!parsed) {
      return;
    }

    setMessages((current) => appendMessage(current, parsed));
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
        return true;
      } catch {
        return false;
      }
    },
    [broadcast, connectionStatus, selfId, selfName],
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
