import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const sortBy = searchParams.get("sort_by") ?? "created_at";
  const sortOrder = searchParams.get("sort_order") === "asc" ? true : false;
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const vendorName = searchParams.get("vendor_name");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const amountMin = searchParams.get("amount_min");
  const amountMax = searchParams.get("amount_max");
  const q = searchParams.get("q");

  const offset = (page - 1) * limit;

  let query = supabase
    .from("invoices")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order(sortBy, { ascending: sortOrder })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (vendorName) query = query.ilike("vendor_name", `%${vendorName}%`);
  if (dateFrom) query = query.gte("invoice_date", dateFrom);
  if (dateTo) query = query.lte("invoice_date", dateTo);
  if (amountMin) query = query.gte("total_amount", parseFloat(amountMin));
  if (amountMax) query = query.lte("total_amount", parseFloat(amountMax));
  if (q) {
    query = query.or(`vendor_name.ilike.%${q}%,invoice_number.ilike.%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  });
}
