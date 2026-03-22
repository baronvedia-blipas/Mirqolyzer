import { describe, it, expect } from "vitest";
import { extractFields } from "../field-extractor";

const SAMPLE_INVOICE = `ACME CORPORATION
123 Business Street, Suite 100
New York, NY 10001

Invoice #INV-2025-0042
Date: January 15, 2025

Bill To:
John Smith
456 Client Ave

Description         Qty    Price     Amount
Widget A             10    $25.00    $250.00
Widget B              5    $40.00    $200.00

Subtotal: $450.00
Tax (8%): $36.00
Total: $486.00

Payment Due: February 15, 2025
Thank you for your business!`;

describe("extractFields", () => {
  it("extracts all fields from a standard invoice", () => {
    const result = extractFields(SAMPLE_INVOICE);

    expect(result.vendor_name.value).toBe("ACME CORPORATION");
    expect(result.invoice_number.value).toBe("INV-2025-0042");
    expect(result.total.value).toBe(486.0);
    expect(result.subtotal.value).toBe(450.0);
    expect(result.tax.value).toBe(36.0);
    expect(result.currency.value).toBe("USD");
    expect(result.date.confidence).toBeGreaterThan(0);
  });

  it("returns low confidence for sparse text", () => {
    const result = extractFields("Hello world, this is just some random text.");
    expect(result.invoice_number.confidence).toBe(0);
    expect(result.total.confidence).toBe(0);
  });
});
