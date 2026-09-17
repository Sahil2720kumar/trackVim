import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5" aria-label="TrackVim">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-1.5 shadow-sm">
        <TrackVimIcon size={22} className="size-full" />
      </div>
      <span className="text-xl font-bold tracking-tight">TrackVim</span>
    </div>
  );
}
