import { describe, it, expect } from "vitest";
import { validateFileType, validateFileSize, MAX_FILE_SIZE } from "../file-validators";

describe("validateFileType", () => {
  it("accepts PDF files", () => {
    expect(validateFileType("application/pdf")).toBe(true);
  });

  it("accepts PNG files", () => {
    expect(validateFileType("image/png")).toBe(true);
  });

  it("accepts JPEG files", () => {
    expect(validateFileType("image/jpeg")).toBe(true);
  });

  it("accepts WEBP files", () => {
    expect(validateFileType("image/webp")).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(validateFileType("text/plain")).toBe(false);
    expect(validateFileType("application/zip")).toBe(false);
    expect(validateFileType("image/gif")).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under 10MB", () => {
    expect(validateFileSize(5 * 1024 * 1024)).toBe(true);
  });

  it("accepts files exactly 10MB", () => {
    expect(validateFileSize(MAX_FILE_SIZE)).toBe(true);
  });

  it("rejects files over 10MB", () => {
    expect(validateFileSize(11 * 1024 * 1024)).toBe(false);
  });
});
