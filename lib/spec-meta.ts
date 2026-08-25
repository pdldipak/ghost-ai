export const SPEC_SNIPPET_MAX_CHARS = 140;
export const FALLBACK_SPEC_TITLE = "Technical specification";

export function specTitle(markdown: string): string {
  const heading = markdown.match(/^#\s+(.+?)\s*$/m);
  const title = heading?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  return title || FALLBACK_SPEC_TITLE;
}

export function specSnippet(
  markdown: string,
  maxChars = SPEC_SNIPPET_MAX_CHARS,
): string {
  const withoutHeading = markdown.replace(/^#\s+.+\s*$/m, "").trim();
  const firstBlock =
    withoutHeading
      .split(/\n\s*\n/)
      .map((block) => block.replace(/\s+/g, " ").trim())
      .find((block) => block.length > 0) ?? withoutHeading.replace(/\s+/g, " ");

  if (firstBlock.length <= maxChars) {
    return firstBlock;
  }

  return `${firstBlock.slice(0, maxChars - 1).trimEnd()}…`;
}
