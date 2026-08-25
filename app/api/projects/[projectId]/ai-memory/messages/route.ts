import { NextResponse } from "next/server";

import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { parseAiChatEvent } from "@/types/tasks";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
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

  if (!project.persistAiData) {
    return NextResponse.json({ persisted: false });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawMessages = Array.isArray(body)
    ? body
    : body !== null &&
        typeof body === "object" &&
        Array.isArray((body as { messages?: unknown }).messages)
      ? (body as { messages: unknown[] }).messages
      : body !== null && typeof body === "object"
        ? [body]
        : [];

  const messages = rawMessages
    .map((item) => parseAiChatEvent(item))
    .filter((item) => item !== null);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "At least one valid chat message is required" },
      { status: 400 },
    );
  }

  await prisma.projectChatMessage.createMany({
    data: messages.map((message) => ({
      projectId,
      messageId: message.id,
      sender: message.sender,
      senderId: message.senderId,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.timestamp),
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ persisted: true, count: messages.length });
}
