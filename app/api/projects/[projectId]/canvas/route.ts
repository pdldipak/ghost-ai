import { NextResponse } from "next/server";

import { getCanvasSnapshot, putCanvasSnapshot } from "@/lib/canvas-blob";
import {
  isStoredBlobUrl,
  parseCanvasSnapshot,
} from "@/lib/canvas-snapshot";
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

  if (!isStoredBlobUrl(project.canvasJsonPath)) {
    return NextResponse.json({
      nodes: [],
      edges: [],
      hasSnapshot: false,
    });
  }

  try {
    const snapshot = await getCanvasSnapshot(project.canvasJsonPath);

    if (!snapshot) {
      return NextResponse.json(
        { error: "Canvas snapshot not found" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      hasSnapshot: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load canvas snapshot";
    console.error("GET /api/projects/[projectId]/canvas failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const identity = await getClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const snapshot = parseCanvasSnapshot(body);

  if (!snapshot) {
    return NextResponse.json(
      { error: "nodes and edges must be a valid canvas snapshot" },
      { status: 400 },
    );
  }

  try {
    const canvasJsonPath = await putCanvasSnapshot(projectId, snapshot);

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath },
    });

    return NextResponse.json({
      canvasJsonPath,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save canvas snapshot";
    console.error("PUT /api/projects/[projectId]/canvas failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
