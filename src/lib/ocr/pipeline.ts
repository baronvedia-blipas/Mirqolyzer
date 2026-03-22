import { extractTextFromPdf, isTextPdf } from "./pdf-parser";
import { ocrImage } from "./tesseract-worker";
import { isPdf, isImage } from "@/lib/utils/file-validators";

export interface OcrResult {
  text: string;
  method: "pdf-parse" | "tesseract";
  processingTimeMs: number;
}

export async function processDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<OcrResult> {
  const start = Date.now();

  if (isPdf(mimeType)) {
    // Try text extraction first
    const { text, numPages } = await extractTextFromPdf(buffer);

    if (isTextPdf(text)) {
      return {
        text,
        method: "pdf-parse",
        processingTimeMs: Date.now() - start,
      };
    }

    // Scanned PDF — limit to single page for MVP
    if (numPages > 1) {
      throw new Error(
        "Scanned PDFs are limited to 1 page. Please split or use a text-based PDF."
      );
    }

    // For single-page scanned PDFs, OCR the buffer directly
    const ocrText = await ocrImage(buffer);
    return {
      text: ocrText,
      method: "tesseract",
      processingTimeMs: Date.now() - start,
    };
  }

  if (isImage(mimeType)) {
    const text = await ocrImage(buffer);
    return {
      text,
      method: "tesseract",
      processingTimeMs: Date.now() - start,
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
