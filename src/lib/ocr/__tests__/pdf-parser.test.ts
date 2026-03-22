import { describe, it, expect } from "vitest";
import { isTextPdf } from "../pdf-parser";

describe("isTextPdf", () => {
  it("returns true for text with > 50 characters", () => {
    expect(isTextPdf("This is a text-based PDF with more than fifty characters of content inside.")).toBe(true);
  });

  it("returns false for empty text", () => {
    expect(isTextPdf("")).toBe(false);
  });

  it("returns false for text under 50 characters", () => {
    expect(isTextPdf("Short")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isTextPdf(null as unknown as string)).toBe(false);
    expect(isTextPdf(undefined as unknown as string)).toBe(false);
  });
});
