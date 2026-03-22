import type { ExtractedData, ExtractedField } from "@/types/invoice";
import type { VendorPattern } from "@/types/extraction";

export function applyVendorPatterns(
  rawText: string,
  pattern: VendorPattern,
  baseExtraction: ExtractedData
): ExtractedData {
  const result = { ...baseExtraction };

  for (const [fieldName, fieldPattern] of Object.entries(pattern.field_patterns)) {
    if (!(fieldName in result)) continue;

    try {
      const regex = new RegExp(fieldPattern.regex, "i");
      const match = rawText.match(regex);

      if (match?.[1]) {
        const confidenceBoost = Math.min(0.15, pattern.sample_count * 0.03);
        const key = fieldName as keyof ExtractedData;

        (result[key] as ExtractedField<string | number>) = {
          value: match[1].trim() as unknown as string & number,
          confidence: Math.min(1, 0.85 + confidenceBoost),
          source: "vendor_pattern",
        };
      }
    } catch {
      // Invalid regex — skip
    }
  }

  return result;
}
