"use client";

import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Share2,
} from "lucide-react";

import { ThemeSelector } from "@/components/theme/theme-selector";
import { Button } from "@/components/ui/button";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import { cn } from "@/lib/utils";

const SAVE_STATUS_LABEL: Record<CanvasSaveStatus, string> = {
  idle: "Save",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onAiSidebarToggle?: () => void;
  onTemplatesClick?: () => void;
  onShareClick?: () => void;
  saveStatus?: CanvasSaveStatus;
  onSaveClick?: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  isAiSidebarOpen = false,
  onAiSidebarToggle,
  onTemplatesClick,
  onShareClick,
  saveStatus,
  onSaveClick,
  className,
}: EditorNavbarProps) {
  const isWorkspace = Boolean(projectName);

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center border-b border-surface-border bg-surface px-3",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSidebarToggle}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-2">
        {projectName ? (
          <h1 className="truncate text-sm font-medium text-copy">{projectName}</h1>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        {isWorkspace ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveClick}
              disabled={saveStatus === "saving"}
              aria-label={SAVE_STATUS_LABEL[saveStatus ?? "idle"]}
              className={cn(
                (saveStatus === "idle" ||
                  saveStatus === "saving" ||
                  saveStatus === undefined) &&
                  "text-copy-muted",
                saveStatus === "saved" && "text-state-success",
                saveStatus === "error" && "text-state-error",
              )}
            >
              <Save />
              {SAVE_STATUS_LABEL[saveStatus ?? "idle"]}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTemplatesClick}
              aria-label="Open starter templates"
            >
              <LayoutTemplate />
              Templates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShareClick}
              aria-label="Share project"
            >
              <Share2 />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onAiSidebarToggle}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
            >
              {isAiSidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
            </Button>
          </>
        ) : null}
        <ThemeSelector />
        {isWorkspace ? null : <UserButton />}
      </div>
    </header>
  );
}
