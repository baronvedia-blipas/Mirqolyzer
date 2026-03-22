import { describe, it, expect } from "vitest";
import { generateFileHash } from "../hash-generator";

describe("generateFileHash", () => {
  it("generates consistent SHA-256 hash for same content", async () => {
    const buffer = Buffer.from("test invoice content");
    const hash1 = await generateFileHash(buffer);
    const hash2 = await generateFileHash(buffer);
    expect(hash1).toBe(hash2);
  });

  it("generates different hashes for different content", async () => {
    const hash1 = await generateFileHash(Buffer.from("invoice A"));
    const hash2 = await generateFileHash(Buffer.from("invoice B"));
    expect(hash1).not.toBe(hash2);
  });

  it("returns a 64-character hex string", async () => {
    const hash = await generateFileHash(Buffer.from("test"));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
