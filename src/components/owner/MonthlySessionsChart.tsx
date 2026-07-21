"use client";

import { useState } from "react";
import { ChartCard } from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 3 Months": 3,
  "Last 6 Months": 6,
  "Last 12 Months": 12,
};

type SessionDatum = {
  month: string;
  sessions: number;
};

function computeStats(data: SessionDatum[]) {
  if (data.length === 0) {
    return { total: 0, avg: 0, bestMonth: "-", bestValue: 0 };
  }

  const total = data.reduce((sum, d) => sum + d.sessions, 0);
  const avg = Math.round(total / data.length);

  const best = data.reduce((max, d) => (d.sessions > max.sessions ? d : max));

  return { total, avg, bestMonth: best.month, bestValue: best.sessions };
}

export function MonthlySessionsChart({ data }: { data: SessionDatum[] }) {
  const [range, setRange] = useState("Last 3 Months");

  const filteredData = data.slice(-rangeToMonths[range]);
  const stats = computeStats(filteredData);

  return (
    <ChartCard
      title="Monthly Sessions"
      data={filteredData}
      xKey="month"
      dataKey="sessions"
      color="#8b5cf6"
      height={220}
      rangeOptions={[
        { value: "Last 3 Months", label: "Last 3 Months" },
        { value: "Last 6 Months", label: "Last 6 Months" },
        { value: "Last 12 Months", label: "Last 12 Months" },
      ]}
      defaultRangeValue="Last 3 Months"
      onRangeChange={setRange}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-4 border-t px-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Sessions</p>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {stats.total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Avg. Sessions / Month</p>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {stats.avg}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Best Month</p>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {stats.bestMonth} ({stats.bestValue})
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
