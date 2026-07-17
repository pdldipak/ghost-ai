import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};

  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, description, id } = body as {
    name?: unknown;
    description?: unknown;
    id?: unknown;
  };

  if (name !== undefined && typeof name !== "string") {
    return NextResponse.json({ error: "name must be a string" }, { status: 400 });
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return NextResponse.json(
      { error: "description must be a string or null" },
      { status: 400 },
    );
  }

  if (id !== undefined) {
    if (typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { error: "id must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id.trim())) {
      return NextResponse.json(
        { error: "id must be a lowercase slug" },
        { status: 400 },
      );
    }
  }

  const projectName =
    typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : DEFAULT_PROJECT_NAME;

  const projectId =
    typeof id === "string" && id.trim().length > 0 ? id.trim() : undefined;

  if (projectId) {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Project id already exists" },
        { status: 409 },
      );
    }
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        ...(projectId ? { id: projectId } : {}),
        ownerId: userId,
        name: projectName,
        ...(description !== undefined
          ? { description: typeof description === "string" ? description : null }
          : {}),
        canvasJsonPath: "pending",
      },
    });

    return tx.project.update({
      where: { id: created.id },
      data: { canvasJsonPath: `canvas/${created.id}.json` },
    });
  });

  return NextResponse.json({ project }, { status: 201 });
}
