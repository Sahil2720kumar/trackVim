import { Activity } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5" aria-label="TrackVim">
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
        <Activity className="size-5" strokeWidth={2.2} />
      </div>
      <span className="text-xl font-bold tracking-tight">TrackVim</span>
    </div>
  );
}
