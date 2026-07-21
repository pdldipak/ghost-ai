import { clerkClient } from "@clerk/nextjs/server";

export interface CollaboratorRecord {
  id: string;
  email: string;
  createdAt: Date;
}

export interface EnrichedCollaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export async function enrichCollaborators(
  collaborators: CollaboratorRecord[],
): Promise<EnrichedCollaborator[]> {
  if (collaborators.length === 0) {
    return [];
  }

  const emails = collaborators.map((collaborator) => collaborator.email);
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    emailAddress: emails,
    limit: Math.min(emails.length, 100),
  });

  const profileByEmail = new Map<
    string,
    { name: string | null; imageUrl: string | null }
  >();

  for (const user of users) {
    const profile = {
      name: user.fullName,
      imageUrl: user.imageUrl || null,
    };

    for (const address of user.emailAddresses) {
      profileByEmail.set(address.emailAddress.toLowerCase(), profile);
    }
  }

  return collaborators.map((collaborator) => {
    const profile = profileByEmail.get(collaborator.email.toLowerCase());

    return {
      id: collaborator.id,
      email: collaborator.email,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
      createdAt: collaborator.createdAt,
    };
  });
}
