"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  projectName: string;
  isLoading: boolean;
  onProjectNameChange: (name: string) => void;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  currentName,
  projectName,
  isLoading,
  onProjectNameChange,
  onSubmit,
}: RenameProjectDialogProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename Project"
      description={`Current name: ${currentName}`}
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
            form="rename-project-form"
            disabled={isLoading || !projectName.trim()}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <form id="rename-project-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="rename-project-name" className="text-sm text-copy-secondary">
            Project name
          </label>
          <Input
            id="rename-project-name"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            autoFocus
            disabled={isLoading}
          />
        </div>
      </form>
    </EditorDialog>
  );
}
