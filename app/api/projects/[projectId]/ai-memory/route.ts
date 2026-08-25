import { NextResponse } from "next/server";

import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { deleteSpecBlob } from "@/lib/spec-blob";
import { isStoredBlobUrl } from "@/lib/canvas-snapshot";
import { parseAiChatEvent, type AiChatEvent } from "@/types/tasks";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

function toChatEvent(row: {
  messageId: string;
  sender: string;
  senderId: string;
  role: string;
  content: string;
  timestamp: Date;
}): AiChatEvent | null {
  return parseAiChatEvent({
    type: "ai-chat",
    id: row.messageId,
    sender: row.sender,
    senderId: row.senderId,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp.getTime(),
  });
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

  const [messageCount, specCount, messageRows, specRows] = await Promise.all([
    prisma.projectChatMessage.count({ where: { projectId } }),
    prisma.projectSpec.count({ where: { projectId } }),
    project.persistAiData
      ? prisma.projectChatMessage.findMany({
          where: { projectId },
          orderBy: { timestamp: "asc" },
          take: 200,
        })
      : Promise.resolve([]),
    project.persistAiData
      ? prisma.projectSpec.findMany({
          where: { projectId },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const messages = messageRows
    .map(toChatEvent)
    .filter((message): message is AiChatEvent => message !== null);

  return NextResponse.json({
    persistAiData: project.persistAiData,
    hasSavedData: messageCount + specCount > 0,
    messages,
    specs: specRows.map((spec) => ({
      specId: spec.id,
      title: spec.title,
      snippet: spec.snippet,
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const persistAiData = (body as { persistAiData?: unknown }).persistAiData;

  if (typeof persistAiData !== "boolean") {
    return NextResponse.json(
      { error: "persistAiData must be a boolean" },
      { status: 400 },
    );
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { persistAiData },
  });

  return NextResponse.json({ persistAiData: updated.persistAiData });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  if (project.persistAiData) {
    return NextResponse.json(
      { error: "Turn off Save history before clearing saved data." },
      { status: 409 },
    );
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { filePath: true },
  });

  for (const spec of specs) {
    if (!isStoredBlobUrl(spec.filePath)) {
      continue;
    }

    try {
      await deleteSpecBlob(spec.filePath);
    } catch (error) {
      console.error("Failed to delete spec blob:", error);
    }
  }

  await prisma.$transaction([
    prisma.projectChatMessage.deleteMany({ where: { projectId } }),
    prisma.projectSpec.deleteMany({ where: { projectId } }),
  ]);

  return NextResponse.json({ cleared: true });
}
