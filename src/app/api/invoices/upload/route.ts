import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateFileType, validateFileSize } from "@/lib/utils/file-validators";
import { generateFileHash } from "@/lib/duplicate/hash-generator";
import { isFuzzyDuplicate } from "@/lib/duplicate/similarity-matcher";
import { processDocument } from "@/lib/ocr/pipeline";
import { extractFields } from "@/lib/extraction/field-extractor";
import { calculateOverallConfidence } from "@/lib/extraction/confidence-scorer";
import { classifyDocument } from "@/lib/extraction/document-classifier";
import { getPlanLimits } from "@/lib/stripe/plans";
import type { Plan } from "@/types/user";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, invoice_count_this_month")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const limits = getPlanLimits(profile.plan as Plan);
  if (profile.invoice_count_this_month >= limits.invoices_per_month) {
    return NextResponse.json(
      { error: "Monthly invoice limit reached. Please upgrade your plan." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!validateFileType(file.type)) {
    return NextResponse.json({ error: "Only PDF, PNG, JPG, WEBP files are allowed" }, { status: 400 });
  }

  if (!validateFileSize(file.size)) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = await generateFileHash(buffer);

  const { data: existingDuplicate } = await supabase
    .from("invoices")
    .select("id")
    .eq("user_id", user.id)
    .eq("file_hash", fileHash)
    .limit(1)
    .single();

  if (existingDuplicate) {
    return NextResponse.json(
      { error: "This invoice has already been uploaded", duplicate_id: existingDuplicate.id },
      { status: 409 }
    );
  }

  const invoiceId = crypto.randomUUID();
  const storagePath = `${user.id}/${invoiceId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("invoices").insert({
    id: invoiceId,
    user_id: user.id,
    file_url: storagePath,
    file_name: file.name,
    file_hash: fileHash,
    status: "processing",
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create invoice record" }, { status: 500 });
  }

  try {
    const ocrResult = await processDocument(buffer, file.type, file.name);
    const extractedData = extractFields(ocrResult.text);
    const confidenceScore = calculateOverallConfidence(extractedData);

    // Classify document type
    const docClassification = classifyDocument(ocrResult.text);
    (extractedData as any).document_type = {
      value: docClassification.type,
      confidence: docClassification.confidence,
    };

    // Check for fuzzy duplicates
    let duplicateOf: string | null = null;
    if (extractedData.vendor_name.value && extractedData.total.value && extractedData.date.value) {
      const { data: recentInvoices } = await supabase
        .from("invoices")
        .select("id, vendor_name, total_amount, invoice_date")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .limit(50);

      const fuzzyMatch = recentInvoices?.find((inv) =>
        inv.vendor_name && inv.total_amount != null && inv.invoice_date &&
        isFuzzyDuplicate(
          { vendor: extractedData.vendor_name.value, amount: extractedData.total.value, date: extractedData.date.value },
          { vendor: inv.vendor_name, amount: inv.total_amount, date: inv.invoice_date }
        )
      );
      if (fuzzyMatch) duplicateOf = fuzzyMatch.id;
    }

    await supabase
      .from("invoices")
      .update({
        status: "completed",
        raw_text: ocrResult.text,
        extracted_data: extractedData,
        vendor_name: extractedData.vendor_name.value || null,
        invoice_number: extractedData.invoice_number.value || null,
        invoice_date: extractedData.date.value || null,
        total_amount: extractedData.total.value || null,
        currency: extractedData.currency.value || null,
        tax_amount: extractedData.tax.value || null,
        subtotal_amount: extractedData.subtotal.value || null,
        category: docClassification.type,
        confidence_score: confidenceScore,
        duplicate_of: duplicateOf,
      })
      .eq("id", invoiceId);

    await supabase.rpc("increment_invoice_count", { user_id_param: user.id });

    return NextResponse.json({
      id: invoiceId,
      status: "completed",
      confidence_score: confidenceScore,
      extracted_data: extractedData,
      duplicate_of: duplicateOf,
    });
  } catch (err) {
    await supabase
      .from("invoices")
      .update({ status: "failed" })
      .eq("id", invoiceId);

    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ id: invoiceId, status: "failed", error: message }, { status: 422 });
  }
}
