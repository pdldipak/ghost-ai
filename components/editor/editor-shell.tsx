"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/lib/project-types";
import { cn } from "@/lib/utils";

function SidebarBackdrop({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Close projects sidebar"
      className={cn(
        "fixed inset-0 top-12 z-30 bg-black/50 transition-opacity md:hidden",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
      tabIndex={isOpen ? 0 : -1}
    />
  );
}

function WorkspacePlaceholder({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-2xl font-medium text-copy">Workspace</h1>
      <p className="mt-3 font-mono text-sm text-copy-muted">{projectId}</p>
    </div>
  );
}

interface EditorShellProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  activeProjectId,
}: EditorShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectActions = useProjectActions({ activeProjectId });

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleOpenProject = (project: Project) => {
    closeSidebar();
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="relative flex flex-1 flex-col">
        <SidebarBackdrop isOpen={isSidebarOpen} onClose={closeSidebar} />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProjectId}
          onNewProject={projectActions.openCreateDialog}
          onOpenProject={handleOpenProject}
          onRenameProject={projectActions.openRenameDialog}
          onDeleteProject={projectActions.openDeleteDialog}
        />
        {activeProjectId ? (
          <WorkspacePlaceholder projectId={activeProjectId} />
        ) : (
          <EditorHome onNewProject={projectActions.openCreateDialog} />
        )}
        <ProjectDialogs dialogs={projectActions} />
      </main>
    </div>
  );
}
