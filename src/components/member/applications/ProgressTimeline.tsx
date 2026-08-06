import { Card, CardContent } from "@/components/ui/card";
import { AppStatus } from "@/types";
import { CheckCircle2, Clock3, Info, XCircle } from "lucide-react";

interface ProgressTimelineProps {
  status: AppStatus;

  application: {
    submittedAt?: string;
    approvedAt?: string;
  };

  payment?: {
    uploadedAt?: string;
    verifiedAt?: string;
  };

  payment_receipt?: {
    uploaded_at?: string;
  };

  membership?: {
    activatedAt?: string;
    cancelledAt?: string;
  };
}

type StepState = "completed" | "active" | "upcoming" | "rejected";

interface ProgressStep {
  label: string;
  date?: string;
  state: StepState;
}

export function ProgressTimeline({
  status,
  application,
  payment,
  payment_receipt,
  membership,
}: ProgressTimelineProps) {
  const isRejected = status === "rejected";
  const isCancelled = status === "cancelled";

  const isApprovedOnward = [
    "approved_awaiting_payment",
    "payment_uploaded",
    "payment_verified",
    "cancelled",
  ].includes(status);

  const steps: ProgressStep[] = [
    {
      label: "Application Submitted",
      date: application.submittedAt,
      state: "completed",
    },
    {
      label: "Owner Review",
      date: status === "pending_review" ? undefined : application.approvedAt,
      state:
        status === "pending_review"
          ? "active"
          : isApprovedOnward || isRejected
            ? "completed"
            : "upcoming",
    },
  ];

  if (isRejected) {
    steps.push({
      label: "Application Rejected",
      date: application.approvedAt,
      state: "rejected",
    });
  } else {
    steps.push(
      {
        label: "Application Approved",
        date: isApprovedOnward ? application.approvedAt : undefined,
        state: isApprovedOnward ? "completed" : "upcoming",
      },
      {
        label:
          status === "payment_uploaded" ||
          status === "payment_verified" ||
          status === "cancelled"
            ? "Payment Uploaded"
            : "Payment Pending",
        date: payment_receipt?.uploaded_at,
        state:
          status === "approved_awaiting_payment"
            ? "active"
            : ["payment_uploaded", "payment_verified", "cancelled"].includes(
                  status,
                )
              ? "completed"
              : "upcoming",
      },
      {
        label: "Payment Verification",
        date:
          status === "payment_verified" || status === "cancelled"
            ? payment?.verifiedAt
            : undefined,
        state:
          status === "payment_uploaded"
            ? "active"
            : status === "payment_verified" || status === "cancelled"
              ? "completed"
              : "upcoming",
      },
      {
        label: isCancelled ? "Membership Cancelled" : "Membership Activated",
        date: isCancelled ? membership?.cancelledAt : membership?.activatedAt,
        state: isCancelled
          ? "rejected"
          : status === "payment_verified"
            ? "completed"
            : "upcoming",
      },
    );
  }

  const note =
    status === "cancelled"
      ? "This membership was cancelled."
      : [
            "pending_review",
            "approved_awaiting_payment",
            "payment_uploaded",
          ].includes(status)
        ? "Application approval does not activate your membership. Your membership becomes active only after payment verification by the gym owner."
        : undefined;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 md:justify-between md:overflow-visible scrollbar-hide">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div
                key={`${step.label}-${index}`}
                className="flex flex-col items-center flex-shrink-0 w-[84px] sm:w-[96px] md:w-auto md:flex-1"
              >
                <div className="flex items-center w-full">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                      step.state === "completed"
                        ? "bg-primary border-primary text-primary-foreground"
                        : step.state === "active"
                          ? "bg-primary border-primary text-primary-foreground shadow-[0_0_0_4px] shadow-primary/20"
                          : step.state === "rejected"
                            ? "bg-destructive border-destructive text-destructive-foreground"
                            : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {step.state === "completed" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : step.state === "active" ? (
                      <Clock3 className="w-4 h-4" />
                    ) : step.state === "rejected" ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 transition-colors ${
                        step.state === "completed" ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className="mt-2 text-center px-1">
                  <p
                    className={`text-[11px] sm:text-xs font-medium leading-tight ${
                      step.state === "completed" || step.state === "active"
                        ? "text-foreground"
                        : step.state === "rejected"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>

                  {step.date && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {step.date}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {note && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
