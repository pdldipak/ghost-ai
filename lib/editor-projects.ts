import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getUserProjects } from "@/lib/projects";
import type { Project } from "@/lib/project-types";

export async function requireEditorProjects(): Promise<{
  ownedProjects: Project[];
  sharedProjects: Project[];
}> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress;

  return getUserProjects(userId, email);
}
