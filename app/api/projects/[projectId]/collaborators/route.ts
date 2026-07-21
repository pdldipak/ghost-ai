import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  enrichCollaborators,
  isValidEmail,
  normalizeEmail,
} from "@/lib/collaborators";
import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  const project = await getAccessibleProject(
    projectId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const enriched = await enrichCollaborators(collaborators);

  return NextResponse.json({
    collaborators: enriched,
    isOwner: project.ownerId === identity.userId,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email } = body as { email?: unknown };

  if (typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json(
      { error: "email is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    return NextResponse.json({ error: "email is invalid" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: {
        projectId,
        email: normalizedEmail,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Collaborator already invited" },
      { status: 409 },
    );
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: {
      projectId,
      email: normalizedEmail,
    },
  });

  const [enriched] = await enrichCollaborators([collaborator]);

  return NextResponse.json({ collaborator: enriched }, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email } = body as { email?: unknown };

  if (typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json(
      { error: "email is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeEmail(email);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: {
        projectId,
        email: normalizedEmail,
      },
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Collaborator not found" },
      { status: 404 },
    );
  }

  await prisma.projectCollaborator.delete({
    where: { id: existing.id },
  });

  return NextResponse.json({ success: true });
}
