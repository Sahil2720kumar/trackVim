"use client";

import { useState } from "react";
import { ChartCard } from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 3 Months": 3,
  "Last 6 Months": 6,
  "Last 12 Months": 12,
};

type MemberGrowthDatum = {
  month: string;
  members: number;
};

function computeStats(data: MemberGrowthDatum[]) {
  if (data.length === 0) {
    return { current: 0, addedThisMonth: 0 };
  }

  const current = data[data.length - 1].members;
  const previous = data.length > 1 ? data[data.length - 2].members : current;

  return { current, addedThisMonth: current - previous };
}

export function MemberGrowthChart({ data }: { data: MemberGrowthDatum[] }) {
  const [range, setRange] = useState("Last 3 Months");

  const filteredData = data.slice(-rangeToMonths[range]);

  const stats = computeStats(filteredData);

  return (
    <ChartCard
      title="Member Growth"
      data={filteredData}
      xKey="month"
      dataKey="members"
      color="#10b981"
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
          <p className="text-xs text-muted-foreground">Current Members</p>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {stats.current}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Added This Month</p>
          <p className="text-base sm:text-lg font-bold text-foreground">
            {stats.addedThisMonth >= 0
              ? `+${stats.addedThisMonth}`
              : stats.addedThisMonth}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total Trained</p>
          <p className="text-base sm:text-lg font-bold text-foreground">-</p>
        </div>
      </div>
    </ChartCard>
  );
}
