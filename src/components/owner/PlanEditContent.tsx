"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { usePlanById } from "@/hooks/queries/owner.query";
import MembershipPlanForm from "@/components/owner/MembershipPlanForm";

function PlanEditSkeleton() {
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

function PlanEditError({
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
        <h3 className="text-lg font-semibold text-foreground">Failed to load plan details</h3>
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

export interface PlanEditContentProps {
  planId: string;
  gymId: string;
}

export default function PlanEditContent({
  planId,
  gymId,
}: PlanEditContentProps) {
  const router = useRouter();
  const { data: plan, isLoading, error, refetch } = usePlanById(planId);

  if (isLoading) {
    return <PlanEditSkeleton />;
  }

  if (error || !plan) {
    return (
      <PlanEditError
        message={error ? error.message : "Membership plan not found."}
        onRetry={() => refetch()}
      />
    );
  }

  const statusBadgeVariant =
    plan.status === "Active"
      ? "default"
      : plan.status === "Draft"
      ? "secondary"
      : "outline";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0 border border-border hover:bg-accent"
              onClick={() => router.push(`/owner/plans/${planId}`)}
              title="Back to Plan Details"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  Edit {plan.plan_name}
                </h1>
                <Badge variant={statusBadgeVariant} className="text-xs">
                  {plan.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                Update details, pricing, duration, and features for this membership plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="py-2">
        <MembershipPlanForm
          initialData={plan}
          planId={planId}
          mode="edit"
        />
      </main>
    </div>
  );
}
