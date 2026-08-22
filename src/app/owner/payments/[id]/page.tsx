import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { formatDateStr, formatDateTime, getInitials } from "@/lib/utils";
import { getPaymentById } from "@/services/owner.query";

import { PaymentHeaderActions } from "@/components/owner/payments/PaymentHeaderActions";
import { PaymentActionsCard } from "@/components/owner/payments/PaymentActionsCard";

export const STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  PendingVerification: "Pending Verification",
  Rejected: "Rejected",
  Verified: "Verified",
  Refunded: "Refunded",
  Cancelled: "Cancelled",
  Partial: "Partial",
  Overdue: "Overdue",
};

export function statusBadgeClass(status: string) {
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

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paymentId = (await params).id;
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (!meta.gymId) notFound();

  const result = await getPaymentById(paymentId, meta.gymId);
  if (!result.success) notFound();

  const payment = result.data;
  const { member, gym, membership } = payment;
  const isOwner = meta.role === "owner";

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
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header — nav link is a plain server-rendered <Link>;
          print/download/share are the only bits that need the browser */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
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
        {/* Left Column — pure display, fully server-rendered */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Receipt Number
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {payment.receiptId ?? payment.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Date
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDateStr(payment.paymentDate || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    {payment.method ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Transaction Reference
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {payment.transactionRef ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Collected By
                  </p>
                  <p className="font-semibold text-foreground">
                    {payment.collectedByName ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Due Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {formatDateStr(payment.dueDate ?? "—")}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <Badge className={statusBadgeClass(payment.status)}>
                    {STATUS_LABELS[payment.status] ?? payment.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Amount
                  </p>
                  <p className="font-bold text-2xl text-primary flex items-center gap-1 justify-end">
                    <IndianRupee className="w-5 h-5" />
                    {payment.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {payment.status === "Rejected" && payment.rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-500/5 p-3 dark:border-red-900">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Avatar className="w-16 h-16 ring-2 ring-border">
                  <AvatarImage
                    src={member.photoUrl ?? undefined}
                    alt={member.fullName ?? ""}
                  />
                  <AvatarFallback>
                    {getInitials(member.fullName ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {member.fullName ?? "—"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    ID: {member.memberCode ?? member.id.slice(0, 8)}
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      member.memberType === "WalkIn"
                        ? "text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800"
                        : "text-sky-600 border-sky-200 dark:text-sky-400 dark:border-sky-800"
                    }
                  >
                    {member.memberType === "WalkIn"
                      ? "Walk-in Member"
                      : "App Member"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Phone
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {member.contactPhone ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {member.contactEmail ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="font-semibold text-foreground">
                    {formatDateStr(member.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {membership && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  Membership Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Membership Plan
                    </p>
                    <p className="font-bold text-foreground">
                      {membership.plan?.planName ?? "—"}
                    </p>
                  </div>
                  {membership.plan?.planCategory && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        Category
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        {membership.plan.planCategory}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Duration
                    </p>
                    <p className="font-semibold text-foreground">
                      {membership.plan?.membershipDuration ??
                        `${membership.durationMonths} months`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Joining Fee
                    </p>
                    <p className="font-semibold text-foreground flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {membership.joiningFee}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Start Date
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDateStr(membership.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Expiry Date
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDateStr(membership.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Discount
                    </p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{membership.discount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Final Amount
                    </p>
                    <p className="font-bold text-lg text-primary flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1" />
                      {membership.finalAmount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Only the buttons + dialog here are interactive */}
          <PaymentActionsCard
            paymentId={payment.id}
            gymId={meta.gymId}
            status={payment.status}
            amount={payment.amount}
            isOwner={isOwner}
          />

          {/* Static status readout — server-rendered; refreshes automatically
              after the action's revalidatePath fires, no client state needed */}
          <Card
            className={
              payment.status === "Verified"
                ? "border-emerald-200 bg-emerald-500/5 dark:border-emerald-900"
                : "border-border"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">
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
                  {formatDateStr(payment.paymentDate ?? "—")}
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
                  {payment.amount.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline — pure display, server-rendered */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Payment Timeline</CardTitle>
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
                      {formatDateTime(event.date ?? "—")}
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
    </div>
  );
}
