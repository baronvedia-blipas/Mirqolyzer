"use client";

import { useRouter } from "next/navigation";
import { FieldEditor } from "./field-editor";
import type { Invoice } from "@/types/invoice";
import { useLanguage } from "@/lib/i18n/context";

const FIELD_LABEL_KEYS: Record<string, string> = {
  vendor_name: "field.vendor_name",
  invoice_number: "field.invoice_number",
  date: "field.date",
  total: "field.total",
  subtotal: "field.subtotal",
  tax: "field.tax",
  currency: "field.currency",
};

export function ExtractionView({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const { t } = useLanguage();
  const data = invoice.extracted_data;

  async function handleFieldUpdate(fieldName: string, value: string) {
    await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_name: fieldName, value }),
    });
    router.refresh();
  }

  if (!data) return <div className="text-center text-muted-foreground py-8">No extraction data available.</div>;

  const fields = Object.entries(data) as [string, { value: string | number; confidence: number }][];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{t("invoice.extractedFields")}</h3>
      {fields.map(([key, field]) => (
        <FieldEditor key={key} label={FIELD_LABEL_KEYS[key] ? t(FIELD_LABEL_KEYS[key] as any) : key} value={field.value} confidence={field.confidence} fieldName={key} invoiceId={invoice.id} onUpdate={handleFieldUpdate} />
      ))}
    </div>
  );
}
