import pdfParse from "pdf-parse";

export const TEXT_THRESHOLD = 50;

export function isTextPdf(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.trim().length >= TEXT_THRESHOLD;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const result = await pdfParse(buffer);
  return {
    text: result.text,
    numPages: result.numpages,
  };
}
