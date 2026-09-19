import type { MembershipPaymentReceiptData } from "./types";

function formatRupee(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ReceiptAmountTable({
  membership,
  payment,
}: {
  membership: MembershipPaymentReceiptData["membership"];
  payment: MembershipPaymentReceiptData["payment"];
}) {
  const description = membership?.planName ?? "Gym Membership Fee";
  const joiningFee = membership?.joiningFee ?? 0;
  const discount = membership?.discount ?? payment.discount ?? 0;
  const planPrice =
    membership?.planPrice ?? payment.amount + discount - joiningFee;
  const total = payment.amount;

  const isVerified =
    payment.status === "Verified" || payment.customerFacingStatus === "PAID";
  const isPending =
    payment.status === "Pending" ||
    payment.status === "PendingVerification" ||
    payment.status === "PaymentPending" ||
    payment.status === "PaymentUploaded";
  const isRejected =
    payment.status === "Rejected" || payment.status === "PaymentRejected";

  let totalLabel = "Total Amount";
  let amountLabel = "Amount";

  if (isVerified) {
    totalLabel = "Total Paid";
    amountLabel = "Amount Paid";
  } else if (isPending) {
    totalLabel = "Total Pending";
    amountLabel = "Amount Pending";
  } else if (isRejected) {
    totalLabel = "Total Rejected";
    amountLabel = "Amount Rejected";
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground border-b border-border font-semibold">
              <th className="py-2.5 px-4">Description</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
              <th className="py-2.5 px-4 text-right">Discount</th>
              <th className="py-2.5 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="text-foreground">
              <td className="py-3 px-4 font-medium">{description}</td>
              <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                {formatRupee(planPrice)}
              </td>
              <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                {discount > 0 ? `-${formatRupee(discount)}` : "₹0.00"}
              </td>
              <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                {formatRupee(joiningFee > 0 ? planPrice - discount : total)}
              </td>
            </tr>
            {joiningFee > 0 && (
              <tr className="text-foreground">
                <td className="py-3 px-4 font-medium">One-time Joining Fee</td>
                <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                  {formatRupee(joiningFee)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  ₹0.00
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                  {formatRupee(joiningFee)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Amount Callout */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {totalLabel}
        </span>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground mr-2">
            {amountLabel}
          </span>
          <span className="text-xl sm:text-2xl font-black text-primary font-mono">
            {formatRupee(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
