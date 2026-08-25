"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import {
  Bot,
  Download,
  FileText,
  History,
  Loader2,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { ClearAiMemoryDialog } from "@/components/editor/clear-ai-memory-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiChatFeed } from "@/hooks/use-ai-chat";
import { useAiMemory } from "@/hooks/use-ai-memory";
import {
  useAiGenerationActive,
  useAiStatusFeed,
} from "@/hooks/use-ai-status";
import { useChatReply } from "@/hooks/use-chat-reply";
import {
  useDesignGeneration,
  type DesignRunCompleteResult,
} from "@/hooks/use-design-generation";
import {
  useSpecGeneration,
  type SpecRunCompleteResult,
} from "@/hooks/use-spec-generation";
import { specSnippet } from "@/lib/spec-meta";
import { cn } from "@/lib/utils";
import {
  AI_CHAT_FEED,
  AI_STATUS_FEED,
  getAiStatusDisplayText,
  type AiChatEvent,
  type AiStatusEvent,
  type StoredSpecCard,
} from "@/types/tasks";

const STARTER_PROMPTS = [
  "Design an e-commerce platform with checkout and payments",
  "Map a real-time messaging architecture",
  "Outline a CI/CD pipeline from commit to production",
] as const;

const SEND_ERROR_TEXT = "Couldn't send message. Try again.";
const FALLBACK_SENDER = "Guest";

const TAB_TRIGGER_CLASS =
  "px-1 text-xs text-copy-muted data-active:bg-accent-dim data-active:text-brand dark:data-active:border-transparent dark:data-active:bg-accent-dim dark:data-active:text-brand";

const DOWNLOAD_ERROR_TEXT = "Couldn't download this spec. Try again.";

type SpecDownloadFormat = "markdown" | "pdf";

interface GeneratedSpecCard {
  specId: string;
  title: string;
  snippet: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface AiChatFeed {
  messages: AiChatEvent[];
  sendMessage: (content: string) => boolean;
  sendAssistantMessage: (content: string) => boolean;
  currentUserId: string | undefined;
}

export function AiSidebar({ isOpen, onClose, projectId }: AiSidebarProps) {
  const status = useAiStatusFeed();
  const isGenerating = useAiGenerationActive(status);
  const statusText = status ? getAiStatusDisplayText(status) : "";
  const statusToneClass = getStatusToneClass(status);
  const memory = useAiMemory(projectId);
  const chat = useAiChatFeed({
    projectId,
    seedMessages: memory.seedMessages,
    seedGeneration: memory.seedGeneration,
    persistEnabled: memory.persistEnabled,
    onPersistMessage: memory.persistMessage,
  });
  const sendAssistantMessage = chat.sendAssistantMessage;

  const handleRunComplete = useCallback(
    (result: DesignRunCompleteResult) => {
      sendAssistantMessage(result.summary);
    },
    [sendAssistantMessage],
  );

  const generation = useDesignGeneration({
    projectId,
    onRunComplete: handleRunComplete,
  });
  const chatReply = useChatReply({
    projectId,
    onRunComplete: handleRunComplete,
  });
  const [generatedSpecs, setGeneratedSpecs] = useState<GeneratedSpecCard[]>(
    [],
  );
  const [specCompleteError, setSpecCompleteError] = useState<string | null>(
    null,
  );
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSpecComplete = useCallback((result: SpecRunCompleteResult) => {
    if (!result.ok || result.specId.length === 0) {
      setSpecCompleteError(result.message);
      return;
    }

    setSpecCompleteError(null);
    setGeneratedSpecs((current) => [
      {
        specId: result.specId,
        title: result.title,
        snippet: specSnippet(result.spec),
      },
      ...current,
    ]);
  }, [setGeneratedSpecs, setSpecCompleteError]);

  const specGeneration = useSpecGeneration({
    projectId,
    onRunComplete: handleSpecComplete,
  });

  const specs: StoredSpecCard[] = memory.persistEnabled
    ? [
        ...generatedSpecs,
        ...memory.seedSpecs.filter(
          (spec) =>
            !generatedSpecs.some((item) => item.specId === spec.specId),
        ),
      ]
    : generatedSpecs;

  const isBusy = isGenerating || generation.isActive;
  const isChatBusy = chatReply.isActive;
  const isSpecBusy = specGeneration.isActive;
  const headerBusy = isBusy || isChatBusy || isSpecBusy;

  const handleClearSaved = async () => {
    setIsClearing(true);
    const ok = await memory.clearSaved();
    setIsClearing(false);

    if (ok) {
      setGeneratedSpecs([]);
      setIsClearDialogOpen(false);
    }
  };

  return (
    <>
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
            {headerBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Bot className="size-4" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-copy">AI Workspace</h2>
            {isChatBusy ? (
              <p role="status" aria-live="polite" className="truncate text-xs text-ai-text">
                Thinking…
              </p>
            ) : isSpecBusy ? (
              <p role="status" aria-live="polite" className="truncate text-xs text-ai-text">
                Writing specification…
              </p>
            ) : statusText ? (
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

      <div className="flex items-center gap-2 border-b border-surface-border px-4 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-w-0 flex-1 justify-start text-copy-muted"
          aria-pressed={memory.persistEnabled}
          onClick={() => {
            void memory.setPersistEnabled(
              !memory.persistEnabled,
              chat.messages,
            );
          }}
        >
          <History />
          {memory.persistEnabled ? "Save history on" : "Save history off"}
        </Button>
        {!memory.persistEnabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!memory.hasSavedData || isClearing}
            onClick={() => {
              setIsClearDialogOpen(true);
            }}
          >
            <Trash2 />
            Clear
          </Button>
        ) : null}
      </div>
      {memory.error ? (
        <p className="px-4 py-2 text-xs text-state-error" role="alert">
          {memory.error}
        </p>
      ) : null}

      <Tabs
        defaultValue="ai-architect"
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)] shrink-0">
          <TabsTrigger value="ai-architect" className={TAB_TRIGGER_CLASS}>
            AI Architect
          </TabsTrigger>
          <TabsTrigger value="chat" className={TAB_TRIGGER_CLASS}>
            Chat
          </TabsTrigger>
          <TabsTrigger value="specs" className={TAB_TRIGGER_CLASS}>
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ai-architect"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AiArchitectTab
            isBusy={isBusy}
            statusText={statusText}
            statusToneClass={statusToneClass}
            chat={chat}
            triggerError={generation.error}
            onClearTriggerError={generation.clearError}
            onStartDesign={generation.startDesign}
          />
        </TabsContent>

        <TabsContent
          value="chat"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <ChatTab
            chat={chat}
            isBusy={isChatBusy}
            triggerError={chatReply.error}
            onClearTriggerError={chatReply.clearError}
            onAsk={chatReply.startChat}
          />
        </TabsContent>

        <TabsContent
          value="specs"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <SpecsTab
            projectId={projectId}
            specs={specs}
            isBusy={isSpecBusy}
            triggerError={specCompleteError ?? specGeneration.error}
            onClearTriggerError={() => {
              setSpecCompleteError(null);
              specGeneration.clearError();
            }}
            onGenerate={() => {
              setSpecCompleteError(null);
              return specGeneration.startSpec(
                chat.messages.map((message) => ({
                  role: message.role,
                  content: message.content,
                })),
              );
            }}
          />
        </TabsContent>
      </Tabs>
    </aside>
    <ClearAiMemoryDialog
      open={isClearDialogOpen}
      onOpenChange={(open) => {
        if (!isClearing) {
          setIsClearDialogOpen(open);
        }
      }}
      isLoading={isClearing}
      onConfirm={() => {
        void handleClearSaved();
      }}
    />
    </>
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
  isBusy,
  statusText,
  statusToneClass,
  chat,
  triggerError,
  onClearTriggerError,
  onStartDesign,
}: {
  isBusy: boolean;
  statusText: string;
  statusToneClass: string;
  chat: AiChatFeed;
  triggerError: string | null;
  onClearTriggerError: () => void;
  onStartDesign: (prompt: string) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const { messages, sendMessage, currentUserId } = chat;
  const displayError = sendError ?? triggerError;
  const showStatusStrip = isBusy && statusText.length > 0;

  const submitDraft = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || isBusy) {
      return;
    }

