"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";

export interface TopVendorData {
  name: string;
  total: number;
}

interface TopVendorsChartProps {
  data: TopVendorData[];
  currency: string;
}

const GRADIENT_COLORS = [
  "#1e3a5f",
  "#2a5480",
  "#366ea0",
  "#4a88b8",
  "#6aa0cc",
];

export function TopVendorsChart({ data, currency }: TopVendorsChartProps) {
  const isEmpty = data.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => formatCurrency(v, currency)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                width={120}
              />
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value), currency), "Total Spend"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
