import type { MembershipPaymentReceiptData } from "./types";

export function ReceiptPaymentDetails({
  payment,
}: {
  payment: MembershipPaymentReceiptData["payment"];
}) {
  const isVerified = payment.status === "Verified";
  const collectedByText =
    payment.collectedBy ?? (isVerified ? "System / Staff" : "—");
  const verifiedByText =
    payment.verifiedBy ?? (isVerified ? "Gym Management" : "Not Verified");

  return (
    <div className="space-y-2 pt-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Payment Details
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-xl bg-muted/20 border border-border/50 text-xs">
        <div>
          <p className="text-muted-foreground text-[11px]">Method</p>
          <p className="font-semibold text-foreground mt-0.5">
            {payment.method ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground text-[11px]">Transaction Ref</p>
          <p className="font-semibold text-foreground font-mono mt-0.5">
            {payment.transactionRef ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground text-[11px]">Collected By</p>
          <p className="font-semibold text-foreground mt-0.5">
            {collectedByText}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground text-[11px]">Verified By</p>
          <p className="font-semibold text-foreground mt-0.5">
            {verifiedByText}
          </p>
        </div>
      </div>
    </div>
  );
}

