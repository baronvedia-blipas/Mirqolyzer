"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

interface ShareButtonProps {
  invoiceId: string;
}

export function ShareButton({ invoiceId }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  async function handleShare() {
    if (open) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/share`, {
        method: "POST",
      });

      if (!res.ok) {
        toast.error(t("common.error"));
        return;
      }

      const data = await res.json();
      setShareUrl(`${window.location.origin}${data.share_url}`);
      setExpiresAt(data.expires_at);
      setOpen(true);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(t("share.copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={handleShare}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Share2 className="h-4 w-4 mr-1" />
        )}
        {t("share.button")}
      </Button>

      {open && shareUrl && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-mono text-foreground truncate"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("share.expires")}
              {expiresAt && (
                <span className="ml-1 text-foreground font-medium">
                  ({new Date(expiresAt).toLocaleString()})
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
