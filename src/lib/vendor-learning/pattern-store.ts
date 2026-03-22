import type { SupabaseClient } from "@supabase/supabase-js";
import type { VendorPattern } from "@/types/extraction";

export async function getVendorPattern(
  supabase: SupabaseClient,
  userId: string,
  vendorName: string
): Promise<VendorPattern | null> {
  const { data } = await supabase
    .from("vendor_patterns")
    .select("*")
    .eq("user_id", userId)
    .eq("vendor_name", vendorName.toLowerCase().trim())
    .single();

  return data as VendorPattern | null;
}

export async function upsertVendorPattern(
  supabase: SupabaseClient,
  userId: string,
  vendorName: string,
  fieldName: string,
  pattern: { regex: string; anchor: string; position: string }
): Promise<void> {
  const normalized = vendorName.toLowerCase().trim();
  const existing = await getVendorPattern(supabase, userId, normalized);

  if (existing) {
    const updatedPatterns = {
      ...existing.field_patterns,
      [fieldName]: pattern,
    };
    await supabase
      .from("vendor_patterns")
      .update({
        field_patterns: updatedPatterns,
        sample_count: existing.sample_count + 1,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("vendor_patterns").insert({
      user_id: userId,
      vendor_name: normalized,
      field_patterns: { [fieldName]: pattern },
      sample_count: 1,
    });
  }
}
