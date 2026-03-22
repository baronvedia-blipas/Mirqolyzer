import { describe, it, expect } from "vitest";
import { getPlanLimits, PLANS } from "../plans";

describe("getPlanLimits", () => {
  it("returns free plan limits", () => {
    const limits = getPlanLimits("free");
    expect(limits.invoices_per_month).toBe(5);
    expect(limits.can_export_json).toBe(false);
    expect(limits.can_use_vendor_learning).toBe(false);
  });

  it("returns pro plan limits", () => {
    const limits = getPlanLimits("pro");
    expect(limits.invoices_per_month).toBe(50);
    expect(limits.can_export_json).toBe(true);
    expect(limits.can_use_vendor_learning).toBe(true);
  });

  it("returns business plan limits", () => {
    const limits = getPlanLimits("business");
    expect(limits.invoices_per_month).toBe(500);
    expect(limits.can_export_json).toBe(true);
    expect(limits.can_use_vendor_learning).toBe(true);
  });

  it("defaults to free for unknown plans", () => {
    const limits = getPlanLimits("unknown" as any);
    expect(limits.invoices_per_month).toBe(5);
  });
});

describe("PLANS", () => {
  it("has 3 plans", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("marks pro as popular", () => {
    const pro = PLANS.find((p) => p.plan === "pro");
    expect(pro?.popular).toBe(true);
  });
});
