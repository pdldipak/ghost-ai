"use client";

import { Trash2 } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";

interface ClearAiMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  onConfirm: () => void;
}

export function ClearAiMemoryDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: ClearAiMemoryDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear saved history"
      description="This removes stored data for this project only. The canvas is not affected."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Clearing…" : "Clear saved data"}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-surface-border bg-surface p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-copy">
          <Trash2 className="size-4 text-state-error" aria-hidden />
          This cannot be undone
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-copy-muted">
          <li>AI Architect and Chat messages</li>
          <li>Generated spec downloads</li>
        </ul>
      </div>
    </EditorDialog>
  );
}
