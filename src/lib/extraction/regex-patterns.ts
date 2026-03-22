interface FieldMatch {
  value: string | number;
  confidence: number;
}

// ── Invoice Number ──────────────────────────────────────────────

const INVOICE_NUMBER_PATTERNS = [
  // "Invoice #12345", "Invoice No. ABC-2025-001", "Invoice: 999"
  { regex: /(?:invoice|inv)(?:oice)?[\s.]*(?:no|number|num|#)?[\s.:#]*([A-Za-z0-9][\w-]{2,30})/i, confidence: 0.95 },
  // "Factura 00123", "Recibo 456"
  { regex: /(?:factura|recibo)[\s.#:]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.9 },
  // Standalone "#INV-123"
  { regex: /#\s*([A-Za-z0-9][\w-]{2,30})/i, confidence: 0.8 },
];

export function extractInvoiceNumber(text: string): FieldMatch | null {
  for (const { regex, confidence } of INVOICE_NUMBER_PATTERNS) {
    const match = text.match(regex);
    if (match?.[1]) {
      return { value: match[1].trim(), confidence };
    }
  }
  return null;
}

// ── Dates ───────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04",
  june: "06", july: "07", august: "08", september: "09",
  october: "10", november: "11", december: "12",
};

interface DateMatch {
  value: string; // ISO YYYY-MM-DD
  confidence: number;
}

export function extractDates(text: string): DateMatch[] {
  const dates: DateMatch[] = [];

  // ISO: YYYY-MM-DD
  const isoRegex = /(\d{4})-(\d{2})-(\d{2})/g;
  let match;
  while ((match = isoRegex.exec(text)) !== null) {
    dates.push({ value: `${match[1]}-${match[2]}-${match[3]}`, confidence: 0.95 });
  }

  // DD/MM/YYYY, MM-DD-YYYY, DD.MM.YYYY (only if no ISO match to avoid conflicts)
  if (dates.length === 0) {
    const dmy = /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/g;
    while ((match = dmy.exec(text)) !== null) {
      const a = parseInt(match[1]);
      const b = parseInt(match[2]);
      const year = match[3];

      let day: string, month: string;

      if (a > 12 && b <= 12) {
        // a must be day, b is month (DD/MM/YYYY)
        day = match[1].padStart(2, "0");
        month = match[2].padStart(2, "0");
      } else if (b > 12 && a <= 12) {
        // b must be day, a is month (MM-DD-YYYY)
        day = match[2].padStart(2, "0");
        month = match[1].padStart(2, "0");
      } else if (a <= 12 && b <= 12) {
        // Ambiguous — assume MM-DD-YYYY for dash separator, DD/MM/YYYY for slash
        const sep = match[0].charAt(match[1].length);
        if (sep === "/") {
          day = match[1].padStart(2, "0");
          month = match[2].padStart(2, "0");
        } else {
          // MM-DD-YYYY (US convention with dashes)
          day = match[2].padStart(2, "0");
          month = match[1].padStart(2, "0");
        }
      } else {
        continue; // invalid
      }

      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        dates.push({ value: `${year}-${month}-${day}`, confidence: 0.85 });
      }
    }
  }

  // "Jan 15, 2025" or "January 15, 2025"
  const named = /(\w+)\s+(\d{1,2}),?\s+(\d{4})/g;
  while ((match = named.exec(text)) !== null) {
    const monthStr = MONTH_MAP[match[1].toLowerCase()];
    if (monthStr) {
      const day = match[2].padStart(2, "0");
      dates.push({ value: `${match[3]}-${monthStr}-${day}`, confidence: 0.9 });
    }
  }

  return dates;
}

// ── Amounts ─────────────────────────────────────────────────────

interface AmountMatch {
  value: number;
  confidence: number;
  raw: string;
}

export function extractAmounts(text: string): AmountMatch[] {
  const amounts: AmountMatch[] = [];

  // US format: $1,234.56 or 1,234.56
  const usRegex = /[$\u20AC\u00A3]?\s?(\d{1,3}(?:,\d{3})*\.\d{2})\b/g;
  let match;
  while ((match = usRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(value) && value > 0) {
      amounts.push({ value, confidence: 0.9, raw: match[0] });
    }
  }

  // European format: 1.234,56
  const euRegex = /(\d{1,3}(?:\.\d{3})*,\d{2})\b/g;
  while ((match = euRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(value) && value > 0) {
      amounts.push({ value, confidence: 0.85, raw: match[0] });
    }
  }

  // Simple: 99.99 (no thousands separator)
  const simpleRegex = /(?<!\d[.,])(\d+\.\d{2})(?!\d)/g;
  while ((match = simpleRegex.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    // Avoid duplicates from US regex
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.8, raw: match[0] });
    }
  }

  return amounts;
}

// ── Currency ────────────────────────────────────────────────────

export function extractCurrency(text: string): string {
  const upper = text.toUpperCase();
  if (/\bMXN\b/.test(upper)) return "MXN";
  if (/\bEUR\b/.test(upper) || /\u20AC/.test(text)) return "EUR";
  if (/\bGBP\b/.test(upper) || /\u00A3/.test(text)) return "GBP";
  if (/\bCAD\b/.test(upper)) return "CAD";
  if (/\bAUD\b/.test(upper)) return "AUD";
  return "USD";
}

// ── Labeled Amount Extraction ───────────────────────────────────

function extractLabeledAmount(text: string, labels: RegExp): FieldMatch | null {
  const lines = text.split("\n");
  for (const line of lines) {
    if (labels.test(line)) {
      const amounts = extractAmounts(line);
      if (amounts.length > 0) {
        return { value: amounts[0].value, confidence: 0.9 };
      }
    }
  }
  return null;
}

export function extractTotal(text: string): FieldMatch | null {
  // Avoid matching "Subtotal" lines
  const totalPattern = /\b(?:total|amount\s+due|balance\s+due|grand\s+total)\b(?!.*sub)/i;
  return extractLabeledAmount(text, totalPattern);
}

export function extractTax(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:tax|iva|vat|gst|hst)\b/i);
}

export function extractSubtotal(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:sub[\s-]?total)\b/i);
}

// ── Vendor Name ─────────────────────────────────────────────────

const SKIP_LINES = /^(invoice|factura|receipt|recibo|bill|statement|tax|date|page|\d|#|tel|fax|email|phone|www\.|http)/i;

export function extractVendorName(text: string): FieldMatch | null {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);

  for (const line of lines.slice(0, 10)) {
    if (SKIP_LINES.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (line.length > 60) continue;

    return { value: line, confidence: 0.7 };
  }

  return null;
}
