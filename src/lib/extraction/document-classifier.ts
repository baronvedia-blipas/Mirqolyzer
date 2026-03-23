export type DocumentType = "invoice" | "receipt" | "transfer" | "payment" | "other";

export function classifyDocument(rawText: string): { type: DocumentType; confidence: number } {
  const lower = rawText.toLowerCase();

  // Transfer/bank receipt patterns
  if (/transferencia|nro\.?\s*de\s*transacci[oó]n|banco\s+destino|yapeaste|cuenta\s+destino/i.test(lower)) {
    return { type: "transfer", confidence: 0.9 };
  }

  // Invoice patterns
  if (/factura|invoice|nit|raz[oó]n\s+social|detalle\s+de\s+venta/i.test(lower)) {
    return { type: "invoice", confidence: 0.9 };
  }

  // Receipt/ticket patterns
  if (/recibo|comprobante|ticket|boleta|nota\s+de\s+venta/i.test(lower)) {
    return { type: "receipt", confidence: 0.85 };
  }

  // Payment patterns
  if (/pago|payment|abono|dep[oó]sito/i.test(lower)) {
    return { type: "payment", confidence: 0.8 };
  }

  return { type: "other", confidence: 0.5 };
}

export function getDocumentTypeLabel(type: DocumentType, locale: string = "es"): string {
  const labels: Record<string, Record<DocumentType, string>> = {
    es: { invoice: "Factura", receipt: "Recibo", transfer: "Transferencia", payment: "Pago", other: "Otro" },
    en: { invoice: "Invoice", receipt: "Receipt", transfer: "Transfer", payment: "Payment", other: "Other" },
  };
  return labels[locale]?.[type] ?? labels.es[type];
}
