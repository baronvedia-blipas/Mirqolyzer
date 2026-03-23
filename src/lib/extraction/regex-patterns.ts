interface FieldMatch {
  value: string | number;
  confidence: number;
}

// ── Invoice Number ──────────────────────────────────────────────

const INVOICE_NUMBER_PATTERNS = [
  // "Invoice #12345", "Invoice No. ABC-2025-001", "Invoice: 999"
  { regex: /(?:invoice|inv)(?:oice)?[\s.]*(?:no|number|num|#)?[\s.:#]*([A-Za-z0-9][\w-]{2,30})/i, confidence: 0.95 },
  // "Factura 00123", "Recibo 456", "Comprobante 789"
  { regex: /(?:factura|recibo|comprobante)[\s.#:]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.9 },
  // "Número de transacción 12345", "No. de transaccion 789", "Nro. transacción 456"
  { regex: /(?:n[uú]mero|no|nro)\.?\s*(?:de\s+)?(?:transacci[oó]n|operaci[oó]n|referencia)[\s:.#]*([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.9 },
  // "Transacción: 12345", "Operación: 789"
  { regex: /(?:transacci[oó]n|operaci[oó]n)[\s:.#]+([A-Za-z0-9][\w-]{1,30})/i, confidence: 0.85 },
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
  // English (also covers shared abbreviations: feb, mar, jun, jul, sep, oct, nov)
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04",
  june: "06", july: "07", august: "08", september: "09",
  october: "10", november: "11", december: "12",
  // Spanish-only abbreviations and full names
  ene: "01", abr: "04", ago: "08", dic: "12",
  enero: "01", febrero: "02", marzo: "03", abril: "04",
  mayo: "05", junio: "06", julio: "07", agosto: "08",
  septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
  // Portuguese
  janeiro: "01", fevereiro: "02", março: "03", maio: "05",
  junho: "06", julho: "07", setembro: "09", outubro: "10",
  novembro: "11", dezembro: "12",
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
        day = match[1].padStart(2, "0");
        month = match[2].padStart(2, "0");
      } else if (b > 12 && a <= 12) {
        day = match[2].padStart(2, "0");
        month = match[1].padStart(2, "0");
      } else if (a <= 12 && b <= 12) {
        const sep = match[0].charAt(match[1].length);
        if (sep === "/") {
          day = match[1].padStart(2, "0");
          month = match[2].padStart(2, "0");
        } else {
          day = match[2].padStart(2, "0");
          month = match[1].padStart(2, "0");
        }
      } else {
        continue;
      }

      if (parseInt(month) <= 12 && parseInt(day) <= 31) {
        dates.push({ value: `${year}-${month}-${day}`, confidence: 0.85 });
      }
    }
  }

  // "Jan 15, 2025", "January 15, 2025", "15 de enero de 2025", "enero 15, 2025"
  const named = /(\w+)\s+(\d{1,2}),?\s+(\d{4})/g;
  while ((match = named.exec(text)) !== null) {
    const monthStr = MONTH_MAP[match[1].toLowerCase()];
    if (monthStr) {
      const day = match[2].padStart(2, "0");
      dates.push({ value: `${match[3]}-${monthStr}-${day}`, confidence: 0.9 });
    }
  }

  // "15 de enero de 2025", "15 de marzo 2025"
  const spanishDate = /(\d{1,2})\s+de\s+(\w+)\s+(?:de\s+)?(\d{4})/gi;
  while ((match = spanishDate.exec(text)) !== null) {
    const monthStr = MONTH_MAP[match[2].toLowerCase()];
    if (monthStr) {
      const day = match[1].padStart(2, "0");
      dates.push({ value: `${match[3]}-${monthStr}-${day}`, confidence: 0.9 });
    }
  }

  // "26 feb. 2026", "3 mar 2025", "15 ene. 2024" (day + abbreviated month + year)
  const dayMonthYear = /(\d{1,2})\s+(\w{3,})\.?\s+(\d{4})/gi;
  while ((match = dayMonthYear.exec(text)) !== null) {
    const monthKey = match[2].toLowerCase().replace(/\.$/, "");
    const monthStr = MONTH_MAP[monthKey];
    if (monthStr) {
      const day = match[1].padStart(2, "0");
      const dateVal = `${match[3]}-${monthStr}-${day}`;
      if (!dates.some((d) => d.value === dateVal)) {
        dates.push({ value: dateVal, confidence: 0.88 });
      }
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
  let match;

  // Latin American format with decimals: "Bs. 900.00", "Bs 1,234.56", "S/. 500.00"
  const latamRegex = /(?:Bs\.?|S\/\.?|Q\.?|RD\$|R\$|L\.?)\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b/gi;
  while ((match = latamRegex.exec(text)) !== null) {
    const raw = match[1];
    // Determine format: if last separator is "." it's US-style, if "," it's EU-style
    const lastDot = raw.lastIndexOf(".");
    const lastComma = raw.lastIndexOf(",");
    let value: number;
    if (lastDot > lastComma) {
      value = parseFloat(raw.replace(/,/g, ""));
    } else {
      value = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    }
    if (!isNaN(value) && value > 0) {
      amounts.push({ value, confidence: 0.95, raw: match[0] });
    }
  }

  // Latin American format WITHOUT decimals: "Bs 120", "Bs120", "S/. 500", "R$ 1.000"
  const latamIntRegex = /(?:Bs\.?|S\/\.?|Q\.?|RD\$|R\$|L\.?)\s*(\d{1,3}(?:[.,]\d{3})*)(?!\d|[.,]\d)/gi;
  while ((match = latamIntRegex.exec(text)) !== null) {
    const raw = match[1];
    // Remove thousand separators
    const value = parseFloat(raw.replace(/[.,]/g, ""));
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.85, raw: match[0] });
    }
  }

  // US format: $1,234.56 or 1,234.56
  const usRegex = /[$\u20AC\u00A3]?\s?(\d{1,3}(?:,\d{3})*\.\d{2})\b/g;
  while ((match = usRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.9, raw: match[0] });
    }
  }

  // European format: 1.234,56
  const euRegex = /(\d{1,3}(?:\.\d{3})*,\d{2})\b/g;
  while ((match = euRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.85, raw: match[0] });
    }
  }

  // Simple: 99.99 or 900.00 (no thousands separator, no currency symbol)
  const simpleRegex = /(?<!\d[.,])(\d+\.\d{2})(?!\d)/g;
  while ((match = simpleRegex.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    if (!isNaN(value) && value > 0 && !amounts.some((a) => a.value === value)) {
      amounts.push({ value, confidence: 0.8, raw: match[0] });
    }
  }

  return amounts;
}

// ── Currency ────────────────────────────────────────────────────

export function extractCurrency(text: string): string {
  const upper = text.toUpperCase();
  // Latin American currencies (check before USD since some use $ symbol)
  if (/\bBs\.?\s*\d/i.test(text) || /\bBOB\b/.test(upper)) return "BOB";
  if (/\bS\/\.?\s*\d/i.test(text) || /\bPEN\b/.test(upper)) return "PEN";
  if (/\bRD\$/.test(text) || /\bDOP\b/.test(upper)) return "DOP";
  if (/\bR\$/.test(text) || /\bBRL\b/.test(upper)) return "BRL";
  if (/\bQ\.?\s*\d/i.test(text) || /\bGTQ\b/.test(upper)) return "GTQ";
  if (/\bL\.?\s*\d/i.test(text) || /\bHNL\b/.test(upper)) return "HNL";
  if (/\bMXN\b/.test(upper)) return "MXN";
  if (/\bCOP\b/.test(upper)) return "COP";
  if (/\bARS\b/.test(upper)) return "ARS";
  if (/\bCLP\b/.test(upper)) return "CLP";
  if (/\bUYU\b/.test(upper)) return "UYU";
  if (/\bPYG\b/.test(upper)) return "PYG";
  // International
  if (/\bEUR\b/.test(upper) || /\u20AC/.test(text)) return "EUR";
  if (/\bGBP\b/.test(upper) || /\u00A3/.test(text)) return "GBP";
  if (/\bCAD\b/.test(upper)) return "CAD";
  if (/\bAUD\b/.test(upper)) return "AUD";
  if (/\bJPY\b/.test(upper) || /\u00A5/.test(text)) return "JPY";
  if (/\bCNY\b/.test(upper)) return "CNY";
  // Default
  if (/\$/.test(text)) return "USD";
  return "USD";
}

// ── Labeled Amount Extraction ───────────────────────────────────

function extractLabeledAmount(text: string, labels: RegExp): FieldMatch | null {
  const lines = text.split("\n");
  for (const line of lines) {
    if (labels.test(line)) {
      const amounts = extractAmounts(line);
      if (amounts.length > 0) {
        return { value: amounts[0].value, confidence: amounts[0].confidence };
      }
    }
  }
  return null;
}

export function extractTotal(text: string): FieldMatch | null {
  // Check labeled amounts first (English + Spanish)
  const totalPattern = /\b(?:total|amount\s+due|balance\s+due|grand\s+total|monto|importe|valor\s+total|total\s+a\s+pagar)\b(?!.*sub)/i;
  const result = extractLabeledAmount(text, totalPattern);
  if (result) return result;

  // Fallback: find the largest amount in the document
  const allAmounts = extractAmounts(text);
  if (allAmounts.length > 0) {
    const largest = allAmounts.reduce((max, a) => a.value > max.value ? a : max);
    return { value: largest.value, confidence: 0.6 };
  }

  return null;
}

export function extractTax(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:tax|iva|vat|gst|hst|impuesto|it)\b/i);
}

