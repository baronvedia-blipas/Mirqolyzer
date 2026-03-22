import { describe, it, expect, vi } from "vitest";

// Mock the heavy dependencies
vi.mock("pdf-parse", () => ({
  default: vi.fn().mockResolvedValue({
    text: "Invoice #123\nTotal: $500.00\nACME Corporation\n123 Business Street, Suite 100, New York, NY 10001",
    numpages: 1,
  }),
}));

vi.mock("tesseract.js", () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({ data: { text: "OCR extracted text" } }),
  },
}));

import { processDocument } from "../pipeline";

describe("processDocument", () => {
  it("uses pdf-parse for text-based PDFs", async () => {
    const buffer = Buffer.from("fake pdf content");
    const result = await processDocument(buffer, "application/pdf", "test.pdf");

    expect(result.method).toBe("pdf-parse");
    expect(result.text).toContain("Invoice #123");
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("uses tesseract for images", async () => {
    const buffer = Buffer.from("fake image content");
    const result = await processDocument(buffer, "image/png", "test.png");

    expect(result.method).toBe("tesseract");
    expect(result.text).toBe("OCR extracted text");
  });

  it("rejects unsupported file types", async () => {
    const buffer = Buffer.from("fake content");
    await expect(
      processDocument(buffer, "text/plain", "test.txt")
    ).rejects.toThrow("Unsupported file type");
  });
});
