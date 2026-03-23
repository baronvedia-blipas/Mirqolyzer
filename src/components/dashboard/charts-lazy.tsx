"use client";

import dynamic from "next/dynamic";

export const MonthlySpendChartLazy = dynamic(
  () =>
    import("@/components/dashboard/monthly-spend-chart").then((m) => ({
      default: m.MonthlySpendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

export const CategoryChartLazy = dynamic(
  () =>
    import("@/components/dashboard/category-chart").then((m) => ({
      default: m.CategoryChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);

export const TopVendorsChartLazy = dynamic(
  () =>
    import("@/components/dashboard/top-vendors-chart").then((m) => ({
      default: m.TopVendorsChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
    ),
  }
);
