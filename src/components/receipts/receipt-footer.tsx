import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

export function ReceiptFooter({ gymName }: { gymName: string }) {
  return (
    <div className="pt-6 border-t border-border text-center space-y-2">
      <p className="text-xs font-semibold text-foreground">
        Thank you for choosing {gymName}!
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md mx-auto">
        This receipt is computer generated and does not require a physical signature.
      </p>
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <span>Powered by</span>
        <TrackVimIcon size={14} className="w-3.5 h-3.5" />
        <span className="font-bold text-primary tracking-normal">TrackVim</span>
      </div>
    </div>
  );
}
