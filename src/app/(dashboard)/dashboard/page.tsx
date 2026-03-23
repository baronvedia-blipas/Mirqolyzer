import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Stats } from "@/components/dashboard/stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { UploadTabs } from "@/components/invoices/upload-tabs";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { DashboardTitle } from "@/components/dashboard/page-title";
import { MonthlySpendChart } from "@/components/dashboard/monthly-spend-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TopVendorsChart } from "@/components/dashboard/top-vendors-chart";
import { getCategoryLabel } from "@/lib/utils/categories";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import { EnrichedStats } from "@/components/dashboard/enriched-stats";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Build query with filters
  let query = supabase.from("invoices").select("*").eq("user_id", user.id);

  if (params.q) {
    query = query.or(`vendor_name.ilike.%${params.q}%,invoice_number.ilike.%${params.q}%`);
  }
  if (params.status) query = query.eq("status", params.status);
  if (params.category) query = query.eq("category", params.category);
  if (params.date_from) query = query.gte("invoice_date", params.date_from);
  if (params.date_to) query = query.lte("invoice_date", params.date_to);

  const sortBy = params.sort_by ?? "created_at";
  query = query.order(sortBy, { ascending: false });

  const { data: invoices } = await query;

  const all = invoices ?? [];
  const completed = all.filter((i) => i.status === "completed");
  const totalAmount = completed.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);

  // Determine most common currency
  const currencyCounts: Record<string, number> = {};
  for (const inv of completed) {
    const c = inv.currency ?? "USD";
    currencyCounts[c] = (currencyCounts[c] ?? 0) + 1;
  }
  const currency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";

  // Monthly spend data (last 6 months)
  const now = new Date();
  const monthLabels: string[] = [];
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString("en-US", { month: "short", year: "2-digit" }));
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const monthlyTotals: Record<string, number> = {};
  for (const key of monthKeys) monthlyTotals[key] = 0;
  for (const inv of completed) {
    const date = inv.invoice_date ?? inv.created_at;
    if (!date) continue;
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyTotals) {
      monthlyTotals[key] += inv.total_amount ?? 0;
    }
  }
  const monthlySpendData = monthKeys.map((key, i) => ({
    month: monthLabels[i],
    total: monthlyTotals[key],
  }));

  // Category data
  const categoryTotals: Record<string, number> = {};
  for (const inv of completed) {
    const cat = inv.category ?? "other";
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + (inv.total_amount ?? 0);
  }
  const categoryData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ name: getCategoryLabel(key), value }));

  // Top vendors data (top 5)
  const vendorTotals: Record<string, number> = {};
  for (const inv of completed) {
    const vendor = inv.vendor_name ?? "Unknown";
    vendorTotals[vendor] = (vendorTotals[vendor] ?? 0) + (inv.total_amount ?? 0);
  }
  const topVendorsData = Object.entries(vendorTotals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));

  // Get user's display name for welcome banner
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8">
      <WelcomeBanner name={displayName} />

      <OnboardingGuide show={all.length === 0} />

      <section>
        <Stats total={all.length} completed={completed.length} processing={all.filter((i) => i.status === "processing").length} failed={all.filter((i) => i.status === "failed").length} totalAmount={totalAmount} currency="USD" />
      </section>

      <section>
        <EnrichedStats invoices={all} />
      </section>

      <section data-upload-tabs>
        <UploadTabs />
      </section>

      <section>
        <Suspense fallback={null}>
          <InvoiceFilters />
        </Suspense>
      </section>

      <section>
        <RecentInvoices invoices={all.slice(0, 20)} />
      </section>

      {/* Analytics Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlySpendChart data={monthlySpendData} currency={currency} />
        <CategoryChart data={categoryData} totalAmount={totalAmount} currency={currency} />
      </section>

      <section>
        <TopVendorsChart data={topVendorsData} currency={currency} />
      </section>
    </div>
  );
}
