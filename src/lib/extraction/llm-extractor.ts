import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedData } from "@/types/invoice";

const EXTRACTION_PROMPT = `You are an invoice data extraction system. Extract the following fields from this invoice/receipt text. Respond ONLY with valid JSON, no markdown.

Fields to extract:
- vendor_name: company or bank name
- invoice_number: transaction number, invoice number, or reference
- date: in ISO format YYYY-MM-DD
- total: numeric amount (the main/total amount)
- subtotal: numeric amount before tax (if present, else 0)
- tax: tax amount (if present, else 0)
- currency: ISO currency code (BOB for Bolivianos, USD, EUR, etc.)

JSON format:
{"vendor_name":"","invoice_number":"","date":"","total":0,"subtotal":0,"tax":0,"currency":""}

Invoice text:
`;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

export async function extractFieldsWithLLM(rawText: string): Promise<ExtractedData | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(EXTRACTION_PROMPT + rawText);
    const response = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      vendor_name: { value: parsed.vendor_name || "", confidence: 0.95, source: "llm" },
      invoice_number: { value: parsed.invoice_number || "", confidence: 0.95, source: "llm" },
      date: { value: parsed.date || "", confidence: 0.95, source: "llm" },
      total: { value: Number(parsed.total) || 0, confidence: 0.95, source: "llm" },
      subtotal: { value: Number(parsed.subtotal) || 0, confidence: 0.95, source: "llm" },
      tax: { value: Number(parsed.tax) || 0, confidence: 0.95, source: "llm" },
      currency: { value: parsed.currency || "USD", confidence: 0.95, source: "llm" },
    };
  } catch (error) {
    console.error("[LLM Extractor] Gemini failed:", error);
    return null;
  }
}
