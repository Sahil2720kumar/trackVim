"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Users, Loader2, RefreshCw } from "lucide-react";
import { ApplicationsPanel } from "@/components/owner/Applicationspanel";
import { ConfirmDialog } from "@/components/Confirmdialog";
import { PromptDialog } from "@/components/Promptdialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  approveMembershipApplicationAction,
  rejectMembershipApplicationAction,
} from "@/actions/owner.action";
import { useApplications } from "@/hooks/queries/owner.query";

export function ApplicationsSkeleton() {
  return (
    <>
      {/* Search + sort bar */}
      <section className="mb-3 sm:mb-4">
        <Skeleton className="h-16 sm:h-[68px] w-full rounded-lg" />
      </section>

      {/* Status tabs */}
      <section className="flex gap-2 mb-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </section>

      {/* Application cards */}
      <section className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
        ))}
      </section>
    </>
  );
}

function ApplicationsError({
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
        Couldn't load applications{message ? `: ${message}` : "."}
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

export function ApplicationsList() {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApplications();

  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => setApproveTarget(id);
  const handleReject = (id: string) => setRejectTarget(id);
  const handleViewDetails = (id: string) =>
    router.push(`/owner/applications/${id}`);
  const handleCardClick = (id: string) =>
    router.push(`/owner/applications/${id}`);

  const confirmApprove = () => {
    if (!approveTarget || isPending) return;

    startTransition(async () => {
      try {
        const result = await approveMembershipApplicationAction(approveTarget);

        if (!result.success) {
          toast.error(result.error ?? "Failed to approve application.");
          return;
        }

        setApproveTarget(null);
        toast.success("Application approved.");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const confirmReject = (reason: string) => {
    if (!rejectTarget || isPending) return;

    startTransition(async () => {
      try {
        const result = await rejectMembershipApplicationAction(
          rejectTarget,
          reason,
        );

        if (!result.success) {
          toast.error(result.error ?? "Failed to reject application.");
          return;
        }

        setRejectTarget(null);
        toast.success("Application rejected.");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  if (isLoading) {
    return <ApplicationsSkeleton />;
  }

  if (isError) {
    return (
      <ApplicationsError
        message={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  const applications = response?.success ? response.data : [];
  const approveTargetApplication = applications.find(
    (a) => a.id === approveTarget,
  );
  const pendingCount = applications.filter(
    (a) => a.status === "Pending",
  ).length;

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-8 inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5">
          <Users className="size-4 shrink-0" />
          <span className="text-sm font-semibold">
            {pendingCount} application{pendingCount !== 1 ? "s" : ""} awaiting
            review
          </span>
        </div>
      )}

      <ApplicationsPanel
        applications={applications}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={handleViewDetails}
        onClick={handleCardClick}
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && !isPending && setApproveTarget(null)}
        onConfirm={confirmApprove}
        title="Approve Application"
        description={
          <>
            Are you sure you want to approve{" "}
            {approveTargetApplication
              ? `${approveTargetApplication.members?.full_name}'s`
              : "this"}{" "}
            membership application? The member will be notified to complete
            their payment.
          </>
        }
        confirmLabel={isPending ? "Approving..." : "Approve"}
        icon={<CheckCircle2 data-icon="inline-start" />}
      />

      <PromptDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && !isPending && setRejectTarget(null)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Please provide a reason for rejecting this membership application."
        placeholder="Enter rejection reason (required)..."
        confirmLabel={isPending ? "Rejecting..." : "Reject Application"}
        icon={<XCircle data-icon="inline-start" />}
        variant="destructive"
        required
      />
    </>
  );
}
