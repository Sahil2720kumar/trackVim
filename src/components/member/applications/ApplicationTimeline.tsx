import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock3, ShieldCheck, XCircle, Ban } from "lucide-react";
import type { AppStatus } from "./types";

type TimelineVariant =
  | "completed"
  | "current"
  | "pending"
  | "rejected"
  | "cancelled";

type TimelineEvent = {
  icon: ReactNode;
  title: string;
  date?: string;
  description: string;
  variant: TimelineVariant;
  badge?: string;
  highlight?: boolean;
};

interface ApplicationTimelineProps {
  status: AppStatus;
  application: {
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  payment?: {
    uploadedAt?: string;
    verifiedAt?: string;
  };
  membership?: {
    activatedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
  };
}

const APPROVED_ONWARD: AppStatus[] = [
  "approved_awaiting_payment",
  "payment_uploaded",
  "payment_verified",
  "cancelled",
];

export function ApplicationTimeline({
  status,
  application,
  payment,
  membership,
}: ApplicationTimelineProps) {
  const isRejected = status === "rejected";
  const isCancelled = status === "cancelled";
  const isApprovedOnward = APPROVED_ONWARD.includes(status);

  const events: TimelineEvent[] = [
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Application Submitted",
      date: application.submittedAt,
      description:
        "You have successfully submitted your membership application.",
      variant: "completed",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Owner Review",
      date: status === "pending_review" ? undefined : application.reviewedAt,
      description: "Owner is reviewing your application details.",
      variant:
        status === "pending_review"
          ? "current"
          : isApprovedOnward || isRejected
            ? "completed"
            : "pending",
    },
  ];

  if (isRejected) {
    events.push({
      icon: <XCircle className="w-4 h-4" />,
      title: "Application Rejected",
      date: application.reviewedAt,
      description:
        application.rejectionReason ??
        "The gym owner did not approve this application.",
      variant: "rejected",
    });
  } else {
    events.push({
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Application Approved",
      date: isApprovedOnward ? application.reviewedAt : undefined,
      description:
        "Congratulations! Your application has been approved by the gym owner.",
      variant: isApprovedOnward ? "completed" : "pending",
      highlight: isApprovedOnward,
    });

    events.push({
      icon: <Clock3 className="w-4 h-4" />,
      title: "Payment Pending",
      date:
        status === "approved_awaiting_payment"
          ? "Current Step"
          : (payment?.uploadedAt ?? payment?.verifiedAt),
      description:
        "Please complete the payment and upload receipt for verification.",
      variant:
        status === "approved_awaiting_payment"
          ? "current"
          : ["payment_uploaded", "payment_verified", "cancelled"].includes(
                status,
              )
            ? "completed"
            : "pending",
      badge:
        status === "approved_awaiting_payment" ? "Current Step" : undefined,
    });

    events.push({
      icon: <ShieldCheck className="w-4 h-4" />,
      title: "Payment Verification",
      date:
        status === "payment_verified" || status === "cancelled"
          ? payment?.verifiedAt
          : undefined,
      description: "Your payment will be verified by the gym owner.",
      variant:
        status === "payment_uploaded"
          ? "current"
          : status === "payment_verified" || status === "cancelled"
            ? "completed"
            : "pending",
    });

    events.push({
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Membership Activation",
      date:
        status === "payment_verified" || status === "cancelled"
          ? membership?.activatedAt
          : undefined,
      description:
        "Your membership will be activated after payment verification.",
      variant:
        status === "payment_verified" || status === "cancelled"
          ? "completed"
          : "pending",
    });

    if (isCancelled) {
      events.push({
        icon: <Ban className="w-4 h-4" />,
        title: "Membership Cancelled",
        date: membership?.cancelledAt,
        description:
          membership?.cancellationReason ?? "This membership was cancelled.",
        variant: "cancelled",
      });
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, i) => {
            const isLast = i === events.length - 1;
            return (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      event.variant === "rejected"
                        ? "bg-destructive border-destructive text-destructive-foreground"
                        : event.variant === "cancelled"
                          ? "bg-muted-foreground border-muted-foreground text-background"
                          : event.variant === "completed"
                            ? "bg-primary border-primary text-primary-foreground"
                            : event.variant === "current"
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {event.variant === "pending" ? (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    ) : (
                      event.icon
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[1.5rem] ${
                        event.variant === "completed" ||
                        event.variant === "rejected" ||
                        event.variant === "cancelled"
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className={`pb-5 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        event.variant === "pending"
                          ? "text-muted-foreground"
                          : event.variant === "rejected"
                            ? "text-destructive"
                            : "text-foreground"
                      }`}
                    >
                      {event.title}
                    </p>
                    {event.badge && (
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30 text-xs py-0"
                      >
                        {event.badge}
                      </Badge>
                    )}
                  </div>
                  {event.date && (
                    <p
                      className={`text-xs mb-1 ${
                        event.variant === "current"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {event.date}
                    </p>
                  )}
                  <p
                    className={`text-sm leading-relaxed ${
                      event.highlight
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded px-2 py-1"
                        : event.variant === "rejected"
                          ? "text-destructive/90"
                          : "text-muted-foreground"
                    }`}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
