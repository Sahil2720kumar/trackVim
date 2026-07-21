// components/charts/PieChartCard.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export interface PieChartDatum {
  name: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: PieChartDatum[];
  className?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showSliceLabels?: boolean;
  /** How each legend row's value is displayed */
  legendFormat?: "percent" | "count" | "countAndPercent";
  /** Override total used for percent calc; defaults to sum of data values */
  total?: number;
}

export function PieChartCard({
  title,
  subtitle,
  data,
  className,
  height = 200,
  innerRadius = 45,
  outerRadius = 65,
  showTooltip = false,
  showSliceLabels = false,
  legendFormat = "percent",
  total,
}: PieChartCardProps) {
  const computedTotal = total ?? data.reduce((sum, d) => sum + d.value, 0);

  const renderLegendValue = (d: PieChartDatum) => {
    const pct = computedTotal
      ? ((d.value / computedTotal) * 100).toFixed(1)
      : "0.0";
    switch (legendFormat) {
      case "count":
        return d.value;
      case "countAndPercent":
        return `${d.value} (${pct}%)`;
      case "percent":
      default:
        return `${pct}%`;
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-4 sm:mb-5">{subtitle}</p>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={
              showSliceLabels
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : undefined
            }
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-2 mt-4">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
            <span className="font-semibold text-foreground">
              {renderLegendValue(d)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
