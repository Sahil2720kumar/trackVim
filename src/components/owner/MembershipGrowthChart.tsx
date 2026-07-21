"use client";

import { useState } from "react";
import { ChartCard } from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 12 Months": 12,
  "Last 6 Months": 6,
  "Last 3 Months": 3,
};

export function MembershipGrowthChart({
  data,
}: {
  data: { month: string; members: number }[];
}) {
  const [range, setRange] = useState("Last 12 Months");

  const filteredData = data.slice(-rangeToMonths[range]);

  return (
    <ChartCard
      className="lg:col-span-2"
      title="Membership Growth"
      data={filteredData}
      xKey="month"
      dataKey="members"
      color="#8b5cf6"
      height={220}
      rangeOptions={[
        { value: "Last 12 Months", label: "Last 12 Months" },
        { value: "Last 6 Months", label: "Last 6 Months" },
        { value: "Last 3 Months", label: "Last 3 Months" },
      ]}
      defaultRangeValue="Last 12 Months"
      onRangeChange={setRange}
    />
  );
}
