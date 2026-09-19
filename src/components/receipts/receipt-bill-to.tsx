import type { MembershipPaymentReceiptData } from "./types";

export function ReceiptBillTo({
  member,
}: {
  member: MembershipPaymentReceiptData["member"];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Bill To
      </p>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">
          {member.name}
        </h3>
        {member.memberId && (
          <p className="text-xs font-medium text-muted-foreground">
            Member ID: <span className="font-semibold text-foreground">{member.memberId}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {member.phone && <span>Phone: {member.phone}</span>}
          {member.phone && member.email && <span>|</span>}
          {member.email && <span>Email: {member.email}</span>}
        </div>
      </div>
    </div>
  );
}
