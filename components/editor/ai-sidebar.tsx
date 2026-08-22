"use client";

import { useState, type KeyboardEvent } from "react";
import { Bot, Download, FileText, SendHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const ASSISTANT_PLACEHOLDER =
  "This is a demo reply. Architecture generation is not connected yet.";

const DEMO_SPEC = {
  title: "Checkout service architecture",
  snippet:
    "A high-level spec covering the storefront, checkout API, payments, and order events.",
} as const;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-12 right-0 z-40 flex h-[calc(100vh-3rem)] w-80 flex-col border-l border-surface-border bg-surface/95 shadow-lg transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-surface-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-elevated text-ai-text">
            <Bot className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-copy">AI Workspace</h2>
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
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
          <AiArchitectTab />
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

function AiArchitectTab() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return;
    }

    const timestamp = Date.now();
    setMessages((current) => [
      ...current,
      { id: `user-${timestamp}`, role: "user", content: trimmed },
      {
        id: `assistant-${timestamp}`,
        role: "assistant",
        content: ASSISTANT_PLACEHOLDER,
      },
    ]);
    setDraft("");
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <ArchitectEmptyState onSelectPrompt={setDraft} />
        ) : (
          <div className="flex flex-col gap-3 px-4 py-3">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-surface-border p-4">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Describe the system you want to design"
          className="min-h-[72px] max-h-40 resize-none overflow-y-auto"
          aria-label="AI prompt"
        />
        <Button
          type="button"
          className="mt-3 w-full bg-brand text-primary-foreground hover:bg-brand/80"
          onClick={() => sendMessage(draft)}
          disabled={draft.trim().length === 0}
        >
          <SendHorizontal />
          Send
        </Button>
      </div>
    </div>
  );
}

function ArchitectEmptyState({
  onSelectPrompt,
}: {
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
            className="rounded-full bg-elevated px-3 py-1.5 text-left text-xs text-ai-text"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "bg-accent-dim border-2 border-brand/50 text-copy"
            : "border border-surface-border bg-elevated text-ai-text",
        )}
      >
        {message.content}
      </p>
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
