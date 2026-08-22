"use client";

import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onAiSidebarToggle?: () => void;
  onTemplatesClick?: () => void;
  onShareClick?: () => void;
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
        <UserButton />
      </div>
    </header>
  );
}
