"use client";

import { useRouter } from "next/navigation";
import { FieldEditor } from "./field-editor";
import type { Invoice } from "@/types/invoice";

const FIELD_LABELS: Record<string, string> = {
  vendor_name: "Vendor", invoice_number: "Invoice Number", date: "Date",
  total: "Total", subtotal: "Subtotal", tax: "Tax", currency: "Currency",
};

export function ExtractionView({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
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
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Extracted Fields</h3>
      {fields.map(([key, field]) => (
        <FieldEditor key={key} label={FIELD_LABELS[key] ?? key} value={field.value} confidence={field.confidence} fieldName={key} invoiceId={invoice.id} onUpdate={handleFieldUpdate} />
      ))}
    </div>
  );
}