    const sent = sendMessage(trimmed);

    if (!sent) {
      setSendError(SEND_ERROR_TEXT);
      return;
    }

    setDraft("");
    setSendError(null);
    onClearTriggerError();
    await onStartDesign(trimmed);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitDraft();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <ArchitectEmptyState
            isBusy={isBusy}
            onSelectPrompt={(prompt) => {
              setDraft(prompt);
              setSendError(null);
              onClearTriggerError();
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
        {showStatusStrip ? (
          <p
            role="status"
            aria-live="polite"
            className={cn("mb-3 truncate text-xs", statusToneClass)}
          >
            {statusText}
          </p>
        ) : null}
        <Textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (sendError) {
              setSendError(null);
            }
            if (triggerError) {
              onClearTriggerError();
            }
          }}
          onKeyDown={handleComposerKeyDown}
          placeholder="Describe the system you want to design"
          className="min-h-[72px] max-h-40 resize-none overflow-y-auto bg-elevated text-copy caret-copy placeholder:text-copy-muted dark:bg-elevated dark:text-copy"
          aria-label="AI prompt"
          disabled={isBusy}
        />
        <Button
          type="button"
          className="mt-3 w-full bg-brand text-primary-foreground hover:bg-brand/80"
          onClick={() => {
            void submitDraft();
          }}
          disabled={isBusy || draft.trim().length === 0}
        >
          {isBusy ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
          {isBusy ? "Working…" : "Send"}
        </Button>
        {displayError ? (
          <p className="mt-2 text-xs text-state-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ArchitectEmptyState({
  isBusy,
  onSelectPrompt,
}: {
  isBusy: boolean;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-elevated text-ai-text">
        <Bot className="size-5" aria-hidden />
      </div>
      <p className="mt-3 text-sm text-copy-muted">
        Describe a system and Ghost AI will map it onto the shared canvas.
      </p>
      <div className="mt-4 flex w-full flex-col gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-surface-border bg-elevated px-3 py-1.5 text-left text-xs text-copy hover:bg-accent-dim hover:text-brand disabled:opacity-50"
            onClick={() => onSelectPrompt(prompt)}
            disabled={isBusy}
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
              : "border border-surface-border bg-elevated text-copy",
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

function ChatTab({
  chat,
  isBusy,
  triggerError,
  onClearTriggerError,
  onAsk,
}: {
  chat: AiChatFeed;
  isBusy: boolean;
  triggerError: string | null;
  onClearTriggerError: () => void;
  onAsk: (
    prompt: string,
    history: { role: AiChatEvent["role"]; content: string }[],
  ) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const { messages, sendMessage, currentUserId } = chat;
  const displayError = sendError ?? triggerError;

  const submitDraft = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || isBusy) {
      return;
    }

    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const sent = sendMessage(trimmed);

    if (!sent) {
      setSendError(SEND_ERROR_TEXT);
      return;
    }

    setDraft("");
    setSendError(null);
    onClearTriggerError();
    await onAsk(trimmed, history);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitDraft();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-elevated text-ai-text">
              <Bot className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm text-copy-muted">
              Ask Ghost AI about the design on the canvas. It will explain
              components and flows without changing the graph.
            </p>
          </div>
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
        {isBusy ? (
          <p
            role="status"
            aria-live="polite"
            className="mb-3 truncate text-xs text-ai-text"
          >
            Thinking…
          </p>
        ) : null}
        <Textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (sendError) {
              setSendError(null);
            }
            if (triggerError) {
              onClearTriggerError();
            }
          }}
          onKeyDown={handleComposerKeyDown}
          placeholder="Ask about the architecture"
          className="min-h-[72px] max-h-40 resize-none overflow-y-auto bg-elevated text-copy caret-copy placeholder:text-copy-muted dark:bg-elevated dark:text-copy"
          aria-label="Chat message"
          disabled={isBusy}
        />
        <Button
          type="button"
          className="mt-3 w-full bg-brand text-primary-foreground hover:bg-brand/80"
          onClick={() => {
            void submitDraft();
          }}
          disabled={isBusy || draft.trim().length === 0}
        >
          {isBusy ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
          {isBusy ? "Working…" : "Send"}
        </Button>
        {displayError ? (
          <p className="mt-2 text-xs text-state-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

async function downloadGeneratedSpec(
  projectId: string,
  specId: string,
  format: SpecDownloadFormat,
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/specs/${encodeURIComponent(specId)}/download?format=${format}`,
    );

    if (!response.ok) {
      return false;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${specId}.${format === "pdf" ? "pdf" : "md"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}

function SpecsTab({
  projectId,
  specs,
  isBusy,
  triggerError,
  onClearTriggerError,
  onGenerate,
}: {
  projectId: string;
  specs: GeneratedSpecCard[];
  isBusy: boolean;
  triggerError: string | null;
  onClearTriggerError: () => void;
  onGenerate: () => Promise<boolean>;
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const displayError = triggerError ?? downloadError;

  const handleGenerate = () => {
    setDownloadError(null);
    onClearTriggerError();
    void onGenerate();
  };

  const handleDownload = async (
    specId: string,
    format: SpecDownloadFormat,
  ) => {
    setDownloadError(null);
    setDownloadingKey(`${specId}:${format}`);
    const ok = await downloadGeneratedSpec(projectId, specId, format);
    setDownloadingKey(null);

    if (!ok) {
      setDownloadError(DOWNLOAD_ERROR_TEXT);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-4 px-4 py-4">
        <Button
          type="button"
          className="w-full bg-brand text-primary-foreground hover:bg-brand/80"
          onClick={handleGenerate}
          disabled={isBusy}
        >
          {isBusy ? <Loader2 className="animate-spin" /> : null}
          {isBusy ? "Generating…" : "Generate Spec"}
        </Button>
        {isBusy ? (
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-ai-text"
          >
            Writing a specification from the current canvas…
          </p>
        ) : null}
        {displayError ? (
          <p className="text-xs text-state-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
        {specs.length === 0 && !isBusy ? (
          <p className="text-sm text-copy-muted">
            Generate a technical spec from the architecture on the canvas. It
            will appear here so you can download Markdown or PDF.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {specs.map((spec) => (
              <article
                key={spec.specId}
                className="rounded-2xl border border-surface-border bg-elevated p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface text-copy-muted">
                    <FileText className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-copy">
                      {spec.title}
                    </h3>
                    {spec.snippet ? (
                      <p className="mt-1 text-xs text-copy-muted">
                        {spec.snippet}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={downloadingKey !== null}
                    onClick={() => {
                      void handleDownload(spec.specId, "markdown");
                    }}
                  >
                    {downloadingKey === `${spec.specId}:markdown` ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download />
                    )}
                    Markdown
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={downloadingKey !== null}
                    onClick={() => {
                      void handleDownload(spec.specId, "pdf");
                    }}
                  >
                    {downloadingKey === `${spec.specId}:pdf` ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download />
                    )}
                    PDF
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
