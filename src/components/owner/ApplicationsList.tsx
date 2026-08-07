"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import { ApplicationsPanel } from "@/components/owner/Applicationspanel";
import { ConfirmDialog } from "@/components/Confirmdialog";
import { PromptDialog } from "@/components/Promptdialog";
import { MembershipApplication } from "@/types";
import { toast } from "sonner";
import {
  approveMembershipApplicationAction,
  rejectMembershipApplicationAction,
} from "@/actions/owner.action";

export function ApplicationsList({
  initialApplications,
}: {
  initialApplications: MembershipApplication[];
}) {
  const router = useRouter();

  const applications = initialApplications;

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

  const approveTargetApp = applications.find((a) => a.id === approveTarget);
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
            {approveTargetApp
              ? `${approveTargetApp.members?.full_name}'s`
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
