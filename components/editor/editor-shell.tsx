"use client";

import { useState } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
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

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectDialogs();

  const closeSidebar = () => setIsSidebarOpen(false);

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
          ownedProjects={projectDialogs.ownedProjects}
          sharedProjects={projectDialogs.sharedProjects}
          onNewProject={projectDialogs.openCreateDialog}
          onRenameProject={projectDialogs.openRenameDialog}
          onDeleteProject={projectDialogs.openDeleteDialog}
        />
        <EditorHome onNewProject={projectDialogs.openCreateDialog} />
        <ProjectDialogs dialogs={projectDialogs} />
      </main>
    </div>
  );
}
