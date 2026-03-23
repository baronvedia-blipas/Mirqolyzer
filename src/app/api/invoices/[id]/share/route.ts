import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the invoice and verify ownership
  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, extracted_data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Generate share token and expiration (24 hours)
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Store share info in extracted_data JSONB under _share key
  const updatedData = {
    ...(invoice.extracted_data ?? {}),
    _share: { token, expires_at: expiresAt },
  };

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ extracted_data: updatedData })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const shareUrl = `/shared/${token}`;

  return NextResponse.json({ share_url: shareUrl, expires_at: expiresAt });
}
