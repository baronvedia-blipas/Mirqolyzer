import type { ExtractedData } from "@/types/invoice";

export type ConfidenceLevel = "high" | "medium" | "low";

export function calculateOverallConfidence(data: ExtractedData): number {
  const fields = Object.values(data);
  if (fields.length === 0) return 0;
  const sum = fields.reduce((acc, field) => acc + field.confidence, 0);
  return sum / fields.length;
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}
