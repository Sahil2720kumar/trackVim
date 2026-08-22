"use client";

import { useState } from "react";
import {
  ChartCard,
  ChartStat,
  ChartStatsGrid,
} from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 3 Months": 3,
  "Last 6 Months": 6,
  "Last 12 Months": 12,
};

type RevenueDatum = {
  month: string;
  revenue: number;
};

function computeStats(data: RevenueDatum[]) {
  if (data.length === 0) {
    return { total: 0, avgMonthly: 0, thisMonth: 0, lastMonth: 0 };
  }

  // Defensive coercion — numeric columns from Postgres RPCs arrive as
  // strings over PostgREST; Number(...) is a no-op if the caller already
  // coerced, but prevents string-concat totals if it didn't.
  const values = data.map((d) => Number(d.revenue) || 0);

  const total = values.reduce((sum, v) => sum + v, 0);
  const avgMonthly = Math.round(total / values.length);

  const thisMonth = values[values.length - 1];
  const lastMonth = values.length > 1 ? values[values.length - 2] : 0;

  return { total, avgMonthly, thisMonth, lastMonth };
}

function formatLakhs(value: number) {
  return `₹${(Number(value) / 100000).toFixed(2)}L`;
}

function formatFull(value: number) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function RevenueOverviewChart({ data }: { data: RevenueDatum[] }) {
  const [range, setRange] = useState("Last 12 Months");

  // Normalize once up front so the chart itself (via dataKey="revenue")
  // also plots real numbers, not strings — recharts silently mis-renders
  // string y-values instead of throwing, so this is easy to miss visually.
  const normalizedData = data.map((d) => ({
    ...d,
    revenue: Number(d.revenue) || 0,
  }));

  const filteredData = normalizedData.slice(-rangeToMonths[range]);
  const stats = computeStats(filteredData);

  return (
    <ChartCard
      className="lg:col-span-2"
      title="Revenue Overview"
      rangeValue={range}
      data={filteredData}
      xKey="month"
      dataKey="revenue"
      color="#8b5cf6"
      height={300}
      valueFormatter={formatLakhs}
      rangeOptions={[
        { value: "Last 3 Months", label: "Last 3 months" },
        { value: "Last 6 Months", label: "Last 6 months" },
        { value: "Last 12 Months", label: "Last 12 months" },
      ]}
      onRangeChange={setRange}
    >
      <ChartStatsGrid>
        <ChartStat label="Total Revenue" value={formatFull(stats.total)} />
        <ChartStat
          label="Avg. Monthly Revenue"
          value={formatFull(stats.avgMonthly)}
        />
        <ChartStat label="This Month" value={formatFull(stats.thisMonth)} />
        <ChartStat label="Last Month" value={formatFull(stats.lastMonth)} />
      </ChartStatsGrid>
    </ChartCard>
  );
}
