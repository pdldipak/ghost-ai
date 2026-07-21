import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  getAccessibleProject,
  getClerkIdentity,
} from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { projectId } = await params;

  const identity = await getClerkIdentity();
  if (!identity) {
    redirect("/sign-in");
  }

  const project = await getAccessibleProject(
    projectId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await getUserProjects(
    identity.userId,
    identity.email,
  );

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProjectId={project.id}
      activeProjectName={project.name}
    />
  );
}
