"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { validateFileType, validateFileSize, MAX_FILE_SIZE } from "@/lib/utils/file-validators";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import { useFirstInvoice } from "@/hooks/use-first-invoice";
import { Confetti } from "@/components/ui/confetti";

interface UploadState {
  status: "idle" | "validating" | "uploading" | "processing" | "done" | "error";
  progress: number;
  error?: string;
  duplicateId?: string;
}

export function InvoiceUploader() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle", progress: 0 });
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showConfetti, triggerConfetti, dismiss } = useFirstInvoice();

  const handleFile = useCallback(async (file: File) => {
    setUploadState({ status: "validating", progress: 10 });
    if (!validateFileType(file.type)) { setUploadState({ status: "error", progress: 0, error: t("upload.fileTypeError") }); toast.error(t("upload.fileTypeError")); return; }
    if (!validateFileSize(file.size)) { const msg = `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`; setUploadState({ status: "error", progress: 0, error: msg }); toast.error(msg); return; }

    setUploadState({ status: "uploading", progress: 30 });
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadState({ status: "processing", progress: 60 });
      const res = await fetch("/api/invoices/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) { setUploadState({ status: "error", progress: 0, error: data.error, duplicateId: data.duplicate_id }); toast.warning("Esta factura ya fue subida"); return; }
        throw new Error(data.error || "Upload failed");
      }

      setUploadState({ status: "done", progress: 100 });
      const isFirst = triggerConfetti();
      toast.success(isFirst ? "\ud83c\udf89 \u00a1Tu primera factura fue procesada!" : "Factura procesada exitosamente");
      setTimeout(() => { router.push(`/dashboard/invoices/${data.id}`); router.refresh(); }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setUploadState({ status: "error", progress: 0, error: errorMsg });
      toast.error(errorMsg);
    }
  }, [router, t, triggerConfetti]);

  function handleDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ""; }

  const isProcessing = ["validating", "uploading", "processing"].includes(uploadState.status);

  return (
    <>
    <Card
      className={cn(
        "relative border-2 border-dashed transition-all duration-300 overflow-hidden",
        dragOver
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg"
          : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/[0.02]",
        uploadState.status === "error" && "border-destructive/50 bg-destructive/5",
        uploadState.status === "idle" && "animate-[border-pulse_3s_ease-in-out_infinite]",
      )}
      style={uploadState.status === "idle" ? {
        animation: "border-pulse 3s ease-in-out infinite",
      } : undefined}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Subtle background pattern for idle state */}
      {uploadState.status === "idle" && (
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      <div className="relative flex flex-col items-center justify-center text-center gap-4 p-8">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
              {/* Progress ring overlay */}
              <svg className="absolute inset-0 h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeDasharray={`${uploadState.progress * 1.5} 150`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {uploadState.status === "validating" && t("upload.validating")}
                {uploadState.status === "uploading" && t("upload.uploading")}
                {uploadState.status === "processing" && t("upload.extracting")}
              </p>
              <div className="h-1.5 w-56 bg-muted rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{uploadState.progress}%</p>
            </div>
          </>
        ) : uploadState.status === "error" ? (
          <>
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">{uploadState.error}</p>
              {uploadState.duplicateId && (
                <Button variant="link" size="sm" onClick={() => router.push(`/dashboard/invoices/${uploadState.duplicateId}`)}>
                  {t("upload.viewExisting")}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setUploadState({ status: "idle", progress: 0 })}>
                {t("upload.tryAgain")}
              </Button>
            </div>
          </>
        ) : uploadState.status === "done" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <p className="text-sm text-success font-semibold">{t("upload.success")}</p>
          </div>
        ) : (
          <div
            className="cursor-pointer flex flex-col items-center gap-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                {t("upload.dragDrop")}{" "}
                <span className="text-primary hover:underline underline-offset-2 transition-colors">
                  {t("upload.browse")}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{t("upload.fileTypes")}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>
    </Card>
    {showConfetti && <Confetti onComplete={dismiss} />}
    </>
  );
}
