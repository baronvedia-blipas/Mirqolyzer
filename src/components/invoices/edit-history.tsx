"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { EditEntry } from "@/lib/utils/edit-history";

function formatRelativeTime(timestamp: string, locale: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (locale === "es") {
    if (diffSec < 60) return "hace un momento";
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr}h`;
    if (diffDay < 30) return `hace ${diffDay}d`;
    return new Date(timestamp).toLocaleDateString("es");
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString("en");
}

const FIELD_LABELS: Record<string, Record<string, string>> = {
  es: {
    vendor_name: "Proveedor",
    invoice_number: "Número de factura",
    date: "Fecha",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuesto",
    currency: "Moneda",
    category: "Categoría",
  },
  en: {
    vendor_name: "Vendor",
    invoice_number: "Invoice Number",
    date: "Date",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    currency: "Currency",
    category: "Category",
  },
};

export function EditHistory({ extractedData }: { extractedData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLanguage();

  const history: EditEntry[] = extractedData?._edit_history ?? [];

  const noEditsLabel = locale === "es" ? "Sin ediciones" : "No edits";
  const historyLabel = locale === "es" ? "Historial de ediciones" : "Edit history";

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{historyLabel}</span>
          {history.length > 0 && (
            <span className="text-[11px] tabular-nums bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {history.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border/50 px-4 py-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">{noEditsLabel}</p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((entry, i) => {
                const fieldLabel =
                  FIELD_LABELS[locale]?.[entry.field] ??
                  FIELD_LABELS.es[entry.field] ??
                  entry.field;

                return (
                  <div
                    key={`${entry.field}-${entry.timestamp}-${i}`}
                    className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{fieldLabel}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <span className="truncate max-w-[120px] line-through opacity-60">
                          {String(entry.oldValue) || "—"}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[120px] font-medium text-foreground">
                          {String(entry.newValue) || "—"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 mt-0.5">
                      {formatRelativeTime(entry.timestamp, locale)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
