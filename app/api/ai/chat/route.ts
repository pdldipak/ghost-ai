import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { createRunPublicToken } from "@/lib/trigger-public-token";
import { parseChatHistory } from "@/types/tasks";
import type { explainArchitecture } from "@/trigger/explain-architecture";

function readNonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const identity = await getClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const payload = body as {
    prompt?: unknown;
    projectId?: unknown;
    roomId?: unknown;
    history?: unknown;
  };

  const trimmedPrompt = readNonEmptyString(payload.prompt);
  const trimmedProjectId =
    readNonEmptyString(payload.projectId) || readNonEmptyString(payload.roomId);
  const history = parseChatHistory(payload.history);

  if (!trimmedPrompt) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  if (!trimmedProjectId) {
    return NextResponse.json(
      { error: "projectId is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const project = await getAccessibleProject(
    trimmedProjectId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!process.env.TRIGGER_SECRET_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "TRIGGER_SECRET_KEY is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  try {
    const handle = await tasks.trigger<typeof explainArchitecture>(
      "explain-architecture",
      {
        projectId: trimmedProjectId,
        prompt: trimmedPrompt,
        history,
      },
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: trimmedProjectId,
        userId: identity.userId,
      },
    });

    const publicToken = await createRunPublicToken(handle.id);

    return NextResponse.json({ runId: handle.id, publicToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to trigger chat task";
    console.error("POST /api/ai/chat failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
