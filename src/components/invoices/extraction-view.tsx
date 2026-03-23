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

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted/80 flex items-center justify-center mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">No extraction data available.</p>
    </div>
  );

  const fields = Object.entries(data) as [string, { value: string | number; confidence: number }][];

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("invoice.extractedFields")}
        </h3>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {fields.length} fields
        </span>
      </div>

      {/* Field list */}
      <div className="space-y-2">
        {fields.map(([key, field]) => (
          <FieldEditor
            key={key}
            label={FIELD_LABEL_KEYS[key] ? t(FIELD_LABEL_KEYS[key] as any) : key}
            value={field.value}
            confidence={field.confidence}
            fieldName={key}
            invoiceId={invoice.id}
            onUpdate={handleFieldUpdate}
          />
        ))}
      </div>
    </div>
  );
}
