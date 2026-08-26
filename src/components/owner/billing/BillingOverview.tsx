"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheckBig,
  CreditCard,
  FileText,
  Info,
  Loader2,
  LockKeyhole,
  Receipt,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/Confirmdialog";

import { useOwnerStore } from "@/stores/owner.store";
import {
  useBillingOverview,
  useGymInvoices,
  useSubscriptionPlans,
} from "@/hooks/queries/billing.query";
import {
  cancelGymBillingAction,
  changeGymSubscriptionPlanAction,
  createSubscriptionPaymentOrderAction,
  reactivateGymSubscriptionAction,
} from "@/actions/billing.action";

type BillingState =
  | "trial"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "reactivated";

type GymBillingStatus =
  | "Trial"
  | "Pending"
  | "Active"
  | "Suspended"
  | "Cancelled";

function deriveBillingState(
  billingStatus: GymBillingStatus,
  lastInvoiceStatus: string | null | undefined,
): BillingState {
  switch (billingStatus) {
    case "Trial":
      return "trial";
    case "Active":
      return "paid";
    case "Suspended":
      return "overdue";
    case "Cancelled":
      return "cancelled";
    case "Pending":
      return lastInvoiceStatus === "Cancelled" ? "reactivated" : "pending";
    default:
      return "pending";
  }
}

