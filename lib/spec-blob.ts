import { del, get, put, type BlobAccessType } from "@vercel/blob";

const BLOB_ACCESS_MODES: BlobAccessType[] = ["private", "public"];

export function specBlobPathname(projectId: string, specId: string): string {
  return `specs/${projectId}/${specId}.md`;
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

export async function putSpecMarkdown(
  projectId: string,
  specId: string,
  markdown: string,
): Promise<string> {
  const token = blobToken();
  const pathname = specBlobPathname(projectId, specId);
  let lastError: unknown;

  for (const access of BLOB_ACCESS_MODES) {
    try {
      const blob = await put(pathname, markdown, {
        access,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "text/markdown",
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

export async function getSpecMarkdown(url: string): Promise<string | null> {
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

      return await new Response(result.stream).text();
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw new Error(blobErrorMessage(lastError));
  }

  return null;
}

export async function deleteSpecBlob(url: string): Promise<void> {
  const token = blobToken();

  try {
    await del(url, token ? { token } : {});
  } catch (error) {
    throw new Error(blobErrorMessage(error));
  }
}
