import { formatDateStr } from "@/lib/utils";
import type { MembershipPaymentReceiptData } from "./types";

export function ReceiptMembership({
  membership,
}: {
  membership: MembershipPaymentReceiptData["membership"];
}) {
  if (!membership) return null;

  const dateRangeStr =
    membership.startDate && membership.endDate
      ? `${formatDateStr(membership.startDate)} – ${formatDateStr(membership.endDate)}`
      : membership.startDate
        ? `From ${formatDateStr(membership.startDate)}`
        : null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Membership
      </p>
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">
          {membership.planName}
        </p>
        {dateRangeStr && (
          <p className="text-xs text-muted-foreground">
            Membership Period:{" "}
            <span className="font-semibold text-foreground">{dateRangeStr}</span>
          </p>
        )}
      </div>
    </div>
  );
}