function getNextBillingDate(data: {
  current_invoice?: { due_date: string } | null;
  last_invoice?: { billing_period_end: string } | null;
  gym: { billing_start_date: string | null };
}): string | null {
  // Unpaid invoice already exists — its due date IS the next billing date
  if (data.current_invoice?.due_date) return data.current_invoice.due_date;

  // Otherwise derive from when the last paid period ends
  if (data.last_invoice?.billing_period_end) {
    const next = new Date(data.last_invoice.billing_period_end);
    next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  // No invoices yet (still in trial) — fall back to billing start
  return data.gym.billing_start_date;
}

const stateCopy: Record<
  BillingState,
  { badge: string; title: string; description: string }
> = {
  trial: {
    badge: "Trial Active",
    title: "Your free trial is active",
    description: "You will not be charged until your trial ends.",
  },
  pending: {
    badge: "Payment Due",
    title: "Your latest invoice is pending",
    description: "Pay the invoice to keep your TrackVim subscription active.",
  },
  paid: {
    badge: "Subscription Active",
    title: "Your subscription is active",
    description: "Your latest invoice has been paid successfully.",
  },
  overdue: {
    badge: "Subscription Suspended",
    title: "Your subscription is suspended",
    description:
      "Your TrackVim subscription is inactive because a billing invoice is overdue.",
  },
  cancelled: {
    badge: "Subscription Inactive",
    title: "Your subscription is inactive",
    description:
      "No charges are generated while your subscription is inactive.",
  },
  reactivated: {
    badge: "Reactivation Pending",
    title: "Subscription reactivated",
    description:
      "Your first invoice is prorated because you reactivated mid-period.",
  },
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Overdue"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "Pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : status === "Trial"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "Cancelled"
              ? "border-slate-200 bg-slate-50 text-slate-600"
              : "border-primary/20 bg-primary/5 text-primary";
  return (
    <Badge variant="outline" className={tone}>
      {status}
    </Badge>
  );
}

function statusPanelClass(state: BillingState) {
  if (state === "trial" || state === "paid")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (state === "pending" || state === "reactivated")
    return "border-amber-200 bg-amber-50 text-amber-900";
  if (state === "overdue") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-800";
}

function statusIconClass(state: BillingState) {
  if (state === "trial" || state === "paid")
    return "bg-emerald-100 text-emerald-700";
  if (state === "pending" || state === "reactivated")
    return "bg-amber-100 text-amber-700";
  if (state === "overdue") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function statusDescriptionClass(state: BillingState) {
  if (state === "trial" || state === "paid") return "text-emerald-700";
  if (state === "pending" || state === "reactivated") return "text-amber-800";
  if (state === "overdue") return "text-red-800";
  return "text-slate-600";
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "₹0";
  const n = typeof value === "string" ? Number(value) : value;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ---------------------------------------------------------------------------
// Days-remaining logic
// ---------------------------------------------------------------------------

function getDaysDiff(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getDaysUntilNextMonthStart(): number {
  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round(
    (nextMonthStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

type DaysInfo = {
  value: number;
  label: string;
  tone: "neutral" | "warning" | "danger" | "success";
};

function getBillingDaysInfo(
  state: BillingState,
  data: {
    current_invoice?: { due_date: string } | null;
    gym: { billing_start_date: string | null };
  },
): DaysInfo | null {
  if (state === "trial") {
    const diff = getDaysDiff(data.gym.billing_start_date);
    if (diff === null) return null;
    if (diff <= 0)
      return { value: 0, label: "Trial ends today", tone: "warning" };
    return {
      value: diff,
      label: diff === 1 ? "day left in trial" : "days left in trial",
      tone: "neutral",
    };
  }

  if (state === "pending" || state === "reactivated") {
    const diff = getDaysDiff(data.current_invoice?.due_date);
    if (diff === null) return null;
    if (diff > 0)
      return {
        value: diff,
        label: diff === 1 ? "day until due" : "days until due",
        tone: "warning",
      };
    if (diff === 0) return { value: 0, label: "Due today", tone: "warning" };
    return {
      value: Math.abs(diff),
      label: Math.abs(diff) === 1 ? "day overdue" : "days overdue",
      tone: "danger",
    };
  }

  if (state === "overdue") {
    const diff = getDaysDiff(data.current_invoice?.due_date);
    if (diff === null) return null;
    const overdueBy = Math.abs(Math.min(diff, 0));
    return {
      value: overdueBy,
      label: overdueBy === 1 ? "day overdue" : "days overdue",
      tone: "danger",
    };
  }

  if (state === "paid") {
    const nextBillingDate = getNextBillingDate(data);
    const diff = nextBillingDate ? getDaysDiff(nextBillingDate) : null;
    if (diff === null) return null;
    const days = Math.max(diff, 0);
    return {
      value: days,
      label: days === 1 ? "day to next invoice" : "days to next invoice",
      tone: "success",
    };
  }

  return null;
}

function daysToneClass(tone: DaysInfo["tone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "danger":
      return "bg-red-100 text-red-700";
    default:
      return "bg-primary/10 text-primary";
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function BillingOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-[140px] w-full rounded-3xl" />

      <section className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-3xl" />
        <Skeleton className="h-[320px] rounded-3xl" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </section>

      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

function BillingOverviewError({
  message,
  onRetry,
  retrying,
}: {
  message: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col items-center text-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Couldn't load billing information{message ? `: ${message}` : "."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BillingOverview() {
  const router = useRouter();
  const activeGymId = useOwnerStore((state) => state.activeGymId);

  const overviewQuery = useBillingOverview();
  const invoicesQuery = useGymInvoices();
  const plansQuery = useSubscriptionPlans();

  const [showPlans, setShowPlans] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "pay" | "reactivate" | "cancel" | "plan" | null
  >(null);

  const data = overviewQuery.data;

  const state: BillingState = useMemo(() => {
    if (!data) return "trial";
    return deriveBillingState(
      data.gym.billing_status as any,
      data.last_invoice?.status,
    );
  }, [data]);

  const daysInfo = useMemo(() => {
    if (!data) return null;
    return getBillingDaysInfo(state, data);
  }, [state, data]);

  const current = stateCopy[state];

  const primaryAction =
    state === "trial"
      ? "Change Plan"
      : state === "cancelled"
        ? "Reactivate Subscription"
        : state === "paid"
          ? "View Invoices"
          : "Pay Now";

  function refreshBillingData() {
    overviewQuery.refetch();
    invoicesQuery.refetch();
    router.refresh();
  }

  function handleChangePlan(planId: string) {
    if (!activeGymId || isPending) return;

    setPendingAction("plan");
    startTransition(async () => {
      try {
        const result = await changeGymSubscriptionPlanAction({
          gymId: activeGymId,
          planId,
        });

        if (!result.success) {
          toast.error(result.error ?? "Failed to change plan.");
          return;
        }

        setShowPlans(false);
        toast.success("Plan updated.");
        refreshBillingData();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleReactivate() {
    if (!activeGymId || isPending) return;

    setPendingAction("reactivate");
    startTransition(async () => {
      try {
        const result = await reactivateGymSubscriptionAction(activeGymId);

        if (!result.success) {
          toast.error(result.error ?? "Failed to reactivate subscription.");
          return;
        }

        toast.success("Subscription reactivated.");
        refreshBillingData();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function confirmCancel() {
    if (isPending) return;

    setPendingAction("cancel");
    startTransition(async () => {
      try {
        const result = await cancelGymBillingAction();

        if (!result.success) {
          toast.error(result.error ?? "Failed to cancel subscription.");
          return;
        }

        setCancelTarget(false);
        toast.success("Subscription cancelled.");
        refreshBillingData();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handlePay() {
    const invoiceId = data?.current_invoice?.id;
    if (!invoiceId) {
      toast.error(
        "No payable invoice found. Please refresh or contact support.",
      );
      return;
    }
    if (isPending) return;

    setPendingAction("pay");
    startTransition(async () => {
      try {
        const result = await createSubscriptionPaymentOrderAction({
          gymSubscriptionId: invoiceId,
        });

        if (!result?.success) {
          toast.error((result as any)?.error ?? "Failed to start payment.");
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Could not load payment gateway. Check your connection.");
          return;
        }

        const paymentData = result.order;

        const razorpay = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: paymentData.amount,
          currency: paymentData.currency ?? "INR",
          order_id: paymentData.id,
          name: "TrackVim",
          description: "Subscription payment",
          handler: () => {
            toast.success("Payment submitted — updating your billing status.");

            let attempts = 0;

            const poll = setInterval(() => {
              attempts += 1;
              refreshBillingData();

              if (attempts >= 5) {
                clearInterval(poll);
              }
            }, 2000);
          },
        });

        razorpay.open();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handlePrimary() {
    if (state === "trial") {
      setShowPlans(true);
      return;
    }
    if (state === "cancelled") {
      handleReactivate();
      return;
    }
    if (state === "paid") {
      document
        .getElementById("invoices")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    handlePay();
  }

  if (overviewQuery.isLoading) {
    return <BillingOverviewSkeleton />;
  }

  if (overviewQuery.isError || !data) {
    return (
      <BillingOverviewError
        message={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
        onRetry={() => overviewQuery.refetch()}
        retrying={overviewQuery.isFetching}
      />
    );
  }

  const { gym, plan, active_member_count, current_invoice, last_invoice } =
    data;

  return (
    <>
      <div
        className={`flex flex-col gap-6 ${overviewQuery.isFetching ? "opacity-70" : ""}`}
      >
        {/* ---------------- Trial banner ---------------- */}
        {state === "trial" && (
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-transparent shadow-sm">
            <CardContent className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-stretch">
              <div className="flex flex-1 items-center gap-4 sm:gap-5">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <CalendarDays className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Free trial
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {daysInfo ? daysInfo.value : "—"}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {daysInfo?.label ?? "days left in trial"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Billing begins on {formatDate(gym.billing_start_date)}
                  </p>
                </div>
              </div>

              <div className="hidden w-px self-stretch bg-border lg:block" />
              <div className="h-px w-full bg-border lg:hidden" />

              <div className="flex flex-1 flex-col justify-center gap-3">
                <p className="text-sm font-semibold text-foreground">
                  What happens next?
                </p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-600" />
                    No charges during your trial
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-600" />
                    Billing starts after the trial ends
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- Non-trial status banner ---------------- */}
        {state !== "trial" && (
          <Card
            className={`border ${
              state === "overdue"
                ? "border-red-200 bg-red-50/50"
                : state === "cancelled"
                  ? "border-muted bg-muted/30"
                  : "border-amber-200 bg-amber-50/50"
            }`}
          >
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background">
                  <Info className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{current.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {current.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                {daysInfo && (
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl px-4 py-2 text-center leading-none ${daysToneClass(daysInfo.tone)}`}
                  >
                    <span className="text-xl font-bold">{daysInfo.value}</span>
                    <span className="mt-1 text-[11px] font-medium">
                      {daysInfo.label}
                    </span>
                  </div>
                )}
                <Button
                  onClick={handlePrimary}
                  variant={state === "overdue" ? "destructive" : "default"}
                  className="w-full sm:w-auto"
                  disabled={isPending}
                >
                  {isPending && pendingAction === "pay"
                    ? "Starting payment…"
                    : isPending && pendingAction === "reactivate"
                      ? "Reactivating…"
                      : primaryAction}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription className="mt-1">
                    Your TrackVim plan and current usage
                  </CardDescription>
                </div>
                <StatusBadge status={current.badge} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Plan
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {plan?.name ?? "No active plan"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan
                        ? `${plan.billing_model === "Flat" ? "Flat Rate" : "Per Member"} · ${
                            plan.max_members
                              ? `Up to ${plan.max_members} members`
                              : "Unlimited members"
                          }`
                        : "—"}
                    </p>
                  </div>
                  <Sparkles className="text-primary" />
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Members
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {active_member_count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    active members
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {state === "trial" ? "Monthly Price" : "Amount Due"}
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(current_invoice?.total_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {state === "trial" ? "flat rate" : "current invoice"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next Billing Date
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatDate(getNextBillingDate(data))}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-3 rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="size-5 shrink-0 text-primary" />
                <span>
                  {state === "trial"
                    ? `You won't be charged until your trial ends. Cancel anytime before ${formatDate(gym.billing_start_date)}.`
                    : "Your billing status is reflected in the invoice history below."}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription className="mt-1">
                A clear view of your account state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${statusPanelClass(state)}`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${statusIconClass(state)}`}
                >
                  {state === "overdue" ? (
                    <Info />
                  ) : state === "cancelled" ? (
                    <X />
                  ) : (
                    <CircleCheckBig />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{current.badge}</p>
                  <p
                    className={`mt-1 text-sm ${statusDescriptionClass(state)}`}
                  >
                    {current.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <InfoRow
                  icon={CalendarDays}
                  label="Billing Start Date"
                  value={formatDate(gym.billing_start_date)}
                />
                <InfoRow
                  icon={RefreshCw}
                  label="Billing Frequency"
                  value="Monthly"
                />
                <InfoRow
                  icon={WalletCards}
                  label="Current Billing Status"
                  value={gym.billing_status}
                />
                {daysInfo && (
                  <InfoRow
                    icon={CalendarDays}
                    label="Days Remaining"
                    value={`${daysInfo.value} ${daysInfo.label}`}
                  />
                )}
                {last_invoice && (
                  <InfoRow
                    icon={Receipt}
                    label="Last Invoice"
                    value={`${last_invoice.status} · ${formatCurrency(last_invoice.total_amount)}`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common subscription and billing tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [
                  Sparkles,
                  "Change Plan",
                  "Upgrade or downgrade",
                  () => setShowPlans(true),
                ],
                [
                  Settings2,
                  "Billing Settings",
                  "Manage billing preferences",
                  undefined,
                ],
                [
                  Receipt,
                  "View Invoices",
                  "View TrackVim invoices",
                  () =>
                    document
                      .getElementById("invoices")
                      ?.scrollIntoView({ behavior: "smooth" }),
                ],
                [
                  RefreshCw,
                  "Reactivate Subscription",
                  "Resume your subscription",
                  handleReactivate,
                ],
              ] as const
            )
              .filter(([, title]) => {
                if (
                  title === "Reactivate Subscription" &&
                  state !== "cancelled"
                )
                  return false;
                if (title === "Change Plan" && gym.billing_status !== "Pending")
                  return false;
                return true;
              })
              .map(([Icon, title, desc, onClick]) => (
                <button
                  key={title}
                  onClick={onClick}
                  disabled={isPending}
                  className="group flex items-center gap-3 rounded-2xl border border-border/70 p-4 text-left transition hover:border-primary/40 hover:bg-primary/[0.03] disabled:opacity-60"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {desc}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                </button>
              ))}
          </CardContent>
        </Card>

        <Card id="invoices">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription className="mt-1">
                Your TrackVim subscription billing history
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {invoicesQuery.isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : invoicesQuery.isError ? (
              <BillingOverviewError
                message={
                  invoicesQuery.error instanceof Error
                    ? invoicesQuery.error.message
                    : null
                }
                onRetry={() => invoicesQuery.refetch()}
                retrying={invoicesQuery.isFetching}
              />
            ) : !invoicesQuery.data || invoicesQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Invoice Date</th>
                      <th className="p-3 font-medium">Billing Period</th>
                      <th className="p-3 font-medium">Plan</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesQuery.data.map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="p-3">
                          {formatDate(invoice.invoice_date)}
                        </td>
                        <td className="p-3">
                          {formatDate(invoice.billing_period_start)} –{" "}
                          {formatDate(invoice.billing_period_end)}
                        </td>
                        <td className="p-3">
                          {invoice.subscription_plans?.name ?? "—"}
                        </td>
                        <td className="p-3 font-medium">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="p-3">{formatDate(invoice.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Payment preferences for your TrackVim subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <CreditCard className="text-primary" />
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  Handled via Razorpay at checkout
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <FileText className="text-primary" />
              <div>
                <p className="font-medium">Billing Information</p>
                <p className="text-sm text-muted-foreground">{gym.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <LockKeyhole className="text-primary" />
              <div>
                <p className="font-medium">Invoice Preferences</p>
                <p className="text-sm text-muted-foreground">
                  Email notifications on
                </p>
              </div>
            </div>
          </CardContent>
          {state !== "cancelled" && state !== "trial" && (
            <CardContent className="pt-0">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => setCancelTarget(true)}
              >
                Cancel Subscription
              </Button>
            </CardContent>
          )}
        </Card>

        {showPlans && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-title"
          >
            <Card className="w-full max-w-2xl shadow-2xl">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle id="plan-title">Change Plan</CardTitle>
                  <CardDescription className="mt-1">
                    Choose the TrackVim plan that fits your gym.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlans(false)}
                  aria-label="Close"
                >
                  <X />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {plansQuery.isLoading ? (
                  <>
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                  </>
                ) : plansQuery.isError ? (
                  <div className="col-span-full">
                    <BillingOverviewError
                      message={
                        plansQuery.error instanceof Error
                          ? plansQuery.error.message
                          : null
                      }
                      onRetry={() => plansQuery.refetch()}
                      retrying={plansQuery.isFetching}
                    />
                  </div>
                ) : (
                  plansQuery.data?.map((p) => (
                    <button
                      key={p.id}
                      disabled={isPending}
                      onClick={() => handleChangePlan(p.id)}
                      className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                        plan?.id === p.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {plan?.id === p.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                      <p className="mt-4 text-2xl font-bold">
                        {p.billing_model === "Flat"
                          ? formatCurrency(p.flat_price)
                          : formatCurrency(p.price_per_member)}
                        <span className="text-xs font-normal text-muted-foreground">
                          {p.billing_model === "Flat" ? "/month" : "/member/mo"}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.max_members
                          ? `Up to ${p.max_members} members`
                          : "Unlimited members"}
                      </p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelTarget}
        onOpenChange={(open) => !open && !isPending && setCancelTarget(false)}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your TrackVim subscription? Your pending invoice will be cancelled and no further charges will occur until you reactivate."
        confirmLabel={
          isPending && pendingAction === "cancel"
            ? "Cancelling..."
            : "Cancel Subscription"
        }
        icon={<XCircle data-icon="inline-start" />}
        variant="destructive"
      />
    </>
  );
}
