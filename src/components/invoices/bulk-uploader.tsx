"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { validateFileType, validateFileSize, MAX_FILE_SIZE } from "@/lib/utils/file-validators";
import { toast } from "sonner";

interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  invoiceId?: string;
}

export function BulkUploader() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validated: FileUploadState[] = Array.from(newFiles).map((file) => {
      if (!validateFileType(file.type)) {
        return { file, status: "error" as const, error: "Unsupported file type" };
      }
      if (!validateFileSize(file.size)) {
        return { file, status: "error" as const, error: `Exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB` };
      }
      return { file, status: "pending" as const };
    });
    setFiles((prev) => [...prev, ...validated]);
  }, []);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadAll() {
    setUploading(true);
    const pending = files.filter((f) => f.status === "pending");
    let successCount = 0;

    for (let i = 0; i < pending.length; i++) {
      const fileState = pending[i];
      const idx = files.indexOf(fileState);

      setFiles((prev) =>
        prev.map((f, j) => (j === idx ? { ...f, status: "uploading" } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", fileState.file);

        const res = await fetch("/api/invoices/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setFiles((prev) =>
            prev.map((f, j) =>
              j === idx ? { ...f, status: "error", error: data.error } : f
            )
          );
        } else {
          successCount++;
          setFiles((prev) =>
            prev.map((f, j) =>
              j === idx ? { ...f, status: "done", invoiceId: data.id } : f
            )
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, j) =>
            j === idx ? { ...f, status: "error", error: "Upload failed" } : f
          )
        );
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} facturas procesadas`);
    }
    router.refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = "";
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "relative border-2 border-dashed transition-colors p-6",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div
          className="flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 hover:scale-110">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Arrastra múltiples facturas aquí, o{" "}
              <span className="text-primary hover:underline">explorar</span>
            </p>
            <p className="text-xs text-muted-foreground">PDF, PNG, JPG, WEBP hasta 10MB cada uno</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            multiple
            onChange={handleFileInput}
          />
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} queued
              {doneCount > 0 && ` · ${doneCount} done`}
            </p>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Button size="sm" onClick={uploadAll} disabled={uploading}>
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Processing...</>
                  ) : (
                    `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Clear all
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border rounded-lg border">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {f.status === "done" && <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />}
                  {f.status === "error" && <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  {f.status === "uploading" && <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />}
                  {f.status === "pending" && <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <span className="text-sm truncate">{f.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(f.file.size / 1024).toFixed(0)}KB)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {f.error && <span className="text-xs text-destructive">{f.error}</span>}
                  {f.status !== "uploading" && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
