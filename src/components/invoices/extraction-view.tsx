"use client";

import { useRouter } from "next/navigation";
import { FieldEditor } from "./field-editor";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/types/invoice";
import { useLanguage } from "@/lib/i18n/context";
import { getDocumentTypeLabel, type DocumentType } from "@/lib/extraction/document-classifier";

const FIELD_LABEL_KEYS: Record<string, string> = {
  vendor_name: "field.vendor_name",
  invoice_number: "field.invoice_number",
  date: "field.date",
  total: "field.total",
  subtotal: "field.subtotal",
  tax: "field.tax",
  currency: "field.currency",
};

const DOC_TYPE_COLORS: Record<DocumentType, string> = {
  invoice: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  receipt: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  transfer: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  payment: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  other: "bg-muted text-muted-foreground border-border",
};

export function ExtractionView({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const { t, locale } = useLanguage();
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

  // Extract document type before filtering fields
  const docType = (data as any)?.document_type as { value: DocumentType; confidence: number } | undefined;

  // Filter out internal fields (_edit_history, document_type)
  const fields = (Object.entries(data) as [string, { value: string | number; confidence: number }][]).filter(
    ([key]) => !key.startsWith("_") && key !== "document_type"
  );

  return (
    <div className="space-y-2">
      {/* Document type badge */}
      {docType?.value && (
        <div className="mb-3">
          <Badge
            variant="secondary"
            className={`${DOC_TYPE_COLORS[docType.value] ?? DOC_TYPE_COLORS.other} border px-3 py-1 text-xs font-medium`}
          >
            {getDocumentTypeLabel(docType.value, locale)}
            <span className="ml-1.5 opacity-60">{Math.round(docType.confidence * 100)}%</span>
          </Badge>
        </div>
      )}

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
