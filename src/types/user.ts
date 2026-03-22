export type Plan = "free" | "pro" | "business";

export interface Profile {
  id: string;
  full_name: string;
  company: string | null;
  plan: Plan;
  invoice_count_this_month: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
