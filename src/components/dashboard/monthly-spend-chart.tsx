"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";

export interface MonthlySpendData {
  month: string;
  total: number;
}

interface MonthlySpendChartProps {
  data: MonthlySpendData[];
  currency: string;
}

export function MonthlySpendChart({ data, currency }: MonthlySpendChartProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.total === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spend</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => formatCurrency(v, currency)}
                width={80}
              />
              <Tooltip
                formatter={(value: unknown) => [formatCurrency(Number(value), currency), "Spend"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="total" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
