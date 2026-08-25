import { auth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

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

  const { runId } = body as { runId?: unknown };

  if (typeof runId !== "string" || runId.trim().length === 0) {
    return NextResponse.json(
      { error: "runId is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const trimmedRunId = runId.trim();

  const taskRun = await prisma.taskRun.findFirst({
    where: {
      runId: trimmedRunId,
      userId: identity.userId,
    },
  });

  if (!taskRun) {
    return NextResponse.json({ error: "Task run not found" }, { status: 404 });
  }

  const project = await getAccessibleProject(
    taskRun.projectId,
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
    const token = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [trimmedRunId],
        },
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create run-scoped token";
    console.error("POST /api/ai/design/token failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
