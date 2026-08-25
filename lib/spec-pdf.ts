import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_SIZE = 11;
const H1_SIZE = 18;
const H2_SIZE = 14;
const H3_SIZE = 12;
const CODE_SIZE = 9.5;
const LINE_GAP = 3;
const PARAGRAPH_GAP = 8;
const INK = rgb(0.09, 0.09, 0.11);

type SpecBlockKind = "h1" | "h2" | "h3" | "p" | "li" | "code" | "blank";

interface SpecBlock {
  kind: SpecBlockKind;
  text: string;
}

interface PdfWriter {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
}

function toWinAnsi(text: string): string {
  return text
    .replace(/\u2018|\u2019|\u2032/g, "'")
    .replace(/\u201C|\u201D|\u2033/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "");
}

function wrapLine(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const clean = toWinAnsi(text).replace(/\s+/g, " ").trim();

  if (clean.length === 0) {
    return [];
  }

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;

    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }

    if (current.length > 0) {
      lines.push(current);
    }

    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }

    let chunk = "";
    for (const char of word) {
      const trial = `${chunk}${char}`;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        chunk = trial;
        continue;
      }

      if (chunk.length > 0) {
        lines.push(chunk);
      }
      chunk = char;
    }
    current = chunk;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

function parseSpecBlocks(markdown: string): SpecBlock[] {
  const blocks: SpecBlock[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  const flushCode = () => {
    if (codeLines.length === 0) {
      return;
    }

    blocks.push({ kind: "code", text: codeLines.join("\n") });
    codeLines = [];
  };

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.replace(/\s+$/g, "");

    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.trim().length === 0) {
      blocks.push({ kind: "blank", text: "" });
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ kind: "h1", text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      blocks.push({
        kind: "li",
        text: line.replace(/^\s*[-*]\s+/, "").trim(),
      });
      continue;
    }

    blocks.push({
      kind: "p",
      text: line.replace(/^>\s?/, "").trim(),
    });
  }

  flushCode();
  return blocks;
}

function addPage(writer: PdfWriter): void {
  writer.page = writer.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  writer.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(writer: PdfWriter, height: number): void {
  if (writer.y - height < MARGIN) {
    addPage(writer);
  }
}

function drawLines(
  writer: PdfWriter,
  lines: string[],
  font: PDFFont,
  size: number,
  indent = 0,
): void {
  const lineHeight = size + LINE_GAP;

  for (const line of lines) {
    ensureSpace(writer, lineHeight);
    writer.page.drawText(line, {
      x: MARGIN + indent,
      y: writer.y - size,
      size,
      font,
      color: INK,
    });
    writer.y -= lineHeight;
  }
}

export async function specMarkdownToPdf(
  markdown: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const writer: PdfWriter = {
    pdf,
    page,
    y: PAGE_HEIGHT - MARGIN,
    regular,
    bold,
    mono,
  };

  const blocks = parseSpecBlocks(markdown.trim() || "Technical specification");

  for (const block of blocks) {
    if (block.kind === "blank") {
      writer.y -= PARAGRAPH_GAP / 2;
      continue;
    }

    if (block.kind === "h1") {
      writer.y -= 4;
      drawLines(
        writer,
        wrapLine(block.text, bold, H1_SIZE, CONTENT_WIDTH),
        bold,
        H1_SIZE,
      );
      writer.y -= PARAGRAPH_GAP;
      continue;
    }

    if (block.kind === "h2") {
      writer.y -= 2;
      drawLines(
        writer,
        wrapLine(block.text, bold, H2_SIZE, CONTENT_WIDTH),
        bold,
        H2_SIZE,
      );
      writer.y -= PARAGRAPH_GAP / 2;
      continue;
    }

    if (block.kind === "h3") {
      drawLines(
        writer,
        wrapLine(block.text, bold, H3_SIZE, CONTENT_WIDTH),
        bold,
        H3_SIZE,
      );
      writer.y -= 4;
      continue;
    }

    if (block.kind === "li") {
      const bulletWidth = regular.widthOfTextAtSize("•  ", BODY_SIZE);
      const wrapped = wrapLine(
        block.text,
        regular,
        BODY_SIZE,
        CONTENT_WIDTH - bulletWidth,
      );

      if (wrapped.length === 0) {
        continue;
      }

      ensureSpace(writer, BODY_SIZE + LINE_GAP);
      writer.page.drawText("•", {
        x: MARGIN,
        y: writer.y - BODY_SIZE,
        size: BODY_SIZE,
        font: regular,
        color: INK,
      });
      drawLines(writer, wrapped, regular, BODY_SIZE, bulletWidth);
      continue;
    }

    if (block.kind === "code") {
      const codeLines = toWinAnsi(block.text).split("\n");
      for (const codeLine of codeLines) {
        const wrapped = wrapLine(
          codeLine.length > 0 ? codeLine : " ",
          mono,
          CODE_SIZE,
          CONTENT_WIDTH,
        );
        drawLines(
          writer,
          wrapped.length > 0 ? wrapped : [" "],
          mono,
          CODE_SIZE,
        );
      }
      writer.y -= PARAGRAPH_GAP / 2;
      continue;
    }

    drawLines(
      writer,
      wrapLine(block.text, regular, BODY_SIZE, CONTENT_WIDTH),
      regular,
      BODY_SIZE,
    );
    writer.y -= 2;
  }

  return pdf.save();
}
