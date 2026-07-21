import { redirect } from "next/navigation";

import { getClerkIdentity } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";
import type { Project } from "@/lib/project-types";

export async function requireEditorProjects(): Promise<{
  ownedProjects: Project[];
  sharedProjects: Project[];
}> {
  const identity = await getClerkIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  return getUserProjects(identity.userId, identity.email);
}
