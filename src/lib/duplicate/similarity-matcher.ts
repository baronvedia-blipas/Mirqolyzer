interface InvoiceSignature {
  vendor: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
}

export function isFuzzyDuplicate(a: InvoiceSignature, b: InvoiceSignature): boolean {
  // Vendor must match (case-insensitive)
  if (a.vendor.toLowerCase().trim() !== b.vendor.toLowerCase().trim()) return false;

  // Amount must match exactly
  if (a.amount !== b.amount) return false;

  // Date must be within 1 day
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 1;
}
