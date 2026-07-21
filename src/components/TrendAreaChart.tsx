"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RangeOption = {
  value: string;
  label: string;
};

interface ChartCardProps {
  title: string;
  description?: string;

  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color?: string; // stroke + gradient color, e.g. "#8b5cf6"

  /** formats a raw value for the Y axis + tooltip, e.g. (v) => `₹${v / 1000000}L` */
  valueFormatter?: (value: number) => string;

  /** range dropdown, e.g. 3m/6m/12m. Omit to hide the dropdown. */
  rangeOptions?: RangeOption[];
  defaultRangeValue?: string;
  rangeValue?: string;
  onRangeChange?: (value: string) => void;

  height?: number;
  showDots?: boolean;
  className?: string;

  /** anything below the chart — usually a stats grid, but can be anything */
  children?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  data,
  xKey,
  dataKey,
  color = "#8b5cf6",
  valueFormatter,
  rangeOptions,
  defaultRangeValue,
  rangeValue,
  onRangeChange,
  height = 300,
  showDots = false,
  className,
  children,
}: ChartCardProps) {
  const gradientId = `color-${dataKey}`;

  return (
    <Card className={`border-border bg-card ${className ?? ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {rangeValue && <CardDescription>{rangeValue}</CardDescription>}
          </div>

          {rangeOptions && rangeOptions.length > 0 && (
            <Select
              // Only pass ONE of these — never both.
              // Controlled mode: parent owns state via rangeValue + onRangeChange.
              // Uncontrolled mode: Select owns its own state, seeded by defaultRangeValue.
              {...(rangeValue !== undefined
                ? { value: rangeValue }
                : { defaultValue: defaultRangeValue })}
              onValueChange={onRangeChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rangeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className={"p-0"}>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) =>
                valueFormatter ? valueFormatter(value) : value
              }
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={showDots ? { fill: color, r: 3 } : false}
              activeDot={showDots ? { r: 5 } : undefined}
            />
          </AreaChart>
        </ResponsiveContainer>

        {children}
      </CardContent>
    </Card>
  );
}

/** Drop-in stats grid to pass as children — 2/4 col responsive, matches original markup */
export function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

export function ChartStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 p-4">
      {children}
    </div>
  );
}
