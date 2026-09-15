import { formatDateStr } from "@/lib/utils";
import type { MembershipPaymentReceiptData } from "./types";

export function ReceiptMeta({
  receiptNumber,
  paymentDate,
  customerFacingStatus,
}: {
  receiptNumber: string;
  paymentDate: string | null;
  customerFacingStatus: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Receipt No.
        </p>
        <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
          {receiptNumber}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Payment Date
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">
          {paymentDate ? formatDateStr(paymentDate) : "—"}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Payment Status
        </p>
        <div className="mt-0.5 inline-flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
            ● {customerFacingStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
