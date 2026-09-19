"use client";

import React, { useState } from "react";
import { List, ChevronDown } from "lucide-react";

export interface TocItem {
  id: string;
  number: string;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav aria-label="Table of contents">
      {/* Mobile Collapsible TOC */}
      <div className="lg:hidden mb-8 rounded-2xl border border-border/70 bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-foreground hover:bg-muted/40 transition-colors"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            Table of Contents ({items.length} Sections)
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-border/40 space-y-1 text-xs">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileOpen(false)}
                className="block py-1.5 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors truncate"
              >
                <span className="font-semibold text-primary mr-2">{item.number}.</span>
                {item.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar TOC */}
      <div className="hidden lg:block sticky top-24 space-y-3 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 px-2 pb-1 border-b border-border/40">
          <List className="h-3.5 w-3.5 text-primary" />
          On this page
        </h3>

        <ul className="space-y-1 text-xs font-medium">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="shrink-0 text-[11px] font-semibold opacity-70">
                    {item.number}.
                  </span>
                  <span className="truncate">{item.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
