"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";

export function InvoiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams("q", search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParams]);

  function clearFilters() {
    setSearch("");
    router.push("/dashboard");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices by vendor or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? "bg-primary/10 text-primary" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={searchParams.get("status") ?? ""}
              onChange={(e) => updateParams("status", e.target.value)}
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={searchParams.get("category") ?? ""}
              onChange={(e) => updateParams("category", e.target.value)}
            >
              <option value="">All</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="travel">Travel</option>
              <option value="meals">Meals & Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="software">Software & SaaS</option>
              <option value="professional_services">Professional Services</option>
              <option value="marketing">Marketing</option>
              <option value="shipping">Shipping & Logistics</option>
              <option value="insurance">Insurance</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              className="h-9 w-36"
              value={searchParams.get("date_from") ?? ""}
              onChange={(e) => updateParams("date_from", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              className="h-9 w-36"
              value={searchParams.get("date_to") ?? ""}
              onChange={(e) => updateParams("date_to", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Sort</label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={searchParams.get("sort_by") ?? "created_at"}
              onChange={(e) => updateParams("sort_by", e.target.value)}
            >
              <option value="created_at">Newest</option>
              <option value="total_amount">Amount</option>
              <option value="vendor_name">Vendor</option>
              <option value="invoice_date">Invoice Date</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
