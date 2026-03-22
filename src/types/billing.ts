import { Plan } from "./user";

export interface PlanConfig {
  name: string;
  plan: Plan;
  price: number;
  invoices_per_month: number;
  features: string[];
  stripe_price_id: string | null;
  popular?: boolean;
}

export interface UsageLimits {
  invoices_per_month: number;
  can_export_json: boolean;
  can_use_vendor_learning: boolean;
}
