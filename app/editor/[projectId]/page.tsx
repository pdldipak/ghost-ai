import { EditorShell } from "@/components/editor/editor-shell";
import { requireEditorProjects } from "@/lib/editor-projects";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { projectId } = await params;
  const { ownedProjects, sharedProjects } = await requireEditorProjects();

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProjectId={projectId}
    />
  );
}
