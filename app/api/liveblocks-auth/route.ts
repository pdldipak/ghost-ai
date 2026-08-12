import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCursorColor, liveblocks } from "@/lib/liveblocks";
import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";

export async function POST(request: Request) {
  const identity = await getClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.LIVEBLOCKS_SECRET_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "LIVEBLOCKS_SECRET_KEY is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
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

  const { room } = body as { room?: unknown };

  if (typeof room !== "string" || room.trim().length === 0) {
    return NextResponse.json(
      { error: "room is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const projectId = room.trim();

  const project = await getAccessibleProject(
    projectId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await liveblocks.getOrCreateRoom(projectId, {
      defaultAccesses: [],
    });

    const user = await currentUser();
    const name =
      user?.fullName?.trim() ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      identity.email ||
      "Anonymous";
    const avatar = user?.imageUrl ?? "";
    const color = getCursorColor(identity.userId);

    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name,
        avatar,
        color,
      },
    });

    session.allow(projectId, session.FULL_ACCESS);

    const { status, body: tokenBody } = await session.authorize();

    return new Response(tokenBody, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Liveblocks authentication failed";

    console.error("[liveblocks-auth]", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
