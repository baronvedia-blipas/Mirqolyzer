"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/invoice";

export function useRealtimeInvoices(initialInvoices: Invoice[]) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const supabase = createClient();

  // Sync with server-fetched data when it changes (page refresh)
  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  useEffect(() => {
    const channel = supabase
      .channel("invoices-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newInvoice = payload.new as Invoice;
            setInvoices((prev) => [newInvoice, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Invoice;
            setInvoices((prev) =>
              prev.map((inv) => (inv.id === updated.id ? updated : inv))
            );
          }

          if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setInvoices((prev) => prev.filter((inv) => inv.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return invoices;
}
