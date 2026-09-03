"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard, SummaryRow } from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  AlertCircle,
  Package,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Users,
  Eye,
  StickyNote,
  Crown,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { usePlanById } from "@/hooks/queries/owner.query";
import { PLAN_ICONS } from "@/constants/plan-options";

function PlanDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 shrink-0" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function PlanDetailsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col items-center text-center gap-4 my-8">
      <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Failed to load plan details
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/owner/plans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Link>
        </Button>
      </div>
    </div>
  );
}

export interface PlanDetailsContentProps {
  planId: string;
  gymId: string;
}

export default function PlanDetailsContent({
  planId,
  gymId,
}: PlanDetailsContentProps) {
  const router = useRouter();
  const { data: plan, isLoading, error, refetch } = usePlanById(planId);

  if (isLoading) {
    return <PlanDetailsSkeleton />;
  }

  if (error || !plan) {
    return (
      <PlanDetailsError
        message={error ? error.message : "Membership plan not found."}
        onRetry={() => refetch()}
      />
    );
  }

  const selectedFeatures = Array.isArray(plan.selected_features)
    ? plan.selected_features
    : [];
  const customFeatures = Array.isArray(plan.custom_features)
    ? plan.custom_features
    : [];
  const allFeatures = [...selectedFeatures, ...customFeatures];

  const SelectedIcon =
    PLAN_ICONS.find((i) => i.name === plan.plan_icon)?.icon || Crown;

  const planColor = plan.plan_color || "#8b5cf6";

  const statusBadgeVariant =
    plan.status === "Active"
      ? "default"
      : plan.status === "Draft"
        ? "secondary"
        : "outline";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0 border border-border hover:bg-accent"
              onClick={() => router.push("/owner/plans")}
              title="Back to Plans"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {plan.plan_name}
                </h1>
                <Badge variant={statusBadgeVariant} className="text-xs">
                  {plan.status}
                </Badge>
                {plan.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                {plan.short_description ||
                  "Detailed overview of this gym membership plan."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              className={bigSquareButton}
              onClick={() => router.push(`/owner/plans/${planId}/edit`)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Details Column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Basic Information */}
          <SectionCard title="Basic Information" icon={Package}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Plan Name
                </span>
                <p className="font-medium text-foreground">{plan.plan_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Category
                </span>
                <p className="font-medium text-foreground">
                  {plan.plan_category || "Standard"}
                </p>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Description
              </span>
              <p className="text-sm text-foreground">
                {plan.short_description}
              </p>
            </div>
          </SectionCard>

          {/* Pricing & Fees */}
          <SectionCard title="Pricing & Fees" icon={IndianRupee}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium text-muted-foreground">
                  Plan Price
                </span>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ₹{plan.plan_price}
                </p>
                <span className="text-xs text-muted-foreground">
                  / {plan.membership_duration}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium text-muted-foreground">
                  Joining Fee
                </span>
                <p className="text-xl font-bold text-foreground mt-1">
                  ₹{plan.joining_fee ?? 0}
                </p>
                <span className="text-xs text-muted-foreground">One-time</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium text-muted-foreground">
                  Security Deposit
                </span>
                <p className="text-xl font-bold text-foreground mt-1">
                  ₹{plan.security_deposit ?? 0}
                </p>
                <span className="text-xs text-muted-foreground">
                  Refundable
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <SummaryRow
                label="Pricing Type"
                value={plan.pricing_type || "Recurring"}
              />
              {plan.discount_type && plan.discount_value && (
                <SummaryRow
                  label="Discount Available"
                  value={`${plan.discount_value}${plan.discount_type === "Percentage" ? "%" : " ₹"}`}
                />
              )}
            </div>
          </SectionCard>

          {/* Duration & Rules */}
          <SectionCard title="Duration & Freeze Policy" icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <SummaryRow
                label="Membership Duration"
                value={plan.membership_duration}
              />
              <SummaryRow
                label="Duration in Months"
                value={`${plan.duration_months} Month(s)`}
              />
              <SummaryRow
                label="Validity Starts"
                value={plan.validity_starts || "From Joining Date"}
              />
              <SummaryRow
                label="Grace Period"
                value={`${plan.grace_period_days ?? 0} Days`}
              />
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Membership Freeze
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan.allow_freeze
                    ? `Members can pause up to ${plan.max_freeze_days ?? 0} days`
                    : "Freeze feature disabled for this plan"}
                </p>
              </div>
              <Badge variant={plan.allow_freeze ? "default" : "secondary"}>
                {plan.allow_freeze ? "Allowed" : "Not Allowed"}
              </Badge>
            </div>
          </SectionCard>

          {/* Features */}
          <SectionCard
            title="Included Features"
            icon={CheckCircle2}
            badge={
              <Badge variant="secondary">{allFeatures.length} Total</Badge>
            }
          >
            {allFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specific features listed.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Enrollment Rules */}
          <SectionCard title="Enrollment & Eligibility" icon={Users}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <SummaryRow
                label="Age Limit"
                value={`${plan.minimum_age ?? 14} - ${plan.maximum_age ?? 80} Years`}
              />
              <SummaryRow
                label="Max Active Members"
                value={
                  plan.max_active_members
                    ? `${plan.max_active_members} members`
                    : "Unlimited"
                }
              />
              <SummaryRow
                label="Enrollment Mode"
                value={plan.enrollment_mode || "Open"}
              />
              <SummaryRow
                label="Cancellation Policy"
                value={
                  plan.cancellation_allowed
                    ? "Allowed before expiry"
                    : "Not allowed"
                }
              />
            </div>
          </SectionCard>

          {/* Notes */}
          {plan.additional_notes && (
            <SectionCard title="Additional Notes" icon={StickyNote}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {plan.additional_notes}
              </p>
            </SectionCard>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Live Card Preview */}
            <SectionCard title="Plan Preview Card" icon={Eye}>
              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: planColor }}
                  >
                    <SelectedIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    {plan.is_featured && (
                      <Badge className="text-xs mb-1">Featured</Badge>
                    )}
                    <h4 className="font-semibold text-foreground truncate">
                      {plan.plan_name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    ₹{plan.plan_price}{" "}
                    <span className="text-sm text-muted-foreground">
                      / {plan.membership_duration}
                    </span>
                  </p>
                  {plan.joining_fee && Number(plan.joining_fee) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Joining Fee: ₹{plan.joining_fee}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {plan.plan_category || "Standard"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {plan.membership_duration}
                  </Badge>
                </div>
              </div>
            </SectionCard>

            {/* Quick Actions */}
            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
              <h4 className="font-semibold text-sm text-foreground">
                Quick Actions
              </h4>
              <Button
                className={`w-full ${bigSquareButton}`}
                onClick={() => router.push(`/owner/plans/${planId}/edit`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Membership Plan
              </Button>
              <Button
                variant="outline"
                className={`w-full ${bigSquareButton}`}
                onClick={() => router.push("/owner/plans")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
