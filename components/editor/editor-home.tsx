"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorHomeProps {
  onNewProject: () => void;
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="max-w-lg text-2xl font-medium text-copy">
        Create a project or open an existing one.
      </h1>
      <p className="mt-3 max-w-md text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="mt-6" onClick={onNewProject}>
        <Plus />
        New Project
      </Button>
    </div>
  );
}
