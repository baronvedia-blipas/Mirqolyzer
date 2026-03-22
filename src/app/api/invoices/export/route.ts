import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/stripe/plans";
import type { Plan } from "@/types/user";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = new URL(request.url).searchParams.get("format") ?? "csv";

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profile?.plan ?? "free") as Plan);
  if (format === "json" && !limits.can_export_json) {
    return NextResponse.json(
      { error: "JSON export requires Pro or Business plan" },
      { status: 403 }
    );
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ error: "No invoices to export" }, { status: 404 });
  }

  if (format === "json") {
    const exportData = invoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      vendor_name: inv.vendor_name,
      invoice_date: inv.invoice_date,
      total_amount: inv.total_amount,
      currency: inv.currency,
      tax_amount: inv.tax_amount,
      subtotal_amount: inv.subtotal_amount,
      category: inv.category,
      file_name: inv.file_name,
      confidence_score: inv.confidence_score,
      created_at: inv.created_at,
    }));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mirqolyzer-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  const headers = ["Invoice Number", "Vendor", "Date", "Total", "Currency", "Tax", "Subtotal", "Category", "File", "Confidence", "Uploaded"];
  const rows = invoices.map((inv) =>
    [
      inv.invoice_number ?? "",
      inv.vendor_name ?? "",
      inv.invoice_date ?? "",
      inv.total_amount ?? "",
      inv.currency ?? "",
      inv.tax_amount ?? "",
      inv.subtotal_amount ?? "",
      inv.category ?? "",
      inv.file_name,
      inv.confidence_score?.toFixed(2) ?? "",
      inv.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="mirqolyzer-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
