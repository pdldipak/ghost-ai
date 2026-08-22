import { get, put, type BlobAccessType } from "@vercel/blob";

import {
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";

const BLOB_ACCESS_MODES: BlobAccessType[] = ["private", "public"];

export function canvasBlobPathname(projectId: string): string {
  return `canvas/${projectId}.json`;
}

function blobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? token : undefined;
}

function blobErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : "Unknown blob error";
}

export async function putCanvasSnapshot(
  projectId: string,
  snapshot: CanvasSnapshot,
): Promise<string> {
  const token = blobToken();
  const pathname = canvasBlobPathname(projectId);
  const body = JSON.stringify(snapshot);
  let lastError: unknown;

  for (const access of BLOB_ACCESS_MODES) {
    try {
      const blob = await put(pathname, body, {
        access,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        ...(token ? { token } : {}),
      });
      return blob.url;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(blobErrorMessage(lastError));
}

export async function getCanvasSnapshot(
  url: string,
): Promise<CanvasSnapshot | null> {
  const token = blobToken();
  let lastError: unknown;

  for (const access of BLOB_ACCESS_MODES) {
    try {
      const result = await get(url, {
        access,
        useCache: false,
        ...(token ? { token } : {}),
      });

      if (!result || result.statusCode !== 200) {
        continue;
      }

      const json: unknown = await new Response(result.stream).json();
      return parseCanvasSnapshot(json);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw new Error(blobErrorMessage(lastError));
  }

  return null;
}
