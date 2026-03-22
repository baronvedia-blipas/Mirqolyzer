import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Stats } from "@/components/dashboard/stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { UploadTabs } from "@/components/invoices/upload-tabs";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <Stats total={all.length} completed={completed.length} processing={all.filter((i) => i.status === "processing").length} failed={all.filter((i) => i.status === "failed").length} totalAmount={totalAmount} currency="USD" />
      <UploadTabs />
      <Suspense fallback={null}>
        <InvoiceFilters />
      </Suspense>
      <RecentInvoices invoices={all.slice(0, 20)} />
    </div>
  );
}
