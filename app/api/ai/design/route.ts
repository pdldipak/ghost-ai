import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { generateArchitecture } from "@/trigger/generate-architecture";

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

  const { prompt, projectId } = body as {
    prompt?: unknown;
    projectId?: unknown;
  };

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return NextResponse.json(
      { error: "projectId is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const trimmedPrompt = prompt.trim();
  const trimmedProjectId = projectId.trim();

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
    const handle = await tasks.trigger<typeof generateArchitecture>(
      "generate-architecture",
      {
        projectId: trimmedProjectId,
        prompt: trimmedPrompt,
      },
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: trimmedProjectId,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to trigger design task";
    console.error("POST /api/ai/design failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
