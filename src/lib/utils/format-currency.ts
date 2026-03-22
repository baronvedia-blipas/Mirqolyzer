const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  MXN: "$",
  CAD: "CA$",
  AUD: "A$",
};

export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}
