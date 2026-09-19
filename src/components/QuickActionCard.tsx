import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  desc: string;
  bg: string;
  color: string;
  route?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  icon: Icon,
  label,
  desc,
  bg,
  color,
  route,
  onClick,
}: QuickActionCardProps) {
  const cardClassName =
    "bg-card border border-border rounded-2xl p-3 sm:p-4 text-left hover:shadow-lg transition-all flex items-center gap-2.5 sm:gap-3 w-full cursor-pointer";

  const cardContent = (
    <>
      <div className={cn("p-2 sm:p-2.5 rounded-xl shrink-0", bg)}>
        <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
          {label}
        </p>
        <p className="hidden sm:block text-xs text-muted-foreground truncate">
          {desc}
        </p>
      </div>
    </>
  );

  if (route) {
    return (
      <Link href={route} onClick={onClick} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cardClassName}>
      {cardContent}
    </button>
  );
}
