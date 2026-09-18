import React, { ReactNode } from "react";
import { TableOfContents, TocItem } from "./table-of-contents";
import { Shield, Clock } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  introduction: string;
  tocItems: TocItem[];
  children: ReactNode;
}

export function LegalLayout({
  title,
  lastUpdated,
  introduction,
  tocItems,
  children,
}: LegalLayoutProps) {
  return (
    <>

      {/* Hero Document Header */}
      <section className="relative overflow-hidden pt-10 pb-8 bg-muted/20 border-b border-border/50">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-6xl bg-primary/10 blur-[100px] opacity-50 -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            <span>Legal Notice</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium pt-1">
            <Clock className="h-4 w-4 text-primary" />
            <span>Last updated: {lastUpdated}</span>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed pt-2">
            {introduction}
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Table of Contents */}
          <div className="lg:col-span-4">
            <TableOfContents items={tocItems} />
          </div>

          {/* Right Column: Policy Document Content */}
          <article className="lg:col-span-8 max-w-3xl space-y-6">
            {children}
          </article>
        </div>
      </main>
    </>
  );
}
