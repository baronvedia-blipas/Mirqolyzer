export const EXPENSE_CATEGORIES = [
  { value: "office_supplies", label: "Office Supplies", keywords: ["staples", "paper", "ink", "office depot", "amazon"] },
  { value: "travel", label: "Travel", keywords: ["airline", "hotel", "uber", "lyft", "rental car", "airbnb"] },
  { value: "meals", label: "Meals & Entertainment", keywords: ["restaurant", "cafe", "doordash", "grubhub", "catering"] },
  { value: "utilities", label: "Utilities", keywords: ["electric", "water", "gas", "internet", "phone", "comcast", "at&t"] },
  { value: "rent", label: "Rent", keywords: ["lease", "rent", "property", "landlord"] },
  { value: "software", label: "Software & SaaS", keywords: ["subscription", "license", "adobe", "microsoft", "google", "aws", "slack"] },
  { value: "professional_services", label: "Professional Services", keywords: ["consulting", "legal", "accounting", "lawyer", "attorney"] },
  { value: "marketing", label: "Marketing", keywords: ["advertising", "ads", "google ads", "facebook", "meta", "print", "design"] },
  { value: "shipping", label: "Shipping & Logistics", keywords: ["fedex", "ups", "usps", "dhl", "freight", "shipping"] },
  { value: "insurance", label: "Insurance", keywords: ["insurance", "premium", "coverage", "policy"] },
  { value: "equipment", label: "Equipment", keywords: ["hardware", "computer", "laptop", "printer", "furniture"] },
  { value: "other", label: "Other", keywords: [] },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export function suggestCategory(vendorName: string): ExpenseCategory | null {
  if (!vendorName) return null;
  const lower = vendorName.toLowerCase();

  for (const cat of EXPENSE_CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.value;
    }
  }
  return null;
}

export function getCategoryLabel(value: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
