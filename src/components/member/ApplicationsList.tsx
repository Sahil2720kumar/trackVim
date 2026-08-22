"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  IndianRupee,
  Info,
  MapPin,
  Timer,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getDisplayStatus,
  STATUS_CONFIG,
  STATUS_TABS,
  formatDate,
  formatPrice,
  getInitials,
} from "@/lib/application-status";
import type { MembershipApplication, DisplayStatus } from "@/types";
import { useMyApplications } from "@/hooks/queries/member.query";

// ── Tab icon styling ────────────────────────────────────────────────────

const STAT_STYLES: Record<
  string,
  {
    icon: React.ElementType;
    iconWrap: string;
    iconColor: string;
    label: string;
  }
> = {
  Pending: {
    icon: Clock,
    iconWrap: "bg-amber-100 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Awaiting gym owner review",
  },
  PaymentPending: {
    icon: CreditCard,
    iconWrap: "bg-amber-100 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Payment required to continue",
  },
  PaymentRejected: {
    icon: CreditCard,
    iconWrap: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Payment proof was rejected",
  },
  Approved: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-100 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "Membership approved",
  },
  Active: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-100 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "Membership active",
  },
  Rejected: {
    icon: XCircle,
    iconWrap: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Applications not approved",
  },
  Expired: {
    icon: XCircle,
    iconWrap: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Applications expired",
  },
  Cancelled: {
    icon: Ban,
    iconWrap: "bg-muted",
    iconColor: "text-muted-foreground",
    label: "Applications cancelled",
  },
};

// ── Per-card status theme (drives timeline step colors + note box) ───────

type StatusTheme = "amber" | "emerald" | "red" | "gray";

function getStatusTheme(status: DisplayStatus): StatusTheme {
  if (status === "Approved" || status === "Active") return "emerald";
  if (
    status === "Rejected" ||
    status === "Expired" ||
    status === "PaymentRejected"
  )
    return "red";
  if (status === "Cancelled") return "gray";
  return "amber"; // Pending, PaymentPending, PaymentUploaded
}

const THEME_CLASSES: Record<
  StatusTheme,
  { dot: string; line: string; box: string }
> = {
  amber: {
    dot: "bg-amber-500 text-white",
    line: "bg-amber-300 dark:bg-amber-800",
    box: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  },
  emerald: {
    dot: "bg-emerald-500 text-white",
    line: "bg-emerald-300 dark:bg-emerald-800",
    box: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  },
  red: {
    dot: "bg-red-500 text-white",
    line: "bg-red-300 dark:bg-red-800",
    box: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  },
  gray: {
    dot: "bg-gray-400 text-white",
    line: "bg-gray-300 dark:bg-gray-700",
    box: "border-border bg-muted text-muted-foreground",
  },
};

