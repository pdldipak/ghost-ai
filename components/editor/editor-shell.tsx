"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareProjectDialog } from "@/components/editor/share-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useShareDialog } from "@/hooks/use-share-dialog";
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

function CanvasPlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-base px-4 text-center">
      <p className="text-sm text-copy-muted">Canvas will appear here</p>
    </div>
  );
}

function AiSidebarPlaceholder({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-surface-border bg-surface">
      <div className="border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-medium text-copy">AI Assistant</h2>
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-center text-sm text-copy-muted">AI chat coming soon</p>
      </div>
    </aside>
  );
}

interface EditorShellProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  activeProjectName?: string;
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  activeProjectId,
  activeProjectName,
}: EditorShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const projectActions = useProjectActions({ activeProjectId });

  const isOwner = useMemo(
    () =>
      Boolean(
        activeProjectId &&
          ownedProjects.some((project) => project.id === activeProjectId),
      ),
    [activeProjectId, ownedProjects],
  );

  const shareDialog = useShareDialog({
    projectId: activeProjectId,
    isOwner,
  });

  const closeSidebar = () => setIsSidebarOpen(false);
  const isWorkspace = Boolean(activeProjectId && activeProjectName);

  const handleOpenProject = (project: Project) => {
    closeSidebar();
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        projectName={activeProjectName}
        isAiSidebarOpen={isAiSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((open) => !open)}
        onShareClick={shareDialog.openDialog}
      />
      <main className="relative flex min-h-0 flex-1">
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
        {isWorkspace ? (
          <>
            <CanvasPlaceholder />
            <AiSidebarPlaceholder isOpen={isAiSidebarOpen} />
          </>
        ) : (
          <EditorHome onNewProject={projectActions.openCreateDialog} />
        )}
        <ProjectDialogs dialogs={projectActions} />
        {isWorkspace && activeProjectName ? (
          <ShareProjectDialog
            open={shareDialog.open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                shareDialog.closeDialog();
              }
            }}
            projectName={activeProjectName}
            isOwner={shareDialog.isOwner}
            inviteEmail={shareDialog.inviteEmail}
            collaborators={shareDialog.collaborators}
            isLoading={shareDialog.isLoading}
            isInviting={shareDialog.isInviting}
            removingEmail={shareDialog.removingEmail}
            linkCopied={shareDialog.linkCopied}
            error={shareDialog.error}
            onInviteEmailChange={shareDialog.setInviteEmail}
            onInvite={shareDialog.handleInvite}
            onRemove={shareDialog.handleRemove}
            onCopyLink={shareDialog.handleCopyLink}
          />
        ) : null}
      </main>
    </div>
  );
}
