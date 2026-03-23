"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { validateFileType, validateFileSize, MAX_FILE_SIZE } from "@/lib/utils/file-validators";
import { useLanguage } from "@/lib/i18n/context";

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

  const handleFile = useCallback(async (file: File) => {
    setUploadState({ status: "validating", progress: 10 });
    if (!validateFileType(file.type)) { setUploadState({ status: "error", progress: 0, error: t("upload.fileTypeError") }); return; }
    if (!validateFileSize(file.size)) { setUploadState({ status: "error", progress: 0, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }); return; }

    setUploadState({ status: "uploading", progress: 30 });
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadState({ status: "processing", progress: 60 });
      const res = await fetch("/api/invoices/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) { setUploadState({ status: "error", progress: 0, error: data.error, duplicateId: data.duplicate_id }); return; }
        throw new Error(data.error || "Upload failed");
      }

      setUploadState({ status: "done", progress: 100 });
      setTimeout(() => { router.push(`/dashboard/invoices/${data.id}`); router.refresh(); }, 500);
    } catch (err) {
      setUploadState({ status: "error", progress: 0, error: err instanceof Error ? err.message : "Upload failed" });
    }
  }, [router, t]);

  function handleDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ""; }

  const isProcessing = ["validating", "uploading", "processing"].includes(uploadState.status);

  return (
    <Card className={cn("relative border-2 border-dashed transition-colors p-8", dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50", uploadState.status === "error" && "border-destructive/50 bg-destructive/5")}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
      <div className="flex flex-col items-center justify-center text-center gap-4">
        {isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploadState.status === "validating" && t("upload.validating")}
                {uploadState.status === "uploading" && t("upload.uploading")}
                {uploadState.status === "processing" && t("upload.extracting")}
              </p>
              <div className="h-2 w-48 bg-muted rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${uploadState.progress}%` }} />
              </div>
            </div>
          </>
        ) : uploadState.status === "error" ? (
          <>
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-2">
              <p className="text-sm text-destructive">{uploadState.error}</p>
              {uploadState.duplicateId && <Button variant="link" size="sm" onClick={() => router.push(`/dashboard/invoices/${uploadState.duplicateId}`)}>{t("upload.viewExisting")}</Button>}
              <Button variant="outline" size="sm" onClick={() => setUploadState({ status: "idle", progress: 0 })}>{t("upload.tryAgain")}</Button>
            </div>
          </>
        ) : uploadState.status === "done" ? (
          <><FileText className="h-10 w-10 text-success" /><p className="text-sm text-success font-medium">{t("upload.success")}</p></>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("upload.dragDrop")}{" "}<label className="text-primary cursor-pointer hover:underline">{t("upload.browse")}<input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileInput} /></label></p>
              <p className="text-xs text-muted-foreground">{t("upload.fileTypes")}</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
