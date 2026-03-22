import type { Plan } from "@/types/user";
import type { PlanConfig, UsageLimits } from "@/types/billing";

export const PLANS: PlanConfig[] = [
  {
    name: "Free",
    plan: "free",
    price: 0,
    invoices_per_month: 5,
    stripe_price_id: null,
    features: [
      "5 invoices per month",
      "OCR text extraction",
      "CSV export",
      "Duplicate detection",
    ],
  },
  {
    name: "Pro",
    plan: "pro",
    price: 29,
    invoices_per_month: 50,
    stripe_price_id: process.env.STRIPE_PRICE_PRO ?? null,
    popular: true,
    features: [
      "50 invoices per month",
      "OCR text extraction",
      "CSV + JSON export",
      "Duplicate detection",
      "Vendor pattern learning",
    ],
  },
  {
    name: "Business",
    plan: "business",
    price: 59,
    invoices_per_month: 500,
    stripe_price_id: process.env.STRIPE_PRICE_BUSINESS ?? null,
    features: [
      "500 invoices per month",
      "OCR text extraction",
      "CSV + JSON export",
      "Duplicate detection",
      "Vendor pattern learning",
      "Priority support",
    ],
  },
];

const PLAN_LIMITS: Record<Plan, UsageLimits> = {
  free: { invoices_per_month: 5, can_export_json: false, can_use_vendor_learning: false },
  pro: { invoices_per_month: 50, can_export_json: true, can_use_vendor_learning: true },
  business: { invoices_per_month: 500, can_export_json: true, can_use_vendor_learning: true },
};

export function getPlanLimits(plan: Plan): UsageLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function getPlanByPriceId(priceId: string): Plan | null {
  const found = PLANS.find((p) => p.stripe_price_id === priceId);
  return found?.plan ?? null;
}
