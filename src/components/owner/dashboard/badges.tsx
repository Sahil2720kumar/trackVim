export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Verified: "bg-green-100 text-green-700",
    Paid: "bg-green-100 text-green-700",
    PendingVerification: "bg-amber-100 text-amber-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-red-100 text-red-700",
    Failed: "bg-red-100 text-red-700",
    Active: "bg-green-100 text-green-700",
    Busy: "bg-amber-100 text-amber-700",
    Offline: "bg-muted text-muted-foreground",
    "On Leave": "bg-muted text-muted-foreground",
  };
  const LABELS: Record<string, string> = {
    PendingVerification: "Pending Verification",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-muted text-muted-foreground`}
    >
      {plan}
    </span>
  );
}
