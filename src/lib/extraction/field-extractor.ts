import type { ExtractedData, ExtractedField, FieldSource } from "@/types/invoice";
import {
  extractInvoiceNumber,
  extractDates,
  extractTotal,
  extractSubtotal,
  extractTax,
  extractCurrency,
  extractVendorName,
} from "./regex-patterns";

function emptyField<T>(defaultValue: T): ExtractedField<T> {
  return { value: defaultValue, confidence: 0, source: "regex" as FieldSource };
}

export function extractFields(rawText: string): ExtractedData {
  // Invoice number
  const invoiceNum = extractInvoiceNumber(rawText);
  const invoice_number: ExtractedField<string> = invoiceNum
    ? { value: String(invoiceNum.value), confidence: invoiceNum.confidence, source: "regex" }
    : emptyField("");

  // Date — take the first (most prominent) date found
  const dates = extractDates(rawText);
  const date: ExtractedField<string> = dates.length > 0
    ? { value: String(dates[0].value), confidence: dates[0].confidence, source: "regex" }
    : emptyField("");

  // Total
  const totalMatch = extractTotal(rawText);
  const total: ExtractedField<number> = totalMatch
    ? { value: Number(totalMatch.value), confidence: totalMatch.confidence, source: "regex" }
    : emptyField(0);

  // Subtotal
  const subtotalMatch = extractSubtotal(rawText);
  const subtotal: ExtractedField<number> = subtotalMatch
    ? { value: Number(subtotalMatch.value), confidence: subtotalMatch.confidence, source: "regex" }
    : emptyField(0);

  // Tax
  const taxMatch = extractTax(rawText);
  const tax: ExtractedField<number> = taxMatch
    ? { value: Number(taxMatch.value), confidence: taxMatch.confidence, source: "regex" }
    : emptyField(0);

  // Currency
  const currencyStr = extractCurrency(rawText);
  const currency: ExtractedField<string> = {
    value: currencyStr,
    confidence: currencyStr !== "USD" ? 0.9 : 0.7,
    source: "regex",
  };

  // Vendor name
  const vendorMatch = extractVendorName(rawText);
  const vendor_name: ExtractedField<string> = vendorMatch
    ? { value: String(vendorMatch.value), confidence: vendorMatch.confidence, source: "regex" }
    : emptyField("");

  return { invoice_number, date, total, subtotal, tax, currency, vendor_name };
}
