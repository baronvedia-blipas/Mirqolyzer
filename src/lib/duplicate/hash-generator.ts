import { createHash } from "crypto";

export async function generateFileHash(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("hex");
}
