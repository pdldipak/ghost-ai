"use client";

import type { UseProjectActionsReturn } from "@/hooks/use-project-actions";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";

interface ProjectDialogsProps {
  dialogs: UseProjectActionsReturn;
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const {
    activeDialog,
    selectedProject,
    projectName,
    roomIdPreview,
    isLoading,
    closeDialog,
    setProjectName,
    handleCreate,
    handleRename,
    handleDelete,
  } = dialogs;

  return (
    <>
      <CreateProjectDialog
        open={activeDialog === "create"}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        projectName={projectName}
        roomIdPreview={roomIdPreview}
        isLoading={isLoading}
        onProjectNameChange={setProjectName}
        onSubmit={handleCreate}
      />

      <RenameProjectDialog
        open={activeDialog === "rename"}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        currentName={selectedProject?.name ?? ""}
        projectName={projectName}
        isLoading={isLoading}
        onProjectNameChange={setProjectName}
        onSubmit={handleRename}
      />

      <DeleteProjectDialog
        open={activeDialog === "delete"}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        projectName={selectedProject?.name ?? ""}
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </>
  );
}
