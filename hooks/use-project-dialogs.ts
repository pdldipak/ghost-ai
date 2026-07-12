"use client";

import { useCallback, useState } from "react";

import {
  MOCK_OWNED_PROJECTS,
  MOCK_SHARED_PROJECTS,
  type Project,
} from "@/lib/mock-projects";
import { generateProjectSlug } from "@/lib/project-slug";

export type ProjectDialogType = "create" | "rename" | "delete" | null;

export interface UseProjectDialogsReturn {
  activeDialog: ProjectDialogType;
  selectedProject: Project | null;
  projectName: string;
  slugPreview: string;
  isLoading: boolean;
  ownedProjects: Project[];
  sharedProjects: Project[];
  openCreateDialog: () => void;
  openRenameDialog: (project: Project) => void;
  openDeleteDialog: (project: Project) => void;
  closeDialog: () => void;
  setProjectName: (name: string) => void;
  handleCreate: () => Promise<void>;
  handleRename: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

function simulateAsyncAction(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });
}

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ownedProjects, setOwnedProjects] =
    useState<Project[]>(MOCK_OWNED_PROJECTS);
  const [sharedProjects] = useState<Project[]>(MOCK_SHARED_PROJECTS);

  const slugPreview = generateProjectSlug(projectName);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setSelectedProject(null);
    setProjectName("");
    setIsLoading(false);
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedProject(null);
    setProjectName("");
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
    if (!trimmedName) {
      return;
    }

    setIsLoading(true);
    await simulateAsyncAction();

    const slug = generateProjectSlug(trimmedName);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: trimmedName,
      slug: slug || "project",
      isOwned: true,
    };

    setOwnedProjects((projects) => [newProject, ...projects]);
    closeDialog();
  }, [closeDialog, projectName]);

  const handleRename = useCallback(async () => {
    if (!selectedProject) {
      return;
    }

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    setIsLoading(true);
    await simulateAsyncAction();

    const slug = generateProjectSlug(trimmedName);
    setOwnedProjects((projects) =>
      projects.map((project) =>
        project.id === selectedProject.id
          ? { ...project, name: trimmedName, slug: slug || project.slug }
          : project,
      ),
    );
    closeDialog();
  }, [closeDialog, projectName, selectedProject]);

  const handleDelete = useCallback(async () => {
    if (!selectedProject) {
      return;
    }

    setIsLoading(true);
    await simulateAsyncAction();

    setOwnedProjects((projects) =>
      projects.filter((project) => project.id !== selectedProject.id),
    );
    closeDialog();
  }, [closeDialog, selectedProject]);

  return {
    activeDialog,
    selectedProject,
    projectName,
    slugPreview,
    isLoading,
    ownedProjects,
    sharedProjects,
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
