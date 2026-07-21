"use client";

import { useState } from "react";
import { ChartCard } from "@/components/TrendAreaChart";

const rangeToMonths: Record<string, number> = {
  "Last 12 Months": 12,
  "Last 6 Months": 6,
  "Last 3 Months": 3,
};

type AttendanceDatum = {
  month: string;
  present: number;
  absent: number;
  late: number;
};

function computeStats(data: AttendanceDatum[]) {
  const totals = data.reduce(
    (acc, d) => ({
      present: acc.present + d.present,
      absent: acc.absent + d.absent,
      late: acc.late + d.late,
    }),
    { present: 0, absent: 0, late: 0 },
  );

  const total = totals.present + totals.absent + totals.late;

  const percent = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  return {
    present: { count: totals.present, percent: percent(totals.present) },
    absent: { count: totals.absent, percent: percent(totals.absent) },
    late: { count: totals.late, percent: percent(totals.late) },
  };
}

export function AttendanceAnalyticsChart({
  data,
}: {
  data: AttendanceDatum[];
}) {
  const [range, setRange] = useState("Last 12 Months");

  const filteredData = data.slice(-rangeToMonths[range]);
  const stats = computeStats(filteredData);

  return (
    <ChartCard
      title="Attendance Analytics"
      description="Attendance trend across the year"
      data={filteredData}
      xKey="month"
      dataKey="present"
      color="#4F46E5"
      height={260}
      showDots
      rangeOptions={[
        { value: "Last 12 Months", label: "Last 12 Months" },
        { value: "Last 6 Months", label: "Last 6 Months" },
        { value: "Last 3 Months", label: "Last 3 Months" },
      ]}
      defaultRangeValue="Last 12 Months"
      onRangeChange={setRange}
    >
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-4">
        <div className="text-center">
          <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-green-500" />
          <p className="text-xs text-muted-foreground sm:text-sm">Present</p>
          <p className="text-sm font-bold sm:text-base">
            {stats.present.count} ({stats.present.percent}%)
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-red-500" />
          <p className="text-xs text-muted-foreground sm:text-sm">Absent</p>
          <p className="text-sm font-bold sm:text-base">
            {stats.absent.count} ({stats.absent.percent}%)
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-2 h-3 w-3 rounded-full bg-yellow-500" />
          <p className="text-xs text-muted-foreground sm:text-sm">Late</p>
          <p className="text-sm font-bold sm:text-base">
            {stats.late.count} ({stats.late.percent}%)
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
