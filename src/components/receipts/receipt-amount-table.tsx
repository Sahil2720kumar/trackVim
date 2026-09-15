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
  const planPrice = membership?.planPrice ?? payment.amount + (payment.discount ?? 0);
  const discount = membership?.discount ?? payment.discount ?? 0;
  const total = payment.amount;

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
                {formatRupee(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount Paid Callout */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total Paid
        </span>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground mr-2">
            Amount Paid
          </span>
          <span className="text-xl sm:text-2xl font-black text-primary font-mono">
            {formatRupee(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
