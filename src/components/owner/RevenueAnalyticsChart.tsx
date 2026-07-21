"use client";

import { useState } from "react";
import { ChartCard } from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 12 Months": 12,
  "Last 6 Months": 6,
  "Last 3 Months": 3,
};

type RevenueDatum = {
  month: string;
  revenue: number;
};

function computeStats(data: RevenueDatum[]) {
  if (data.length === 0) {
    return { monthlyAvg: 0, avgPayment: 0, highest: 0 };
  }

  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const highest = Math.max(...data.map((d) => d.revenue));

  return {
    monthlyAvg: Math.round(total / data.length),
    avgPayment: Math.round(total / data.length),
    highest,
  };
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function RevenueAnalyticsChart({ data }: { data: RevenueDatum[] }) {
  const [range, setRange] = useState("Last 12 Months");

  const filteredData = data.slice(-rangeToMonths[range]);
  const stats = computeStats(filteredData);

  return (
    <ChartCard
      className="lg:col-span-2"
      title="Revenue Analytics"
      data={filteredData}
      xKey="month"
      dataKey="revenue"
      color="#4F46E5"
      height={220}
      showDots
      rangeOptions={[
        { value: "Last 12 Months", label: "Last 12 Months" },
        { value: "Last 6 Months", label: "Last 6 Months" },
        { value: "Last 3 Months", label: "Last 3 Months" },
      ]}
      defaultRangeValue="Last 12 Months"
      onRangeChange={setRange}
    >
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border sm:gap-4 sm:mt-6 sm:pt-6 px-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          <p className="mt-1 text-sm font-bold text-foreground sm:text-lg">
            {formatCurrency(stats.monthlyAvg)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Average Payment</p>
          <p className="mt-1 text-sm font-bold text-foreground sm:text-lg">
            {formatCurrency(stats.avgPayment)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Highest Payment</p>
          <p className="mt-1 text-sm font-bold text-foreground sm:text-lg">
            {formatCurrency(stats.highest)}
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
