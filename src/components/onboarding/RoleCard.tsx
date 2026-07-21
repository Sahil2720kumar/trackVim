"use client";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/roles";
import { ChevronRight } from "lucide-react";

interface RoleCardProps {
  value: Role;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (value: Role) => void;
}

export function RoleCard({
  value,
  label,
  description,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-3xl border bg-card p-5 text-left transition-colors",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-primary/40",
      )}
    >
      <div>
        <p
          className="font-bold text-foreground"
          style={{ fontFamily: "Archivo-Bold" }}
        >
          {label}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight
        className={cn(
          "h-5 w-5 shrink-0",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
