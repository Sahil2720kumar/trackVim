import type { ReactNode } from "react";

interface AuthBrandHeaderProps {
  subtitle?: string;
}

export function AuthBrandHeader({
  subtitle = "Gym Management Made Simpler",
}: AuthBrandHeaderProps) {
  if (!subtitle) return null;

  return (
    <div className="text-center mb-6">
      <p className="text-sm text-muted-foreground font-medium tracking-wide">
        {subtitle}
      </p>
    </div>
  );
}
