import { NextResponse } from "next/server";

import { isStoredBlobUrl } from "@/lib/canvas-snapshot";
import { getAccessibleProject, getClerkIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { getSpecMarkdown } from "@/lib/spec-blob";
import { specMarkdownToPdf } from "@/lib/spec-pdf";

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>;
}

type DownloadFormat = "markdown" | "pdf";

function parseDownloadFormat(value: string | null): DownloadFormat | null {
  if (value === null || value.trim().length === 0 || value === "md") {
    return "markdown";
  }

  if (value === "markdown" || value === "pdf") {
    return value;
  }

  return null;
}

export async function GET(request: Request, context: RouteContext) {
  const identity = await getClerkIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = parseDownloadFormat(
    new URL(request.url).searchParams.get("format"),
  );

  if (!format) {
    return NextResponse.json(
      { error: "format must be markdown or pdf" },
      { status: 400 },
    );
  }

  const { projectId, specId } = await context.params;

  const project = await getAccessibleProject(
    projectId,
    identity.userId,
    identity.email,
  );

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const spec = await prisma.projectSpec.findFirst({
    where: {
      id: specId,
      projectId,
    },
  });

  if (!spec || !isStoredBlobUrl(spec.filePath)) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  try {
    const markdown = await getSpecMarkdown(spec.filePath);

    if (markdown === null) {
      return NextResponse.json({ error: "Spec file not found" }, { status: 502 });
    }

    if (format === "pdf") {
      const pdf = await specMarkdownToPdf(markdown);

      return new Response(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${specId}.pdf"`,
        },
      });
    }

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${specId}.md"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load specification";
    console.error(
      "GET /api/projects/[projectId]/specs/[specId]/download failed:",
      message,
    );
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
