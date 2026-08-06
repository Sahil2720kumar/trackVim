"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import { ApplicationsPanel } from "@/components/owner/Applicationspanel";
import { ConfirmDialog } from "@/components/Confirmdialog";
import { PromptDialog } from "@/components/Promptdialog";
import { MembershipApplication } from "@/types";

export function ApplicationsList({
  initialApplications,
}: {
  initialApplications: MembershipApplication[];
}) {
  const router = useRouter();

  const [applications, setApplications] =
    useState<MembershipApplication[]>(initialApplications);

  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const handleApprove = (id: string) => setApproveTarget(id);
  const handleReject = (id: string) => setRejectTarget(id);
  const handleViewDetails = (id: string) =>
    router.push(`/owner/applications/${id}`);
  const handleCardClick = (id: string) =>
    router.push(`/owner/applications/${id}`);

  const confirmApprove = () => {
    if (!approveTarget) return;
    setApplications((prev) =>
      prev.map((a) =>
        a.id === approveTarget
          ? {
              ...a,
              status: "Approved",
              reviewed_at: new Date().toISOString(),
            }
          : a,
      ),
    );
    setApproveTarget(null);
    // TODO: server action — update membership_applications.status/reviewed_by/reviewed_at,
    // then insert the corresponding gym_memberships row (status: 'PaymentPending')
  };

  const confirmReject = (reason: string) => {
    if (!rejectTarget) return;
    setApplications((prev) =>
      prev.map((a) =>
        a.id === rejectTarget
          ? {
              ...a,
              status: "Rejected",
              reviewed_at: new Date().toISOString(),
              rejection_reason: reason || null,
            }
          : a,
      ),
    );
    setRejectTarget(null);
    // TODO: server action — update membership_applications status/reviewed_by/reviewed_at/rejection_reason
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
        onOpenChange={(open) => !open && setApproveTarget(null)}
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
        confirmLabel="Approve"
        icon={<CheckCircle2 data-icon="inline-start" />}
      />

      <PromptDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Please provide a reason for rejecting this membership application."
        placeholder="Enter rejection reason (optional)..."
        confirmLabel="Reject Application"
        icon={<XCircle data-icon="inline-start" />}
        variant="destructive"
      />
    </>
  );
}
