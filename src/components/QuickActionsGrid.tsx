import { QuickActionCard } from "@/components/QuickActionCard";
import { QuickAction, dashboardQuickActions } from "./owner/quick-actions-data";

interface QuickActionsGridProps {
  actions?: QuickAction[];
  columns?: 2 | 3 | 4;
}

export function QuickActionsGrid({
  actions = dashboardQuickActions,
  columns = 4,
}: QuickActionsGridProps) {
  const colClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid grid-cols-2 ${colClass} gap-2.5 sm:gap-3`}>
      {actions.map((action) => (
        <QuickActionCard key={action.label} {...action} />
      ))}
    </div>
  );
}
