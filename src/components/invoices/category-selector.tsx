"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES, suggestCategory } from "@/lib/utils/categories";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface CategorySelectorProps {
  invoiceId: string;
  currentCategory: string | null;
  vendorName: string | null;
}

export function CategorySelector({ invoiceId, currentCategory, vendorName }: CategorySelectorProps) {
  const [category, setCategory] = useState(currentCategory ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const suggestion = vendorName ? suggestCategory(vendorName) : null;

  async function handleChange(value: string) {
    setCategory(value);
    setSaving(true);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_name: "category", value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Category</span>
      </div>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={category}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
      >
        <option value="">Select category...</option>
        {EXPENSE_CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>
      {suggestion && !category && (
        <button
          onClick={() => handleChange(suggestion)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Badge variant="secondary" className="text-xs">Suggested</Badge>
          {EXPENSE_CATEGORIES.find((c) => c.value === suggestion)?.label}
        </button>
      )}
    </div>
  );
}
