import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Stats } from "@/components/dashboard/stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { InvoiceUploader } from "@/components/invoices/invoice-uploader";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  const all = invoices ?? [];
  const completed = all.filter((i) => i.status === "completed");
  const totalAmount = completed.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <Stats total={all.length} completed={completed.length} processing={all.filter((i) => i.status === "processing").length} failed={all.filter((i) => i.status === "failed").length} totalAmount={totalAmount} currency="USD" />
      <InvoiceUploader />
      <RecentInvoices invoices={all.slice(0, 10)} />
    </div>
  );
}
