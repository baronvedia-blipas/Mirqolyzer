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

const CONFIDENCE_BAR = { high: "bg-success", medium: "bg-warning", low: "bg-destructive" };
const CONFIDENCE_BG = { high: "hover:bg-success/5", medium: "hover:bg-warning/5", low: "hover:bg-destructive/5" };

export function FieldEditor({ label, value, confidence, fieldName, invoiceId, onUpdate }: FieldEditorProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const level = getConfidenceLevel(confidence);
  const { t } = useLanguage();

  async function handleSave() { setSaving(true); await onUpdate(fieldName, editValue); setSaving(false); setEditing(false); }
  function handleCancel() { setEditValue(String(value)); setEditing(false); }

  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className={cn(
      "rounded-lg border border-border/50 p-3.5 transition-all duration-150 group",
      CONFIDENCE_BG[level],
      editing && "ring-2 ring-primary/20 border-primary/30"
    )}>
      {/* Top row: label left, confidence percentage right */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={cn(
          "text-[11px] font-medium tabular-nums",
          level === "high" ? "text-success" : level === "medium" ? "text-warning" : "text-destructive"
        )}>
          {confidencePercent}%
        </span>
      </div>

      {/* Value row */}
      {editing ? (
        <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:text-success hover:bg-success/10" onClick={handleSave} disabled={saving}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", !value && "text-muted-foreground italic")}>
            {value || t("invoice.notDetected")}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Confidence bar — thin colored line under value */}
      <div className="mt-2.5 h-1 w-full bg-muted/80 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", CONFIDENCE_BAR[level])}
          style={{ width: `${confidencePercent}%` }}
        />
      </div>
    </div>
  );
}
