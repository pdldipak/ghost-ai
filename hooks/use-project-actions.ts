"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { Project } from "@/lib/project-types";
import {
  generateRoomId,
  generateShortSuffix,
} from "@/lib/project-slug";

export type ProjectDialogType = "create" | "rename" | "delete" | null;

export interface UseProjectActionsOptions {
  activeProjectId?: string;
}

export interface UseProjectActionsReturn {
  activeDialog: ProjectDialogType;
  selectedProject: Project | null;
  projectName: string;
  roomIdPreview: string;
  isLoading: boolean;
  openCreateDialog: () => void;
  openRenameDialog: (project: Project) => void;
  openDeleteDialog: (project: Project) => void;
  closeDialog: () => void;
  setProjectName: (name: string) => void;
  handleCreate: () => Promise<void>;
  handleRename: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useProjectActions({
  activeProjectId,
}: UseProjectActionsOptions = {}): UseProjectActionsReturn {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [roomIdSuffix, setRoomIdSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roomIdPreview = useMemo(() => {
    if (!projectName.trim() || !roomIdSuffix) {
      return "";
    }

    return generateRoomId(projectName, roomIdSuffix);
  }, [projectName, roomIdSuffix]);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setSelectedProject(null);
    setProjectName("");
    setRoomIdSuffix("");
    setIsLoading(false);
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedProject(null);
    setProjectName("");
    setRoomIdSuffix(generateShortSuffix());
    setActiveDialog("create");
  }, []);

  const openRenameDialog = useCallback((project: Project) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setActiveDialog("rename");
  }, []);

  const openDeleteDialog = useCallback((project: Project) => {
    setSelectedProject(project);
    setProjectName("");
    setActiveDialog("delete");
  }, []);

  const handleCreate = useCallback(async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName || !roomIdSuffix) {
      return;
    }

    const roomId = generateRoomId(trimmedName, roomIdSuffix);

    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, id: roomId }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as { project: { id: string } };
      closeDialog();
      router.push(`/editor/${data.project.id}`);
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  }, [closeDialog, projectName, roomIdSuffix, router]);

  const handleRename = useCallback(async () => {
    if (!selectedProject) {
      return;
    }

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      closeDialog();
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  }, [closeDialog, projectName, router, selectedProject]);

  const handleDelete = useCallback(async () => {
    if (!selectedProject) {
      return;
    }

    const deletedProjectId = selectedProject.id;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${deletedProjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      closeDialog();

      if (activeProjectId && deletedProjectId === activeProjectId) {
        router.push("/editor");
      }

      router.refresh();
    } catch {
      setIsLoading(false);
    }
  }, [activeProjectId, closeDialog, router, selectedProject]);

  return {
    activeDialog,
    selectedProject,
    projectName,
    roomIdPreview,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setProjectName,
    handleCreate,
    handleRename,
    handleDelete,
  };
}
