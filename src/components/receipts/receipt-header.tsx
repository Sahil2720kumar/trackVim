import Image from "next/image";
import type { MembershipPaymentReceiptData } from "./types";
import { getInitials } from "@/lib/utils";

export function ReceiptHeader({ gym }: { gym: MembershipPaymentReceiptData["gym"] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border">
      {/* Left: Gym info */}
      <div className="flex items-start gap-4">
        {gym.logoUrl ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/30">
            <Image
              src={gym.logoUrl}
              alt={gym.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            {getInitials(gym.name)}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            {gym.name}
          </h2>
          {gym.address && (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {gym.address}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground pt-0.5">
            {gym.phone && <span>Ph: {gym.phone}</span>}
            {gym.phone && gym.email && <span>•</span>}
            {gym.email && <span>Email: {gym.email}</span>}
          </div>
        </div>
      </div>

      {/* Right: Title */}
      <div className="sm:text-right shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-wider text-primary">
          Payment Receipt
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Official Membership Document
        </p>
      </div>
    </div>
  );
}