function StatusBadge({ status }: { status: DisplayStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold w-full justify-center ${cfg.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

// ── Info row (plan / price / duration / applied on) ───────────────────────

function InfoRow({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Vertical status timeline (colored per card status) ─────────────────────

interface TimelineEntry {
  key: string;
  title?: string;
  date?: string;
  description?: string;
  state: "done" | "active" | "rejected" | "neutral";
}

function getCardTimeline(
  app: MembershipApplication,
  status: DisplayStatus,
): TimelineEntry[] {
  const membership: any = app.gym_memberships?.[0];

  switch (status) {
    case "Pending":
      return [
        {
          key: "submitted",
          title: "Application Submitted",
          date: app.created_at,
          state: "done",
        },
        {
          key: "review",
          title: "Waiting for Owner Review",
          description: "We will notify you once there is an update.",
          state: "active",
        },
      ];

    case "Rejected":
      return [
        {
          key: "submitted",
          title: "Application Submitted",
          date: app.created_at,
          state: "done",
        },
        {
          key: "review",
          title: "Rejected",
          date: app.reviewed_at,
          state: "rejected",
        },
      ];

    case "Cancelled":
      return [
        {
          key: "cancelled",
          title: "Application Cancelled",
          date: membership?.cancelled_at ?? app.reviewed_at ?? app.created_at,
          state: "neutral",
        },
        {
          key: "note",
          description: "You cancelled this application.",
          state: "neutral",
        },
      ];

    case "Approved":
    case "PaymentPending":
    case "PaymentUploaded":
    case "PaymentRejected":
      return [
        {
          key: "submitted",
          title: "Application Submitted",
          date: app.created_at,
          state: "done",
        },
        {
          key: "review",
          title: "Approved",
          date: app.reviewed_at,
          state: "done",
        },
        status === "PaymentRejected"
          ? {
              key: "payment",
              title: "Payment Rejected",
              description: "Please re-upload your payment proof.",
              state: "rejected",
            }
          : status === "PaymentUploaded"
            ? {
                key: "payment",
                title: "Payment Uploaded",
                description: "Waiting for owner to verify your payment.",
                state: "active",
              }
            : {
                key: "payment",
                title: "Payment Pending",
                description: "Complete payment to activate your membership.",
                state: "active",
              },
      ];

    case "Active":
    case "Expired":
      return [
        {
          key: "submitted",
          title: "Application Submitted",
          date: app.created_at,
          state: "done",
        },
        {
          key: "review",
          title: "Approved",
          date: app.reviewed_at,
          state: "done",
        },
        {
          key: "active",
          title:
            status === "Expired"
              ? "Membership Expired"
              : "Membership Activated",
          date: membership?.activated_at ?? membership?.updated_at,
          state: status === "Expired" ? "rejected" : "done",
        },
      ];

    default:
      return [
        {
          key: "submitted",
          title: "Application Submitted",
          date: app.created_at,
          state: "done",
        },
      ];
  }
}

function VerticalTimeline({
  entries,
  theme,
}: {
  entries: TimelineEntry[];
  theme: StatusTheme;
}) {
  return (
    <div className="flex flex-col">
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;

        // Rejected steps are always red, in-progress steps are always amber,
        // completed steps pick up the card's overall status color, and
        // neutral steps (e.g. "cancelled" notes) stay muted.
        const dotWrap =
          entry.state === "rejected"
            ? THEME_CLASSES.red.dot
            : entry.state === "active"
              ? THEME_CLASSES.amber.dot
              : entry.state === "done"
                ? THEME_CLASSES[theme].dot
                : "bg-muted text-muted-foreground";

        const lineClass =
          entry.state === "done" ? THEME_CLASSES[theme].line : "bg-border";

        const titleClass =
          entry.state === "rejected"
            ? "text-red-600 dark:text-red-400"
            : entry.state === "neutral"
              ? "text-muted-foreground"
              : "text-foreground";

        const Icon =
          entry.state === "rejected"
            ? X
            : entry.state === "done"
              ? CheckCircle2
              : entry.state === "active"
                ? Clock
                : undefined;

        return (
          <div key={entry.key} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${dotWrap}`}
              >
                {Icon ? (
                  <Icon className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 my-1 ${lineClass}`} />}
            </div>
            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
              {entry.title && (
                <p
                  className={`text-sm font-semibold leading-tight ${titleClass}`}
                >
                  {entry.title}
                </p>
              )}
              {entry.date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(entry.date)}
                </p>
              )}
              {entry.description && (
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Actions (stacked, right column) ────────────────────────────────────────

function ApplicationActions({
  app,
  status,
}: {
  app: MembershipApplication;
  status: DisplayStatus;
}) {
  const btnClass = "rounded-lg w-full justify-center";

  const viewDetailsBtn = (
    <Button size="sm" variant="outline" className={btnClass} asChild>
      <Link href={`/member/applications/${app.id}`}>View Details</Link>
    </Button>
  );

  if (status === "Pending") {
    return (
      <div className="flex flex-col gap-2 w-full">
        {viewDetailsBtn}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${btnClass} text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 flex flex-row items-center gap-x-1`}
            >
              <X className="w-3.5 h-3.5" />
              Cancel Application
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Application?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your application for{" "}
                <span className="font-semibold text-foreground">
                  {app.gyms.name}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Application</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (
    status === "PaymentPending" ||
    status === "PaymentRejected" ||
    status === "PaymentUploaded"
  ) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {viewDetailsBtn}
        {status !== "PaymentUploaded" && (
          <Button
            size="sm"
            className={`${btnClass} bg-primary hover:bg-primary/90`}
            asChild
          >
            <Link
              className="flex flex-row items-center gap-x-1"
              href={`/member/applications/${app.id}`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {status === "PaymentRejected"
                ? "Re-upload Payment"
                : "Make Payment"}
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (status === "Approved" || status === "Active") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button size="sm" variant="outline" className={btnClass} asChild>
          <Link href={`/member/applications/${app.id}`}>View Membership</Link>
        </Button>
        <Button
          size="sm"
          className={`${btnClass} bg-primary hover:bg-primary/90`}
          asChild
        >
          <Link href={`/member/discover/${app.gyms.id}`}>Go to Gym</Link>
        </Button>
      </div>
    );
  }

  if (status === "Rejected" || status === "Expired" || status === "Cancelled") {
    return (
      <div className="flex flex-col gap-2 w-full">
        {viewDetailsBtn}
        <Button
          size="sm"
          className={`${btnClass} bg-primary hover:bg-primary/90`}
          asChild
        >
          <Link href={`/member/discover/${app.gyms.id}`}>Apply Again</Link>
        </Button>
      </div>
    );
  }

  return <div className="w-full">{viewDetailsBtn}</div>;
}

// ── Card ─────────────────────────────────────────────────────────────────

function ApplicationCard({ app }: { app: MembershipApplication }) {
  const router = useRouter();
  const status = getDisplayStatus(app);
  const timeline = getCardTimeline(app, status);
  const theme = getStatusTheme(status);

  const noteText = status === "Rejected" ? app.rejection_reason : app.message;

  return (
    <Card
      onClick={() => router.push(`/member/applications/${app.id}`)}
      className="rounded-3xl border border-border bg-card p-5 hover:border-primary/40 transition-all"
    >
      <CardContent className="p-0 space-y-4">
        <div className="flex items-stretch gap-4">
          {/* Left: gym info + plan meta */}
          <div className="w-full max-w-[460px] flex-shrink-0 space-y-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border flex items-center justify-center">
                {app.gyms.logo_url ? (
                  <img
                    src={app.gyms.logo_url}
                    alt={app.gyms.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {getInitials(app.gyms.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground leading-tight truncate">
                    {app.gyms.name}
                  </h3>
                  {app.gyms.is_verified && (
                    <BadgeCheck
                      className="w-4 h-4 text-primary flex-shrink-0"
                      title="Verified gym"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {[app.gyms.city, app.gyms.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {app.membership_plans && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <InfoRow
                  icon={ClipboardList}
                  value={app.membership_plans.plan_name}
                  label="Plan"
                />
                <InfoRow
                  icon={IndianRupee}
                  value={
                    formatPrice(app.membership_plans.plan_price) +
                    "+" +
                    formatPrice(app.membership_plans.joining_fee ?? 0) +
                    "(Only Joining Fee)"
                  }
                  label="Price"
                />
                <InfoRow
                  icon={Timer}
                  value={app.membership_plans.membership_duration}
                  label="Duration"
                />
                <InfoRow
                  icon={CalendarDays}
                  value={formatDate(app.created_at)}
                  label="Applied On"
                />
              </div>
            )}
          </div>

          {/* Middle: vertical timeline */}
          <div className="flex-1 min-w-0 border-l border-border pl-5">
            <VerticalTimeline entries={timeline} theme={theme} />
          </div>

          {/* Right: status + actions */}
          <div
            className="w-[190px] flex-shrink-0 flex flex-col gap-2 items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            <StatusBadge status={status} />
            <ApplicationActions app={app} status={status} />
          </div>

          <div className="flex items-center flex-shrink-0 text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {noteText && (
          <div
            className={`flex items-start gap-1.5 rounded-lg border px-3 py-2 ${THEME_CLASSES[theme].box}`}
          >
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p className="text-xs">
              <span className="font-semibold">
                {status === "Rejected" ? "Owner message: " : "Note: "}
              </span>
              {noteText}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Empty state, list wrapper ────────────────────────────────────────────

function EmptyState({ isAll }: { isAll: boolean }) {
  if (isAll) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          No Applications Yet
        </h3>
        <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
          You haven&apos;t applied to any gyms yet. Discover gyms and submit
          your first membership application.
        </p>
        <Button className="bg-primary hover:bg-primary/90" asChild>
          <Link href="/member/discover">Discover Gyms</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardCheck className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">No applications in this category.</p>
    </div>
  );
}

export function ApplicationsList() {
  const [tab, setTab] = useState<DisplayStatus | "All">("All");
  const { data: response, isLoading, isError, refetch } = useMyApplications();

  const applications = response?.success ? response.data : [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: applications.length };
    for (const app of applications) {
      const s = getDisplayStatus(app);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [applications]);

  const filtered = useMemo(() => {
    if (tab === "All") return applications;
    return applications.filter((app) => getDisplayStatus(app) === tab);
  }, [applications, tab]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-border">
          <div className="flex items-center gap-2 pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 flex-shrink-0 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-lg font-semibold">
          We couldn't load your applications
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {response && !response.success
            ? response.error
            : "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
          {STATUS_TABS.map((t) => {
            const style = t.key === "All" ? undefined : STAT_STYLES[t.key];
            const TabIcon = t.key === "All" ? ClipboardList : style?.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                {t.label}
                {counts[t.key] > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      tab === t.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState isAll={tab === "All"} />
        ) : (
          filtered.map((app) => <ApplicationCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  );
}