export function extractSubtotal(text: string): FieldMatch | null {
  return extractLabeledAmount(text, /\b(?:sub[\s-]?total|importe\s+neto)\b/i);
}

// ── Vendor Name ─────────────────────────────────────────────────

// Labels/headers that should NOT be treated as vendor names
const SKIP_LINES = /^(invoice|factura|receipt|recibo|bill|statement|tax|date|page|tel|fax|email|phone|www\.|http|monto|importe|total|subtotal|fecha|motivo|concepto|detalle|descripci[oó]n|cantidad|precio|observaci[oó]n|de la cuenta|a la cuenta|a nombre de|del banco|n[uú]mero|guardar|enviar|escanea|comprobante)/i;

// Look for bank/company names explicitly labeled
const VENDOR_LABEL_PATTERNS = [
  // "Del banco: Banco XYZ", "Banco: ABC"
  /(?:del\s+banco|banco)[\s:]+(.{3,50})/i,
  // "Empresa: Company Name", "Razón social: Name"
  /(?:empresa|raz[oó]n\s+social|proveedor|emisor)[\s:]+(.{3,50})/i,
  // "Bill from: Company", "From: Company"
  /(?:bill\s+from|from|sold\s+by|seller)[\s:]+(.{3,50})/i,
];

export function extractVendorName(text: string): FieldMatch | null {
  // First try labeled vendor patterns
  for (const pattern of VENDOR_LABEL_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim().replace(/\n.*/, ""); // Take first line only
      if (name.length > 1 && name.length <= 60) {
        return { value: name, confidence: 0.85 };
      }
    }
  }

  // Fallback: first prominent non-label text line
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);

  for (const line of lines.slice(0, 15)) {
    if (SKIP_LINES.test(line)) continue;
    if (/^\d+$/.test(line)) continue; // Skip pure numbers
    if (/^\d{1,2}[/\-.]/.test(line)) continue; // Skip dates
    if (/^\d+\.\d{2}$/.test(line)) continue; // Skip standalone amounts
    if (line.length > 60) continue; // Too long
    if (line.length < 3) continue; // Too short

    return { value: line, confidence: 0.7 };
  }

  return null;
}
