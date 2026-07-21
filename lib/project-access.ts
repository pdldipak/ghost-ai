import { auth, currentUser } from "@clerk/nextjs/server";

import { normalizeEmail } from "@/lib/collaborators";
import { prisma } from "@/lib/prisma";

export interface ClerkIdentity {
  userId: string;
  email: string | null;
}

export async function getClerkIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const rawEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;
  const email = rawEmail ? normalizeEmail(rawEmail) : null;

  return { userId, email };
}

export async function getAccessibleProject(
  projectId: string,
  userId: string,
  email: string | null | undefined,
) {
  const normalizedEmail = email ? normalizeEmail(email) : null;

  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...(normalizedEmail
          ? [{ collaborators: { some: { email: normalizedEmail } } }]
          : []),
      ],
    },
  });
}

export async function canAccessProject(
  projectId: string,
  userId: string,
  email: string | null | undefined,
): Promise<boolean> {
  const project = await getAccessibleProject(projectId, userId, email);
  return project !== null;
}
