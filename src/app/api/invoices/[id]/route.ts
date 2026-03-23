import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addEditEntry } from "@/lib/utils/edit-history";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { field_name, value } = body;

  if (!field_name || value === undefined) {
    return NextResponse.json({ error: "field_name and value required" }, { status: 400 });
  }

  // Fetch current invoice to get extracted_data for edit history
  const { data: currentInvoice } = await supabase
    .from("invoices")
    .select("extracted_data, category")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!currentInvoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Determine old value for edit history
  const extractedData = currentInvoice.extracted_data ?? {};
  let oldValue: string | number = "";
  if (field_name === "category") {
    oldValue = currentInvoice.category ?? "";
  } else if (extractedData[field_name]) {
    oldValue = extractedData[field_name].value ?? "";
  }

  // Record edit in history
  const updatedExtractedData = addEditEntry(extractedData, field_name, oldValue, value);

  // Category is a direct column, not in extracted_data
  if (field_name === "category") {
    const { error } = await supabase
      .from("invoices")
      .update({ category: String(value), extracted_data: updatedExtractedData })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    return NextResponse.json(data);
  }

  // Update extracted_data with edit history first
  const { error: historyError } = await supabase
    .from("invoices")
    .update({ extracted_data: updatedExtractedData })
    .eq("id", id)
    .eq("user_id", user.id);

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const { error } = await supabase.rpc("update_invoice_field", {
    p_invoice_id: id,
    p_field_name: field_name,
    p_value: String(value),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  await supabase.storage.from("invoices").remove([invoice.file_url]);

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
