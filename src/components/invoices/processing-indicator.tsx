"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProcessingIndicatorProps {
  invoiceId: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export function ProcessingIndicator({ invoiceId, initialStatus, onStatusChange }: ProcessingIndicatorProps) {
  const [status, setStatus] = useState(initialStatus);
  const supabase = createClient();

  useEffect(() => {
    if (status !== "processing") return;

    const channel = supabase
      .channel(`invoice-${invoiceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invoices",
          filter: `id=eq.${invoiceId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          setStatus(newStatus);
          onStatusChange?.(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, status, supabase, onStatusChange]);

  if (status !== "processing") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Processing...</span>
    </div>
  );
}
