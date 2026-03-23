import type { ExtractedData } from "@/types/invoice";
import { extractFields } from "./field-extractor";
import { extractFieldsWithLLM } from "./llm-extractor";
import { calculateOverallConfidence } from "./confidence-scorer";

const CONFIDENCE_THRESHOLD = 0.70;

/**
 * Hybrid extraction pipeline:
 * 1. Always run regex first (free, fast)
 * 2. If confidence < 70% AND Gemini API key exists, call LLM
 * 3. Merge: use LLM value for low-confidence fields, keep regex for high-confidence
 * 4. If no API key or LLM fails, return regex result (graceful degradation)
 */
export async function hybridExtract(rawText: string): Promise<{
  data: ExtractedData;
  method: "regex" | "hybrid" | "llm";
}> {
  // Step 1: Regex extraction (always runs, free)
  const regexResult = extractFields(rawText);
  const regexConfidence = calculateOverallConfidence(regexResult);

  // Step 2: If regex is good enough, return it
  if (regexConfidence >= CONFIDENCE_THRESHOLD) {
    return { data: regexResult, method: "regex" };
  }

  // Step 3: Try LLM fallback
  if (!process.env.GEMINI_API_KEY) {
    return { data: regexResult, method: "regex" };
  }

  const llmResult = await extractFieldsWithLLM(rawText);
  if (!llmResult) {
    return { data: regexResult, method: "regex" };
  }

  // Step 4: Merge — for each field, use LLM if regex confidence is low
  const merged: ExtractedData = { ...regexResult };
  const fields = Object.keys(regexResult) as (keyof ExtractedData)[];

  for (const field of fields) {
    const regexField = regexResult[field];
    const llmField = llmResult[field];

    if (regexField.confidence < CONFIDENCE_THRESHOLD && llmField && llmField.value) {
      (merged[field] as typeof llmField) = llmField;
    }
  }

  return { data: merged, method: "hybrid" };
}
