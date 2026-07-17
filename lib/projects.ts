import { prisma } from "@/lib/prisma";
import { generateProjectSlug } from "@/lib/project-slug";
import type { Project } from "@/lib/project-types";

function toProjectSummary(
  project: { id: string; name: string },
  isOwned: boolean,
): Project {
  return {
    id: project.id,
    name: project.name,
    slug: generateProjectSlug(project.name) || project.id,
    isOwned,
  };
}

export async function getOwnedProjects(userId: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => toProjectSummary(project, true));
}

export async function getSharedProjects(email: string): Promise<Project[]> {
  const collaborations = await prisma.projectCollaborator.findMany({
    where: { email },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return collaborations.map((collaboration) =>
    toProjectSummary(collaboration.project, false),
  );
}

export async function getUserProjects(
  userId: string,
  email: string | null | undefined,
): Promise<{ ownedProjects: Project[]; sharedProjects: Project[] }> {
  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ]);

  const ownedIds = new Set(ownedProjects.map((project) => project.id));

  return {
    ownedProjects,
    sharedProjects: sharedProjects.filter((project) => !ownedIds.has(project.id)),
  };
}
