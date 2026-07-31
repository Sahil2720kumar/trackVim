"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SPECIALIZATION_GROUPS } from "@/constants/profile-options";

export default function SpecializationPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPECIALIZATION_GROUPS;
    return SPECIALIZATION_GROUPS.map((group) => ({
      ...group,
      options: group.options.filter(
        (opt) =>
          opt.name.toLowerCase().includes(q) ||
          opt.blurb.toLowerCase().includes(q),
      ),
    })).filter((group) => group.options.length > 0);
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search specializations..."
            className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {selected.length} selected
        </Badge>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No specializations match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.category}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.options.map(({ name, icon: Icon, blurb }) => {
                  const isSelected = selected.includes(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => onToggle(name)}
                      aria-pressed={isSelected}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-md ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {blurb}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
