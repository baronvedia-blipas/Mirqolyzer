"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getConfidenceLevel } from "@/lib/extraction/confidence-scorer";
import { useLanguage } from "@/lib/i18n/context";

interface FieldEditorProps {
  label: string;
  value: string | number;
  confidence: number;
  fieldName: string;
  invoiceId: string;
  onUpdate: (fieldName: string, value: string) => Promise<void>;
}

const CONFIDENCE_STYLES = { high: "border-success/30 bg-success/5", medium: "border-warning/30 bg-warning/5", low: "border-destructive/30 bg-destructive/5" };
const CONFIDENCE_DOT = { high: "bg-success", medium: "bg-warning", low: "bg-destructive" };

export function FieldEditor({ label, value, confidence, fieldName, invoiceId, onUpdate }: FieldEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const level = getConfidenceLevel(confidence);
  const { t } = useLanguage();

  async function handleSave() { setSaving(true); await onUpdate(fieldName, editValue); setSaving(false); setEditing(false); }
  function handleCancel() { setEditValue(String(value)); setEditing(false); }

  return (
    <div className={cn("rounded-lg border p-3 transition-colors", CONFIDENCE_STYLES[level])}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", CONFIDENCE_DOT[level])} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(confidence * 100)}%</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }} />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave} disabled={saving}><Check className="h-3 w-3" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}><X className="h-3 w-3" /></Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", !value && "text-muted-foreground italic")}>{value || t("invoice.notDetected")}</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditing(true)}><Pencil className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );
}
