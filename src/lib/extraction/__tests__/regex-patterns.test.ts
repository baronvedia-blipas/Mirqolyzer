import { describe, it, expect } from "vitest";
import {
  extractInvoiceNumber,
  extractDates,
  extractAmounts,
  extractVendorName,
  extractTax,
  extractTotal,
  extractSubtotal,
  extractCurrency,
} from "../regex-patterns";

describe("extractInvoiceNumber", () => {
  it("matches 'Invoice #12345'", () => {
    const result = extractInvoiceNumber("Invoice #12345\nSome other text");
    expect(result).toEqual({ value: "12345", confidence: 0.95 });
  });

  it("matches 'Invoice No. ABC-2025-001'", () => {
    const result = extractInvoiceNumber("Invoice No. ABC-2025-001\nDate: 2025-01-15");
    expect(result).toEqual({ value: "ABC-2025-001", confidence: 0.95 });
  });

  it("matches 'Factura 00123'", () => {
    const result = extractInvoiceNumber("Factura 00123\nFecha: 15/01/2025");
    expect(result).toEqual({ value: "00123", confidence: 0.9 });
  });

  it("matches 'Inv. 789'", () => {
    const result = extractInvoiceNumber("Inv. 789\nVendor: Acme Corp");
    expect(result?.value).toBe("789");
    expect(result?.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("returns null when no pattern matches", () => {
    const result = extractInvoiceNumber("Just some random text here\nWith nothing useful");
    expect(result).toBeNull();
  });
});

describe("extractDates", () => {
  it("matches DD/MM/YYYY", () => {
    const results = extractDates("Date: 15/01/2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches MM-DD-YYYY", () => {
    const results = extractDates("Date: 01-15-2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches 'Jan 15, 2025'", () => {
    const results = extractDates("Invoice Date: Jan 15, 2025");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("matches ISO format YYYY-MM-DD", () => {
    const results = extractDates("Date: 2025-01-15");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe("2025-01-15");
  });

  it("returns empty array for no dates", () => {
    const results = extractDates("No dates here");
    expect(results).toEqual([]);
  });
});

describe("extractAmounts", () => {
  it("matches $1,234.56", () => {
    const results = extractAmounts("Total: $1,234.56");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(1234.56);
  });

  it("matches 1.234,56 (European format)", () => {
    const results = extractAmounts("Total: 1.234,56 EUR");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(1234.56);
  });

  it("matches simple amounts like 99.99", () => {
    const results = extractAmounts("Price: 99.99");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].value).toBe(99.99);
  });

  it("returns empty for no amounts", () => {
    const results = extractAmounts("No amounts here");
    expect(results).toEqual([]);
  });
});

describe("extractCurrency", () => {
  it("detects USD from $ symbol", () => {
    expect(extractCurrency("Total: $500.00")).toBe("USD");
  });

  it("detects EUR from text", () => {
    expect(extractCurrency("Total: 500.00 EUR")).toBe("EUR");
  });

  it("detects MXN from text", () => {
    expect(extractCurrency("Total: $500.00 MXN")).toBe("MXN");
  });

  it("defaults to USD", () => {
    expect(extractCurrency("Total: 500.00")).toBe("USD");
  });
});

describe("extractTotal", () => {
  it("extracts amount after 'Total'", () => {
    const text = "Subtotal: $100.00\nTax: $8.00\nTotal: $108.00";
    const result = extractTotal(text);
    expect(result?.value).toBe(108.0);
    expect(result?.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("extracts amount after 'Amount Due'", () => {
    const text = "Amount Due: $250.00";
    const result = extractTotal(text);
    expect(result?.value).toBe(250.0);
  });

  it("extracts amount after 'Balance Due'", () => {
    const text = "Balance Due: $75.50";
    const result = extractTotal(text);
    expect(result?.value).toBe(75.5);
  });
});

describe("extractTax", () => {
  it("extracts amount after 'Tax'", () => {
    const result = extractTax("Tax: $8.00\nTotal: $108.00");
    expect(result?.value).toBe(8.0);
  });

  it("extracts amount after 'IVA'", () => {
    const result = extractTax("IVA: $16.00");
    expect(result?.value).toBe(16.0);
  });

  it("extracts amount after 'VAT'", () => {
    const result = extractTax("VAT 20%: $20.00");
    expect(result?.value).toBe(20.0);
  });
});

describe("extractSubtotal", () => {
  it("extracts amount after 'Subtotal'", () => {
    const result = extractSubtotal("Subtotal: $100.00\nTax: $8.00");
    expect(result?.value).toBe(100.0);
  });

  it("extracts amount after 'Sub-total'", () => {
    const result = extractSubtotal("Sub-total: $85.00");
    expect(result?.value).toBe(85.0);
  });
});

describe("extractVendorName", () => {
  it("extracts first prominent text line", () => {
    const text = "ACME CORPORATION\n123 Business St\nInvoice #12345";
    const result = extractVendorName(text);
    expect(result?.value).toBe("ACME CORPORATION");
  });

  it("skips common non-vendor lines", () => {
    const text = "INVOICE\nBEST COMPANY LLC\n123 Main St";
    const result = extractVendorName(text);
    expect(result?.value).toBe("BEST COMPANY LLC");
  });
});
