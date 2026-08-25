"use client";

import { useState, type KeyboardEvent } from "react";
import {
  Bot,
  Download,
  FileText,
  Loader2,
  SendHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiChatFeed } from "@/hooks/use-ai-chat";
import {
  useAiGenerationActive,
  useAiStatusFeed,
} from "@/hooks/use-ai-status";
import { cn } from "@/lib/utils";
import {
  AI_CHAT_FEED,
  AI_STATUS_FEED,
  getAiStatusDisplayText,
  type AiChatEvent,
  type AiStatusEvent,
} from "@/types/tasks";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const SEND_ERROR_TEXT = "Couldn't send message. Try again.";
const FALLBACK_SENDER = "Guest";

const DEMO_SPEC = {
  title: "Checkout service architecture",
  snippet:
    "A high-level spec covering the storefront, checkout API, payments, and order events.",
} as const;

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AiChatFeed {
  messages: AiChatEvent[];
  sendMessage: (content: string) => boolean;
  currentUserId: string | undefined;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const status = useAiStatusFeed();
  const isGenerating = useAiGenerationActive(status);
  const statusText = status ? getAiStatusDisplayText(status) : "";
  const statusToneClass = getStatusToneClass(status);
  const chat = useAiChatFeed();

  return (
    <aside
      aria-hidden={!isOpen}
      data-ai-status-feed={AI_STATUS_FEED}
      className={cn(
        "fixed top-12 right-0 z-40 flex h-[calc(100vh-3rem)] w-80 flex-col border-l border-surface-border bg-surface/95 shadow-lg transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-surface-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-elevated text-ai-text">
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Bot className="size-4" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-copy">AI Workspace</h2>
            {statusText ? (
              <p
                role="status"
                aria-live="polite"
                className={cn("truncate text-xs", statusToneClass)}
              >
                {statusText}
              </p>
            ) : (
              <p className="text-xs text-copy-muted">
                Collaborate with Ghost AI
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X />
        </Button>
      </div>

      <Tabs
        defaultValue="ai-architect"
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-4 mt-3 w-auto shrink-0">
          <TabsTrigger
            value="ai-architect"
            className="text-copy-muted data-active:bg-accent-dim data-active:text-brand dark:data-active:border-transparent dark:data-active:bg-accent-dim dark:data-active:text-brand"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="text-copy-muted data-active:bg-accent-dim data-active:text-brand dark:data-active:border-transparent dark:data-active:bg-accent-dim dark:data-active:text-brand"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ai-architect"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AiArchitectTab isGenerating={isGenerating} chat={chat} />
        </TabsContent>

        <TabsContent
          value="specs"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function getStatusToneClass(status: AiStatusEvent | null): string {
  if (status?.step === "failure") {
    return "text-state-error";
  }

  if (status?.step === "complete") {
    return "text-state-success";
  }

  return "text-ai-text";
}

function AiArchitectTab({
  isGenerating,
  chat,
}: {
  isGenerating: boolean;
  chat: AiChatFeed;
}) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const { messages, sendMessage, currentUserId } = chat;

  const submitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || isGenerating) {
      return;
    }

    const sent = sendMessage(trimmed);

    if (!sent) {
      setSendError(SEND_ERROR_TEXT);
      return;
    }

    setDraft("");
    setSendError(null);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    submitDraft();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <ArchitectEmptyState
            isGenerating={isGenerating}
            onSelectPrompt={(prompt) => {
              setDraft(prompt);
              setSendError(null);
            }}
          />
        ) : (
          <div
            data-ai-chat-feed={AI_CHAT_FEED}
            className="flex flex-col gap-3 px-4 py-3"
          >
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-surface-border p-4">
        <Textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (sendError) {
              setSendError(null);
            }
          }}
          onKeyDown={handleComposerKeyDown}
          placeholder="Describe the system you want to design"
          className="min-h-[72px] max-h-40 resize-none overflow-y-auto"
          aria-label="AI prompt"
          disabled={isGenerating}
        />
        <Button
          type="button"
          className="mt-3 w-full bg-brand text-primary-foreground hover:bg-brand/80"
          onClick={submitDraft}
          disabled={isGenerating || draft.trim().length === 0}
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
          {isGenerating ? "Working…" : "Send"}
        </Button>
        {sendError ? (
          <p className="mt-2 text-xs text-state-error" role="alert">
            {sendError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ArchitectEmptyState({
  isGenerating,
  onSelectPrompt,
}: {
  isGenerating: boolean;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-elevated text-ai-text">
        <Bot className="size-5" aria-hidden />
      </div>
      <p className="mt-3 text-sm text-copy-muted">
        Ask Ghost AI to sketch an architecture from a prompt.
      </p>
      <div className="mt-4 flex w-full flex-col gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full bg-elevated px-3 py-1.5 text-left text-xs text-ai-text disabled:opacity-50"
            onClick={() => onSelectPrompt(prompt)}
            disabled={isGenerating}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatChatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function ChatBubble({
  message,
  currentUserId,
}: {
  message: AiChatEvent;
  currentUserId: string | undefined;
}) {
  const isOwn =
    message.role === "user" &&
    Boolean(currentUserId) &&
    message.senderId === currentUserId;
  const sender = message.sender.trim() || FALLBACK_SENDER;

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        <div
          className={cn(
            "mb-1 flex items-baseline gap-1.5 text-[10px] text-copy-muted",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span className="truncate font-medium">{sender}</span>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatChatTimestamp(message.timestamp)}
          </time>
        </div>
        <p
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            isOwn
              ? "bg-accent-dim border-2 border-brand/50 text-copy"
              : "border border-surface-border bg-elevated text-ai-text",
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
      <Button
        type="button"
        className="w-full bg-brand text-primary-foreground hover:bg-brand/80"
      >
        Generate Spec
      </Button>

      <article className="rounded-2xl border border-surface-border bg-elevated p-3">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface text-copy-muted">
            <FileText className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-copy">{DEMO_SPEC.title}</h3>
            <p className="mt-1 text-xs text-copy-muted">{DEMO_SPEC.snippet}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          disabled
        >
          <Download />
          Download
        </Button>
      </article>
    </div>
  );
}
