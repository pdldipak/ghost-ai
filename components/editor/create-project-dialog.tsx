"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  roomIdPreview: string;
  isLoading: boolean;
  onProjectNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  roomIdPreview,
  isLoading,
  onProjectNameChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Project"
      description="Give your architecture workspace a name."
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
            type="submit"
            form="create-project-form"
            disabled={isLoading || !projectName.trim()}
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="create-project-name" className="text-sm text-copy-secondary">
            Project name
          </label>
          <Input
            id="create-project-name"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="My Architecture"
            autoFocus
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-copy-muted">Room ID preview</p>
          <p className="font-mono text-sm text-copy-secondary">
            {roomIdPreview || "project-room-id"}
          </p>
        </div>
      </form>
    </EditorDialog>
  );
}
