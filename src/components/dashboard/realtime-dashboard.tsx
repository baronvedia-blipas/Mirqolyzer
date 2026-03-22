"use client";

import { useRealtimeInvoices } from "@/hooks/use-realtime-invoices";
import { Stats } from "./stats";
import { RecentInvoices } from "./recent-invoices";
import type { Invoice } from "@/types/invoice";

interface RealtimeDashboardProps {
  initialInvoices: Invoice[];
}

export function RealtimeDashboard({ initialInvoices }: RealtimeDashboardProps) {
  const invoices = useRealtimeInvoices(initialInvoices);

  const completed = invoices.filter((i) => i.status === "completed");
  const totalAmount = completed.reduce((sum, i) => sum + (i.total_amount ?? 0), 0);

  return (
    <>
      <Stats
        total={invoices.length}
        completed={completed.length}
        processing={invoices.filter((i) => i.status === "processing").length}
        failed={invoices.filter((i) => i.status === "failed").length}
        totalAmount={totalAmount}
        currency="USD"
      />
      <RecentInvoices invoices={invoices.slice(0, 20)} />
    </>
  );
}
