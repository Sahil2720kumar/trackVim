"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatDateStr, formatDateTime, getInitials } from "@/lib/utils";
import { PaymentHeaderActions } from "@/components/owner/payments/PaymentHeaderActions";
import { PaymentActionsCard } from "@/components/owner/payments/PaymentActionsCard";
import { usePaymentById } from "@/hooks/queries/owner.query";
import { MembershipPaymentReceipt } from "@/components/receipts";

const STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  PendingVerification: "Pending Verification",
  Rejected: "Rejected",
  Verified: "Verified",
  Refunded: "Refunded",
  Cancelled: "Cancelled",
  Partial: "Partial",
  Overdue: "Overdue",
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "Verified":
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "Pending":
    case "PendingVerification":
      return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "Rejected":
    case "Overdue":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function PaymentDetailsSkeleton() {
  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>

      <Skeleton className="h-72 w-full rounded-2xl" />
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function PaymentDetailsError({
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
        Couldn't load this payment{message ? `: ${message}` : "."}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          {retrying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {retrying ? "Retrying…" : "Try again"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/owner/payments" className="flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Payments
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main content ───────────────────────────────────────────────────────────

export function PaymentDetailsContent({
  paymentId,
  gymId,
  isOwner,
}: {
  paymentId: string;
  gymId: string;
  isOwner: boolean;
}) {
  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePaymentById(paymentId);

  if (isLoading) {
    return <PaymentDetailsSkeleton />;
  }

  if (isError || !result) {
    return (
      <PaymentDetailsError
        message={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const payment = result;
  const { member, gym, membership } = payment;

  const timeline = [
    {
      key: "created",
      label: "Payment Created",
      date: payment.createdAt,
      user: payment.collectedByName,
      icon: FileText,
    },
    ...(payment.status !== "Pending"
      ? [
          {
            key: "recorded",
            label: "Payment Recorded",
            date: payment.paymentDate,
            user: payment.collectedByName,
            icon: CreditCard,
          },
        ]
      : []),
    ...(payment.verifiedAt
      ? [
          {
            key: "verified",
            label: "Payment Verified",
            date: payment.verifiedAt,
            user: payment.verifiedByName,
            icon: CheckCircle,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Payment Details
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View payment details, receipt, and transaction history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="default" asChild className="flex-1">
            <Link href="/owner/payments" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
          <PaymentHeaderActions
            payment={payment}
            gym={gym}
            member={member}
            membership={membership}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Official Payment Receipt */}
        <div className="lg:col-span-2 space-y-6">
          <MembershipPaymentReceipt payment={payment} />

          {payment.status === "Rejected" && payment.rejectionReason && (
            <Card className="border-red-200 bg-red-500/5 dark:border-red-900">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Rejection Reason
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {payment.rejectionReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <PaymentActionsCard
            paymentId={payment.id}
            gymId={gymId}
            status={payment.status}
            amount={payment.amount}
            isOwner={isOwner}
          />

          <Card
            className={
              payment.status === "Verified"
                ? "border-emerald-200 bg-emerald-500/5 dark:border-emerald-900"
                : "border-border"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">
                Payment Status
              </CardTitle>
              <Badge
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${statusBadgeClass(payment.status)}`}
              >
                {payment.status === "Verified" && (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                {payment.status === "PendingVerification" && (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {STATUS_LABELS[payment.status] ?? payment.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Date
                </span>
                <span className="font-medium">
                  {payment.paymentDate
                    ? formatDateStr(payment.paymentDate)
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Method
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {payment.method ?? "—"}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <div className="flex items-center font-semibold text-primary">
                  <IndianRupee className="mr-0.5 h-4 w-4" />
                  {payment.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeline.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-foreground">
                      {event.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.date ? formatDateTime(event.date) : "—"}
                    </p>
                    {event.user && (
                      <p className="text-xs text-muted-foreground">
                        by {event.user}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
