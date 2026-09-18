import React, { ReactNode } from "react";

interface LegalSectionProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({
  id,
  number,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 pt-8 pb-8 border-b border-border/40 last:border-b-0 space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary font-mono mt-0.5">
          {number}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          {title}
        </h2>
      </div>

      <div className="text-base text-muted-foreground leading-7 space-y-4 font-sans">
        {children}
      </div>
    </section>
  );
}
