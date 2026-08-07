"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Wallet,
  Receipt,
  BadgeCheck,
  ShieldCheck,
  Activity,
  FileImage,
  CreditCard,
  Hash,
  Info,
  Cake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/Confirmdialog";
import { PromptDialog } from "@/components/Promptdialog";

import {
  STATUS_CONFIG,
  DETAIL_TIMELINE_STEPS,
  getDetailTimelineState,
  getDisplayStatus,
  formatDate,
  formatDateTime,
  formatPrice,
  getInitials,
} from "@/lib/application-status";
import { ApplicationDetail, DisplayStatus } from "@/types";
import { toast } from "sonner";
import {
  approveMembershipApplicationAction,
  rejectMembershipApplicationAction,
  rejectPaymentAction,
  verifyPaymentAction,
} from "@/actions/owner.action";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string | null): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} years`;
}

function fullAddress(m: ApplicationDetail["members"]): string {
  if (!m) return "—";
  return [m.address, m.city, m.state].filter(Boolean).join(", ") || "—";
}

// `?? "—"` only catches null/undefined — empty strings ("") slip through
// and render as blank rows. This catches both.
function orFallback(
  value: string | null | undefined,
  fallback: string,
): string {
  return value && value.trim() !== "" ? value : fallback;
}

function getPlanIcon(name?: string | null): React.ElementType {
  if (!name) return CreditCard;
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[
    name
  ];
  return Icon ?? CreditCard;
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  const cfg = STATUS_CONFIG[displayStatus];
  const member = data.members;
  const plan = data.membership_plans;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 sm:size-20 ring-4 ring-background shadow-sm">
            <AvatarImage
              src={member?.photo_url ?? undefined}
              alt={member?.full_name ?? ""}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-bold">
              {getInitials(member?.full_name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                {member?.full_name ?? "Unknown"}
              </h1>
              <Badge className="bg-secondary text-primary border-0 text-[11px] font-bold px-2 py-0.5">
                {member?.member_code ?? "—"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Applied for{" "}
              <span className="font-medium text-foreground">
                {plan?.plan_name ?? "—"}
              </span>{" "}
              &middot; {formatDate(data.created_at)}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "self-start sm:self-auto border px-3 py-1.5 text-sm font-semibold whitespace-nowrap shadow-sm",
            cfg.badgeClass,
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full mr-2 inline-block",
              cfg.dotClass,
            )}
          />
          {cfg.label}
        </Badge>
      </div>
    </div>
  );
}

// ─── 1. Applicant Details ──────────────────────────────────────────────────────

function ApplicantDetailsSection({ data }: { data: ApplicationDetail }) {
  const member = data.members;

  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center shrink-0">
            <User className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-primary/60 tabular-nums">
              01
            </span>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Applicant Details
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Full Name
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" />
              {orFallback(member?.full_name, "—")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Gender
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(member?.gender, "—")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Age
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Cake className="size-3.5 text-muted-foreground" />
              {calcAge(member?.date_of_birth ?? null)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Email
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              {member?.contact_email ? (
                <>
                  <Mail className="size-3.5 text-muted-foreground" />
                  {member.contact_email}
                </>
              ) : (
                "—"
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Phone
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              {member?.contact_phone ? (
                <>
                  <Phone className="size-3.5 text-muted-foreground" />
                  {member.contact_phone}
                </>
              ) : (
                "—"
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Applied On
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-muted-foreground" />
              {formatDateTime(data.created_at)}
            </p>
          </div>

          <div className="flex flex-col gap-1 sm:col-span-3">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Address
            </p>
            <p className="text-sm font-medium text-foreground flex items-start gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
              {fullAddress(member)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 2. Requested Membership ───────────────────────────────────────────────────

function RequestedMembershipSection({ data }: { data: ApplicationDetail }) {
  const plan = data.membership_plans;
  const PlanIcon = getPlanIcon(plan?.plan_icon);
  const total = Number(plan?.plan_price ?? 0);
  const monthly = plan?.duration_months ? total / plan.duration_months : total;
  const features = [
    ...((plan?.selected_features as string[] | null) ?? []),
    ...((plan?.custom_features as string[] | null) ?? []),
  ];

  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-primary/60 tabular-nums">
              02
            </span>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Requested Membership
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 col-span-2">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Plan Name
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <span
                className="size-6 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${plan?.plan_color ?? "#94a3b8"}20`,
                }}
              >
                <PlanIcon
                  className="size-3.5"
                  style={{ color: plan?.plan_color ?? "#94a3b8" }}
                />
              </span>
              {plan?.plan_name ?? "—"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Price
            </p>
            {plan ? (
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">
                  {formatPrice(plan.duration_months > 1 ? monthly : total)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mo
                  </span>
                </span>
                {plan.duration_months > 1 && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatPrice(total)} total
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-foreground">—</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Duration
            </p>
            <p className="text-sm font-medium text-foreground">
              {plan ? `${plan.duration_months} months` : "—"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Validity Starts
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(plan?.validity_starts, "—")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Joining Fee
            </p>
            <p className="text-sm font-medium text-foreground">
              {plan ? formatPrice(Number(plan.joining_fee ?? 0)) : "—"}
            </p>
          </div>
        </div>

        {features.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
              Features Included
            </p>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  <CheckCircle2 className="size-3 text-primary" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 3. Fitness Profile ────────────────────────────────────────────────────────

function FitnessProfileSection({ data }: { data: ApplicationDetail }) {
  const member = data.members;

  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center shrink-0">
            <Activity className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-primary/60 tabular-nums">
              03
            </span>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Fitness Profile
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Height
            </p>
            <p className="text-sm font-medium text-foreground">
              {member?.height_cm ? `${member.height_cm} cm` : "—"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Weight
            </p>
            <p className="text-sm font-medium text-foreground">
              {member?.weight_kg ? `${member.weight_kg} kg` : "—"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Fitness Goal
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(member?.fitness_goal, "—")}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Medical Conditions
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(member?.medical_conditions, "None")}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Allergies
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(member?.allergies, "None")}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="size-5 rounded bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
              <LucideIcons.AlertCircle className="size-3 text-orange-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Emergency Contact
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Name
              </p>
              <p className="text-sm font-medium text-foreground">
                {orFallback(member?.emergency_contact_name, "—")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Relationship
              </p>
              <p className="text-sm font-medium text-foreground">
                {orFallback(member?.emergency_contact_relationship, "—")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Phone
              </p>
              <p className="text-sm font-medium text-foreground">
                {orFallback(member?.emergency_contact_phone, "—")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 4. Application Note & Timeline ────────────────────────────────────────────

function MembershipTimeline({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  const { completed, active, rejected } = getDetailTimelineState(displayStatus);
  const membership = data.gym_memberships?.[0];
  const currentPayment = membership?.payments?.find((p) =>
    p.payment_receipts?.some((r) => r.is_current),
  );
  const currentReceipt = currentPayment?.payment_receipts?.find(
    (r) => r.is_current,
  );

  const stepDate = (key: string): string | undefined => {
    const map: Record<string, string | undefined> = {
      submitted: data.created_at,
      review: data.reviewed_at ?? undefined,
      paymentPending: data.reviewed_at ?? undefined,
      paymentUploaded: currentReceipt?.uploaded_at ?? undefined,
      paymentVerified: currentPayment?.verified_at ?? undefined,
      active: membership?.activated_at ?? undefined,
    };
    return map[key];
  };

  return (
    <div className="w-full pb-2">
      <div className="flex items-start w-full">
        {DETAIL_TIMELINE_STEPS.map((step, idx) => {
          const isDone = completed.includes(step.key);
          const isActive = active === step.key;
          const isRejected = rejected.includes(step.key);
          const isLast = idx === DETAIL_TIMELINE_STEPS.length - 1;
          const date = stepDate(step.key);
          // Segment after this step is filled only if this step completed
          // cleanly (not the rejection point) — same logic as ApplicationCard.
          const segmentFilled = isDone && !isRejected;

          return (
            <div
              key={step.key}
              className="flex items-start flex-1 last:flex-none min-w-0"
            >
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    "size-8 rounded-full border-2 flex items-center justify-center bg-background z-10",
                    isDone
                      ? "bg-primary border-primary"
                      : isRejected
                        ? "bg-destructive border-destructive"
                        : isActive
                          ? "bg-orange-400 border-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.15)]"
                          : "bg-muted border-border",
                  )}
                >
                  {isDone && (
                    <CheckCircle2 className="size-4 text-primary-foreground" />
                  )}
                  {isRejected && <XCircle className="size-4 text-white" />}
                  {isActive && <Clock3 className="size-4 text-white" />}
                  {!isDone && !isRejected && !isActive && (
                    <div className="size-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-[10px] font-medium mt-2 text-center leading-tight px-1 w-16",
                    isDone
                      ? "text-primary"
                      : isRejected
                        ? "text-destructive"
                        : isActive
                          ? "text-orange-500"
                          : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {date ? (
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5 text-center">
                    {new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                    <br />
                    {new Date(date).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : (
                  <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                    --
                  </p>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mt-4 mx-1 rounded-full",
                    segmentFilled ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationNoteSection({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center shrink-0">
            <FileImage className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-primary/60 tabular-nums">
              04
            </span>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Application Note
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.message ? (
          <div className="p-4 bg-muted/60 rounded-2xl text-sm text-muted-foreground italic leading-relaxed border border-border/60">
            &ldquo;{data.message}&rdquo;
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No note provided.</p>
        )}
        <MembershipTimeline data={data} displayStatus={displayStatus} />
      </CardContent>
    </Card>
  );
}

// ─── 5. Payment Information ────────────────────────────────────────────────────

function PaymentSection({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  const plan = data.membership_plans;
  const membership = data.gym_memberships?.[0];
  const currentPayment = membership?.payments?.find((p) =>
    p.payment_receipts?.some((r) => r.is_current),
  );
  const currentReceipt = currentPayment?.payment_receipts?.find(
    (r) => r.is_current,
  );

  if (displayStatus === "Pending") {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/60 rounded-2xl border border-border">
        <Info className="size-5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          Payment has not been requested yet. Approve the application to
          proceed.
        </p>
      </div>
    );
  }

  if (displayStatus === "Approved" || displayStatus === "PaymentPending") {
    const total = Number(plan?.plan_price ?? 0);
    const monthly = plan?.duration_months
      ? total / plan.duration_months
      : total;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-800">
          <Clock3 className="size-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
              Waiting for payment from member
            </p>
            <p className="text-xs text-orange-600/70 dark:text-orange-500/70 mt-0.5">
              Member needs to upload a payment receipt.
            </p>
          </div>
        </div>
        {plan && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Amount Due
              </p>
              <span className="text-base font-bold text-foreground">
                {formatPrice(total)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatPrice(monthly)}/mo &times; {plan.duration_months} mo
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Duration
              </p>
              <p className="text-sm font-medium text-foreground">
                {plan.duration_months} months
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (
    (displayStatus === "PaymentUploaded" ||
      displayStatus === "PaymentRejected") &&
    currentReceipt
  ) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium",
            displayStatus === "PaymentUploaded"
              ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-400"
              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400",
          )}
        >
          {displayStatus === "PaymentUploaded" ? (
            <>
              <Receipt className="size-4" /> Payment Uploaded — Waiting for
              verification
            </>
          ) : (
            <>
              <XCircle className="size-4" /> Payment Rejected — Waiting for new
              receipt
            </>
          )}
        </div>

        {displayStatus === "PaymentRejected" &&
          currentPayment?.rejection_reason && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                {currentPayment.rejection_reason}
              </p>
            </div>
          )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Amount
            </p>
            <span className="text-base font-bold text-foreground">
              {formatPrice(Number(currentPayment?.amount ?? 0))}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Payment Method
            </p>
            <p className="text-sm font-medium text-foreground">
              {orFallback(currentPayment?.method, "—")}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Transaction Ref
            </p>
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded w-fit">
              {orFallback(currentPayment?.transaction_ref, "—")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Uploaded On
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDateTime(currentReceipt.uploaded_at)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Receipt
          </p>
          <div className="relative rounded-2xl border border-border overflow-hidden bg-muted/30">
            {currentReceipt.file_type?.startsWith("image") ? (
              <img
                src={currentReceipt.file_url}
                alt="Payment receipt"
                className="w-full max-h-64 object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                PDF receipt uploaded
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-card/90 backdrop-blur-sm border-t border-border px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary h-8"
                onClick={() => window.open(currentReceipt.file_url, "_blank")}
              >
                <Eye className="size-3.5" />
                View Full Size
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground h-8"
                asChild
              >
                <a href={currentReceipt.file_url} download>
                  <Download className="size-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (displayStatus === "Active") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-800">
          <BadgeCheck className="size-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Payment Verified — Membership Active
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">
              Payment verified and membership is now active.
            </p>
          </div>
        </div>
        {currentPayment && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Amount Paid
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatPrice(Number(currentPayment.amount))}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Payment Method
              </p>
              <p className="text-sm font-medium text-foreground">
                {orFallback(currentPayment.method, "—")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Transaction Ref
              </p>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded w-fit">
                {orFallback(currentPayment.transaction_ref, "—")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                Verified At
              </p>
              <p className="text-sm font-medium text-foreground">
                {currentPayment.verified_at
                  ? formatDateTime(currentPayment.verified_at)
                  : "—"}
              </p>
            </div>
            {membership?.start_date && (
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  Membership Start
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(membership.start_date)}
                </p>
              </div>
            )}
            {membership?.end_date && (
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  Membership End
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(membership.end_date)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (displayStatus === "Rejected") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800">
        <XCircle className="size-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-600 dark:text-red-400">
          Application was rejected. No payment was requested.
        </p>
      </div>
    );
  }

  return null;
}

function PaymentInformationSection({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 flex items-center justify-center shrink-0">
            <Wallet className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-primary/60 tabular-nums">
              05
            </span>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Payment Information
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PaymentSection data={data} displayStatus={displayStatus} />
      </CardContent>
    </Card>
  );
}

// ─── Sidebar: Status Overview ──────────────────────────────────────────────────

function StatusOverviewSection({
  data,
  displayStatus,
}: {
  data: ApplicationDetail;
  displayStatus: DisplayStatus;
}) {
  const cfg = STATUS_CONFIG[displayStatus];
  const membership = data.gym_memberships?.[0];

  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/70">
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Current Status
            </p>
            <Badge
              className={cn("border text-xs font-semibold", cfg.badgeClass)}
            >
              {cfg.label}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Application Date
            </p>
            <p className="text-sm font-medium text-foreground text-right">
              {formatDateTime(data.created_at)}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Reviewed By
            </p>
            <p className="text-sm font-medium text-foreground text-right">
              {orFallback((data.reviewer as any)?.full_name, "—")}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Reviewed At
            </p>
            <p className="text-sm font-medium text-foreground text-right">
              {data.reviewed_at ? formatDateTime(data.reviewed_at) : "—"}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Membership ID
            </p>
            <p className="text-sm font-medium text-foreground text-right font-mono text-xs">
              {membership?.id ?? "—"}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Application ID
            </p>
            <p className="text-sm font-medium text-foreground text-right font-mono text-xs">
              {data.id}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sidebar: Owner Actions ─────────────────────────────────────────────────────

function OwnerActionsCard({
  displayStatus,
  rejectionReason,
  onApprove,
  onReject,
  onVerifyPayment,
  onRejectPayment,
  isPending,
}: {
  displayStatus: DisplayStatus;
  rejectionReason: string | null;
  onApprove: () => void;
  onReject: () => void;
  onVerifyPayment: () => void;
  onRejectPayment: () => void;
  isPending: boolean;
}) {
  if (displayStatus === "Pending") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 bg-muted/60 rounded-xl">
          <Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Review the member's details and approve or reject this application.
          </p>
        </div>
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90"
          onClick={onApprove}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LucideIcons.Loader2 className="size-4 animate-spin" />{" "}
              Approving...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" /> Approve Application
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/5"
          onClick={onReject}
          disabled={isPending}
        >
          <XCircle className="size-4" /> Reject Application
        </Button>
      </div>
    );
  }

  if (displayStatus === "Approved" || displayStatus === "PaymentPending") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <Clock3 className="size-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-700 dark:text-orange-400">
            Waiting for payment from member.
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          No actions available.
        </p>
      </div>
    );
  }

  if (displayStatus === "PaymentUploaded") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <Receipt className="size-4 text-purple-600 mt-0.5 shrink-0" />
          <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
            Payment receipt uploaded. Verify to activate membership.
          </p>
        </div>
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90"
          onClick={onVerifyPayment}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LucideIcons.Loader2 className="size-4 animate-spin" />{" "}
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" /> Verify Payment
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/5"
          onClick={onRejectPayment}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LucideIcons.Loader2 className="size-4 animate-spin" />{" "}
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="size-4" /> Reject Payment
            </>
          )}
        </Button>
      </div>
    );
  }

  if (displayStatus === "PaymentRejected") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
          <LucideIcons.AlertCircle className="size-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">
            Waiting for member to upload a new receipt.
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          No actions available.
        </p>
      </div>
    );
  }

  if (displayStatus === "Active") {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="size-12 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
          <BadgeCheck className="size-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
          Membership Active
        </p>
        <p className="text-xs text-muted-foreground text-center">
          No further action required.
        </p>
      </div>
    );
  }

  if (displayStatus === "Rejected") {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="size-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
          <XCircle className="size-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-red-600">
          Application Rejected
        </p>
        {rejectionReason && (
          <p className="text-xs text-muted-foreground text-center bg-muted px-3 py-2 rounded-lg w-full">
            {rejectionReason}
          </p>
        )}
      </div>
    );
  }

  return null;
}

function OwnerActionsSection({
  displayStatus,
  rejectionReason,
  onApprove,
  onReject,
  onVerifyPayment,
  onRejectPayment,
  isPending,
}: {
  displayStatus: DisplayStatus;
  rejectionReason: string | null;
  onApprove: () => void;
  onReject: () => void;
  onVerifyPayment: () => void;
  onRejectPayment: () => void;
  isPending: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <User className="size-4 text-primary" /> Owner Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <OwnerActionsCard
          displayStatus={displayStatus}
          rejectionReason={rejectionReason}
          onApprove={onApprove}
          onReject={onReject}
          onVerifyPayment={onVerifyPayment}
          onRejectPayment={onRejectPayment}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}

// ─── Sidebar: Audit Information ────────────────────────────────────────────────

function AuditInformationSection({ data }: { data: ApplicationDetail }) {
  const membership = data.gym_memberships?.[0];

  return (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Hash className="size-4 text-primary" /> Audit Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/70">
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Application ID
            </p>
            <p className="text-sm font-medium text-foreground text-right font-mono text-xs">
              {data.id}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">
              Membership ID
            </p>
            <p className="text-sm font-medium text-foreground text-right font-mono text-xs">
              {membership?.id ?? "—"}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">Payment ID</p>
            <p className="text-sm font-medium text-foreground text-right font-mono text-xs">
              {membership?.payments?.[0]?.id ?? "—"}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">Created At</p>
            <p className="text-sm font-medium text-foreground text-right">
              {formatDateTime(data.created_at)}
            </p>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <p className="text-sm text-muted-foreground shrink-0">Updated At</p>
            <p className="text-sm font-medium text-foreground text-right">
              {formatDateTime(data.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function ApplicationDetails({
  initialData,
}: {
  initialData: ApplicationDetail;
}) {
  const router = useRouter();
  const data = initialData;
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectPaymentDialog, setShowRejectPaymentDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const displayStatus = getDisplayStatus(data as any); // safe: same shape
  const member = data.members;
  const plan = data.membership_plans;
  const payment = data.gym_memberships?.[0]?.payments[0];

  // Optimistic updates — real persistence via server actions (TODO)
  const confirmApprove = () => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await approveMembershipApplicationAction(data.id);
        if (!result.success) {
          toast.error(result.error ?? "Failed to approve application.");
          return;
        }

        setShowApproveDialog(false);
        toast.success("Application approved.");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const confirmReject = (reason: string) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await rejectMembershipApplicationAction(data.id, reason);
        if (!result.success) {
          toast.error(result.error ?? "Failed to reject application.");
          return;
        }

        setShowRejectDialog(false);
        toast.success("Application rejected.");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const confirmVerify = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await verifyPaymentAction(payment?.id);

        if (!result.success) {
          toast.error(result.error ?? "Failed to verify payment.");
          return;
        }

        setShowVerifyDialog(false);
        toast.success("Payment verified successfully.");

        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const confirmRejectPayment = (reason: string) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await rejectPaymentAction(payment?.id, reason);

        if (!result.success) {
          toast.error(result.error ?? "Failed to reject payment.");
          return;
        }

        setShowRejectPaymentDialog(false);
        toast.success("Payment rejected successfully.");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <>
      <HeroBanner data={data} displayStatus={displayStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ════ LEFT ════ */}
        <div className="space-y-5">
          <ApplicantDetailsSection data={data} />
          <RequestedMembershipSection data={data} />
          <FitnessProfileSection data={data} />
          <ApplicationNoteSection data={data} displayStatus={displayStatus} />
          <PaymentInformationSection
            data={data}
            displayStatus={displayStatus}
          />
        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <StatusOverviewSection data={data} displayStatus={displayStatus} />
          <OwnerActionsSection
            displayStatus={displayStatus}
            rejectionReason={data.rejection_reason}
            isPending={isPending}
            onApprove={() => setShowApproveDialog(true)}
            onReject={() => setShowRejectDialog(true)}
            onVerifyPayment={() => setShowVerifyDialog(true)}
            onRejectPayment={() => setShowRejectPaymentDialog(true)}
          />
          <AuditInformationSection data={data} />
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        onConfirm={confirmApprove}
        title="Approve Application"
        icon={<CheckCircle2 data-icon="inline-start" />}
        confirmLabel="Approve Application"
        description={
          <>
            Approve{" "}
            <span className="font-semibold text-foreground">
              {member?.full_name ?? "this member"}'s
            </span>{" "}
            application for{" "}
            <span className="font-semibold text-foreground">
              {plan?.plan_name ?? "the selected plan"}
            </span>
            ? This will create a pending membership and notify the member to
            upload payment.
          </>
        }
      />

      <PromptDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={confirmReject}
        title="Reject Application"
        description={
          <>
            Provide a reason for rejecting{" "}
            <span className="font-semibold text-foreground">
              {member?.full_name ?? "this member"}'s
            </span>{" "}
            application.
          </>
        }
        placeholder="Rejection reason (required)..."
        confirmLabel="Reject Application"
        icon={<XCircle data-icon="inline-start" />}
        variant="destructive"
        required
      />

      <ConfirmDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        onConfirm={confirmVerify}
        title="Verify Payment"
        icon={<ShieldCheck data-icon="inline-start" />}
        confirmLabel="Verify & Activate"
        description={
          <>
            Verify the payment receipt for{" "}
            <span className="font-semibold text-foreground">
              {member?.full_name ?? "this member"}
            </span>
            ? Membership will immediately become active.
          </>
        }
      />

      <PromptDialog
        open={showRejectPaymentDialog}
        onOpenChange={setShowRejectPaymentDialog}
        onConfirm={confirmRejectPayment}
        title="Reject Payment"
        description="Provide a reason for rejecting this payment. The member will be asked to upload a new receipt."
        placeholder="e.g. Screenshot unclear, transaction ID doesn't match..."
        confirmLabel="Reject Payment"
        icon={<XCircle data-icon="inline-start" />}
        variant="destructive"
        required
      />
    </>
  );
}
