const MAX_EXTRACTED_TEXT_LENGTH = 120_000;

function clampText(value: string) {
  return value.replace(/\u0000/g, "").trim().slice(0, MAX_EXTRACTED_TEXT_LENGTH);
}

function buildSimpleToc(text: string) {
  const headings = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && line.length <= 120)
    .filter((line) => /^(?:الفصل|الوحدة|الدرس|الباب|الموضوع|chapter|unit|lesson|section)\b/i.test(line));
  return headings.slice(0, 200).join("\n");
}

export async function extractLibraryText(data: Buffer, fileType: string) {
  try {
    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: data });
      const text = clampText(result.value);
      return { extractedText: text, tocText: buildSimpleToc(text) };
    }

    if (fileType === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data });
      try {
        const result = await parser.getText();
        const text = clampText(result.text || "");
        return { extractedText: text, tocText: buildSimpleToc(text) };
      } finally {
        await parser.destroy();
      }
    }
  } catch (error) {
    console.warn("[Library] Text extraction failed:", error);
  }

  return { extractedText: "", tocText: "" };
}
