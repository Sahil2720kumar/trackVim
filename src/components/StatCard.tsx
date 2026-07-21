// components/stat-card.tsx
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  badge?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  badge,
  subtitle,
}: StatCardProps) {
  return (
    <Card className="rounded-2xl border-none shadow-none hover:border-foreground/20 transition-colors p-0">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={cn("p-2 sm:p-2.5 rounded-xl", iconBg)}>
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
          </div>

          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap",
                trend.positive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              {trend.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}

          {!trend && badge && (
            <span className="inline-flex items-center px-1.5 sm:px-2 py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        <p className="text-xl sm:text-3xl font-bold text-foreground mb-1 truncate">
          {value}
        </p>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
