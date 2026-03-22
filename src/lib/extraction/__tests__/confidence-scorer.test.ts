import { describe, it, expect } from "vitest";
import { calculateOverallConfidence, getConfidenceLevel } from "../confidence-scorer";
import type { ExtractedData } from "@/types/invoice";

describe("calculateOverallConfidence", () => {
  it("averages all field confidences", () => {
    const data: ExtractedData = {
      invoice_number: { value: "123", confidence: 0.9, source: "regex" },
      date: { value: "2025-01-15", confidence: 0.8, source: "regex" },
      total: { value: 100, confidence: 1.0, source: "regex" },
      subtotal: { value: 90, confidence: 0.7, source: "regex" },
      tax: { value: 10, confidence: 0.6, source: "regex" },
      currency: { value: "USD", confidence: 0.9, source: "regex" },
      vendor_name: { value: "Acme", confidence: 0.7, source: "regex" },
    };
    const score = calculateOverallConfidence(data);
    expect(score).toBeCloseTo(0.8, 1);
  });
});

describe("getConfidenceLevel", () => {
  it("returns 'high' for >= 0.7", () => {
    expect(getConfidenceLevel(0.9)).toBe("high");
    expect(getConfidenceLevel(0.7)).toBe("high");
  });

  it("returns 'medium' for 0.4-0.69", () => {
    expect(getConfidenceLevel(0.5)).toBe("medium");
    expect(getConfidenceLevel(0.4)).toBe("medium");
  });

  it("returns 'low' for < 0.4", () => {
    expect(getConfidenceLevel(0.3)).toBe("low");
    expect(getConfidenceLevel(0)).toBe("low");
  });
});
