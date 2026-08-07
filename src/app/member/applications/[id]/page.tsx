import { ProgressTimeline } from "@/components/member/applications/ProgressTimeline";
import { ApplicationSummary } from "@/components/member/applications/ApplicationSummary";
import { MembershipPlanCard } from "@/components/member/applications/MembershipPlanCard";
import { ApplicationTimeline } from "@/components/member/applications/ApplicationTimeline";
import { OwnerNotes } from "@/components/member/applications/OwnerNotes";
import { HelpCard } from "@/components/member/applications/HelpCard";
import { PaymentSection } from "@/components/member/applications/PaymentSection";
import { getMyApplicationById } from "@/services/member.query";
import { AppStatus } from "@/types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveStatus(
  membershipStatus: string | null,
  rejectionReason: string | null,
  latestPaymentStatus: string | null,
): AppStatus {
  // Application rejected — no membership row will exist yet.
  if (rejectionReason) return "rejected";

  // No membership row yet = application hasn't been approved.
  if (!membershipStatus) return "pending_review";

  // Payment-level rejection takes priority over whatever the
  // membership row's status currently says.
  if (latestPaymentStatus === "Rejected") return "payment_rejected";

  switch (membershipStatus) {
    case "PaymentUploaded":
      return "payment_uploaded";
    case "Active":
      return "payment_verified";
    case "Cancelled":
      return "cancelled";
    case "PaymentRejected":
      return "payment_rejected";
    case "PaymentPending":
      return "payment_pending";
    default:
      return "approved_awaiting_payment";
  }
}

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { success, data } = await getMyApplicationById(id);
  if (!success || !data) throw new Error("Unable to Fetch Data");

  const gymRow = data.gyms;
  const planRow = data.membership_plans;
  const membershipRow = data.gym_memberships?.[0] ?? null;

  // Payment is a single row, updated in place — not a history array.
  const currentPayment = membershipRow?.payments?.[0] ?? null;
  // Receipts DO accumulate (one per upload), but the query already limits
  // this to the single latest receipt, so [0] is the current one.
  const currentReceipt = currentPayment?.payment_receipts?.[0] ?? null;

  const paidTotal =
    currentPayment?.status === "Verified" ? Number(currentPayment.amount) : 0;
  const remaining = membershipRow
    ? Number(membershipRow.final_amount) - paidTotal
    : Number(planRow?.plan_price ?? 0);

  const status = resolveStatus(
    membershipRow?.status ?? null,
    data.rejection_reason,
    currentPayment?.status ?? null,
  );

  const plan = {
    name: planRow?.plan_name ?? "",
    duration: planRow?.membership_duration ?? "",
    price: Number(planRow?.plan_price ?? 0),
    joiningFee: Number(planRow?.joining_fee ?? 0),
    currency: "₹",
    period: planRow?.membership_duration ?? "",
    benefits: [
      ...((planRow?.selected_features as string[]) ?? []),
      ...((planRow?.custom_features as string[]) ?? []),
    ],
  };

  // TODO: no upi_id / owner "note" column on gyms/users yet — only payment_qr_url exists.
  // Either add these columns or drop them from OwnerNotes/PaymentSection.
  const owner = {
    name: gymRow.owner?.full_name ?? "Gym Owner",
    role: `Owner · ${gymRow.name}`,
    upiId: "",
    qrCode: gymRow.payment_qr_url ?? "",
    paymentMethod: "UPI Payment",
    note: "",
  };

  const application = {
    id: data.id,
    applicationDate: formatDate(data.created_at),
    applicationTime: formatTime(data.created_at),
    approvedDate: formatDate(data.reviewed_at),
    approvedTime: formatTime(data.reviewed_at),
    reviewedBy: data.reviewer?.full_name
      ? `${data.reviewer.full_name} (Owner)`
      : "—",
    reviewMessage: data.message ?? "",
    rejectionReason: data.rejection_reason ?? undefined,
  };

  // NOTE: payments has no rejected_at column — created_at is the payment
  // row's original creation time, not the moment it was rejected. Swap
  // this for a real rejected_at/updated_at once that column exists.
  const paymentRejectedAt =
    currentPayment?.status === "Rejected" && currentPayment?.updated_at
      ? formatDate(currentPayment.updated_at)
      : undefined;
  const paymentRejectionReason =
    currentPayment?.status === "Rejected"
      ? (currentPayment?.rejection_reason ?? undefined)
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Application Details
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track your membership application and complete the remaining
                steps.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground">Application ID</p>
              <p className="font-mono text-sm ">{application.id}</p>
            </div>
          </div>
        </div>

        <ProgressTimeline
          status={status}
          application={{
            submittedAt: application.applicationDate,
            approvedAt: application.approvedDate,
          }}
          payment={{
            uploadedAt: currentPayment?.created_at
              ? formatDate(currentPayment.created_at)
              : undefined,
            verifiedAt: currentPayment?.verified_at
              ? formatDate(currentPayment.verified_at)
              : undefined,
            rejectedAt: paymentRejectedAt,
          }}
          payment_receipt={{
            uploaded_at: currentReceipt?.uploaded_at
              ? formatDate(currentReceipt.uploaded_at)
              : undefined,
          }}
          membership={{
            activatedAt: membershipRow?.activated_at
              ? formatDate(membershipRow.activated_at)
              : undefined,
            cancelledAt: membershipRow?.cancelled_at
              ? formatDate(membershipRow.cancelled_at)
              : undefined,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <ApplicationSummary
              status={status}
              gym={gymRow}
              application={application}
            />
            <MembershipPlanCard plan={plan} />
            <ApplicationTimeline
              status={status}
              application={{
                submittedAt: `${application.applicationDate} · ${application.applicationTime}`,
                reviewedAt: application.approvedDate
                  ? `${application.approvedDate} · ${application.approvedTime}`
                  : undefined,
                rejectionReason: application.rejectionReason,
              }}
              payment={{
                uploadedAt: currentPayment?.created_at
                  ? formatDate(currentPayment.created_at)
                  : undefined,
                verifiedAt: currentPayment?.verified_at
                  ? formatDate(currentPayment.verified_at)
                  : undefined,
                rejectedAt: paymentRejectedAt,
                rejectionReason: paymentRejectionReason,
              }}
              membership={{
                activatedAt: membershipRow?.activated_at
                  ? formatDate(membershipRow.activated_at)
                  : undefined,
                cancelledAt: membershipRow?.cancelled_at
                  ? formatDate(membershipRow.cancelled_at)
                  : undefined,
                cancellationReason:
                  membershipRow?.cancellation_reason ?? undefined,
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OwnerNotes owner={owner} />
              <HelpCard gym={gymRow} />
            </div>
          </div>

          <div className="lg:sticky lg:top-[60px] space-y-4">
            <PaymentSection
              owner={owner}
              status={status}
              plan={plan}
              gymId={gymRow.id}
              gymMembershipId={membershipRow?.id ?? null}
              pendingPaymentId={currentPayment?.id ?? null}
              remainingAmount={remaining}
              joiningFee={plan.joiningFee}
              receipt={
                currentReceipt
                  ? {
                      url: currentReceipt.file_url,
                      uploadedAt: formatDate(currentReceipt.uploaded_at),
                      amount: currentPayment?.amount
                        ? Number(currentPayment.amount)
                        : undefined,
                      method: currentPayment?.method ?? undefined,
                      verifiedAt: currentPayment?.verified_at
                        ? formatDate(currentPayment.verified_at)
                        : undefined,
                      rejectedAt: paymentRejectedAt,
                      rejectionReason: paymentRejectionReason,
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
