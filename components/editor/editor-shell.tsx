"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasRoom } from "@/components/editor/canvas-room";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { FlowCanvas } from "@/components/editor/flow-canvas";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareProjectDialog } from "@/components/editor/share-project-dialog";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle");
  const saveNowRef = useRef<(() => void) | null>(null);
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
        onTemplatesClick={() => setIsTemplatesOpen(true)}
        onShareClick={shareDialog.openDialog}
        saveStatus={isWorkspace ? saveStatus : undefined}
        onSaveClick={() => saveNowRef.current?.()}
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
        {isWorkspace && activeProjectId ? (
          <>
            <CanvasRoom roomId={activeProjectId}>
              <FlowCanvas
                projectId={activeProjectId}
                templatesOpen={isTemplatesOpen}
                onTemplatesOpenChange={setIsTemplatesOpen}
                onSaveStatusChange={setSaveStatus}
                saveNowRef={saveNowRef}
              />
              <AiSidebar
                key={activeProjectId}
                isOpen={isAiSidebarOpen}
                onClose={() => setIsAiSidebarOpen(false)}
                projectId={activeProjectId}
              />
            </CanvasRoom>
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
