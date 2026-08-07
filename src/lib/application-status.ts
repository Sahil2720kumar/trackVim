import { DisplayStatus, MembershipApplication } from "@/types";

/**
 * membership_applications.status only tracks Pending/Approved/Rejected.
 * Once Approved, a gym_memberships row is created and its status
 * (PaymentPending → PaymentUploaded/PaymentRejected → Active) takes over.
 * This derives the single status the UI should show.
 */
export function getDisplayStatus(app: any): DisplayStatus {
  if (app.status !== "Approved") return app.status; // Pending | Rejected

  const membership = app.gym_memberships?.[0];
  return membership ? membership.status : "Approved";
}

export const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Pending: {
    label: "Pending Review",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  Approved: {
    label: "Approved",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  Rejected: {
    label: "Rejected",
    badgeClass:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
    dotClass: "bg-gray-500",
  },
  PaymentPending: {
    label: "Payment Pending",
    badgeClass:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  PaymentUploaded: {
    label: "Payment Uploaded",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
    dotClass: "bg-purple-500",
  },
  PaymentRejected: {
    label: "Payment Rejected",
    badgeClass:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  Active: {
    label: "Active",
    badgeClass:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
    dotClass: "bg-green-500",
  },
  Expired: {
    label: "Expired",
    badgeClass:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
    dotClass: "bg-gray-500",
  },
  Cancelled: {
    label: "Cancelled",
    badgeClass:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
    dotClass: "bg-gray-500",
  },
  Frozen: {
    label: "Frozen",
    badgeClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800",
    dotClass: "bg-sky-500",
  },
};

// Tabs — only statuses relevant to the applications inbox view.
// Expired/Cancelled/Frozen belong to the memberships list, not here.
export const STATUS_TABS: { key: DisplayStatus | "All"; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Approved", label: "Approved" },
  { key: "PaymentPending", label: "Payment Pending" },
  { key: "PaymentUploaded", label: "Payment Uploaded" },
  { key: "PaymentRejected", label: "Payment Rejected" },
  { key: "Active", label: "Active" },
  { key: "Rejected", label: "Rejected" },
];

export type TimelineStage = "submitted" | "review" | "payment" | "active";

export const TIMELINE_STAGES: { key: TimelineStage; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
  { key: "active", label: "Active" },
];

const STAGE_ORDER: Record<DisplayStatus, TimelineStage[]> = {
  Pending: [],
  Rejected: ["submitted"],
  Approved: ["submitted", "review"],
  PaymentPending: ["submitted", "review"],
  PaymentUploaded: ["submitted", "review"],
  PaymentRejected: ["submitted", "review"],
  Active: ["submitted", "review", "payment"],
  Expired: ["submitted", "review", "payment", "active"],
  Cancelled: ["submitted", "review", "payment"],
  Frozen: ["submitted", "review", "payment"],
};

export function getCompletedStages(status: DisplayStatus): TimelineStage[] {
  return STAGE_ORDER[status] ?? [];
}

export function getActiveStage(status: DisplayStatus): TimelineStage | null {
  switch (status) {
    case "Pending":
      return "submitted";
    case "Approved":
    case "PaymentPending":
    case "PaymentUploaded":
    case "PaymentRejected":
      return "payment";
    case "Active":
    case "Frozen":
      return "active";
    case "Rejected":
    case "Expired":
    case "Cancelled":
      return null;
    default:
      return null;
  }
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
    year: "numeric",
  });
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

//Application Deatils

// ─── Timeline — detailed 6-step version (application detail page) ─────────────

export interface DetailTimelineStep {
  key: string;
  label: string;
}

export const DETAIL_TIMELINE_STEPS: DetailTimelineStep[] = [
  { key: "submitted", label: "Application Submitted" },
  { key: "review", label: "Owner Review" },
  { key: "paymentPending", label: "Payment Pending" },
  { key: "paymentUploaded", label: "Payment Uploaded" },
  { key: "paymentVerified", label: "Payment Verified" },
  { key: "active", label: "Membership Active" },
];

export function getDetailTimelineState(status: DisplayStatus): {
  completed: string[];
  active: string | null;
  rejected: string[];
} {
  switch (status) {
    case "Pending":
      return { completed: ["submitted"], active: "review", rejected: [] };
    case "Approved":
    case "PaymentPending":
      return {
        completed: ["submitted", "review", "paymentPending"],
        active: "paymentUploaded",
        rejected: [],
      };
    case "PaymentUploaded":
      return {
        completed: ["submitted", "review", "paymentPending", "paymentUploaded"],
        active: "paymentVerified",
        rejected: [],
      };
    case "PaymentRejected":
      return {
        completed: ["submitted", "review", "paymentPending", "paymentUploaded"],
        active: "paymentUploaded",
        rejected: ["paymentVerified"],
      };
    case "Active":
      return {
        completed: [
          "submitted",
          "review",
          "paymentPending",
          "paymentUploaded",
          "paymentVerified",
          "active",
        ],
        active: null,
        rejected: [],
      };
    case "Rejected":
      return { completed: ["submitted"], active: null, rejected: ["review"] };
    case "Frozen":
    case "Expired":
    case "Cancelled":
      return {
        completed: [
          "submitted",
          "review",
          "paymentPending",
          "paymentUploaded",
          "paymentVerified",
          "active",
        ],
        active: null,
        rejected: [],
      };
    default:
      return { completed: ["submitted"], active: null, rejected: [] };
  }
}
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
