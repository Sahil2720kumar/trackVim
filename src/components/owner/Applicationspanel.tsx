"use client";

import { useMemo, useState } from "react";
import { Circle, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Clock3,
  Wallet,
  Receipt,
  BadgeCheck,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MembershipApplication,
  DisplayStatus,
  ApplicationStatus,
} from "@/types";
import {
  STATUS_CONFIG,
  STATUS_TABS,
  TIMELINE_STAGES,
  formatDate,
  formatPrice,
  getActiveStage,
  getCompletedStages,
  getDisplayStatus,
  getInitials,
  type TimelineStage,
} from "@/lib/application-status";

type SortOption = "newest" | "oldest" | "name" | "plan";

// ─── Status timeline ────────────────────────────────────────────────────────

function StatusTimeline({
  displayStatus,
  appliedDate,
  reviewedAt,
  activatedAt,
}: {
  displayStatus: DisplayStatus;
  appliedDate: string;
  reviewedAt?: string | null;
  activatedAt?: string | null;
}) {
  const completed = getCompletedStages(displayStatus);
  const activeStage = getActiveStage(displayStatus);

  const stageDates: Record<TimelineStage, string | undefined> = {
    submitted: appliedDate,
    review: reviewedAt ?? undefined,
    payment: activatedAt ?? undefined,
    active: displayStatus === "Active" ? (activatedAt ?? undefined) : undefined,
  };

  const isRejected = (stage: TimelineStage) =>
    (displayStatus === "Rejected" && stage === "review") ||
    (displayStatus === "PaymentRejected" && stage === "payment");

  return (
    <div className="flex items-start gap-0 min-w-0">
      {TIMELINE_STAGES.map((stage, idx) => {
        const isDone = completed.includes(stage.key);
        const isActive = activeStage === stage.key;
        const rejected = isRejected(stage.key);
        const isLast = idx === TIMELINE_STAGES.length - 1;
        const dateStr = stageDates[stage.key];

        // Pick an icon for every possible visual state — no branch
        // is allowed to fall through with nothing rendered.
        let Icon = Circle;
        let iconClass = "text-muted-foreground/50 size-3";
        if (rejected) {
          Icon = XCircle;
          iconClass = "size-3.5 text-white";
        } else if (isDone) {
          Icon = CheckCircle2;
          iconClass = "size-3.5 text-primary-foreground";
        } else if (isActive) {
          Icon = Loader2;
          iconClass = "size-3.5 text-white animate-spin";
        }

        return (
          <div key={stage.key} className="flex items-start min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "size-6 rounded-full border-2 flex items-center justify-center",
                  isDone && !rejected
                    ? "bg-primary border-primary"
                    : rejected
                      ? "bg-red-500 border-red-500"
                      : isActive
                        ? "bg-orange-400 border-orange-400"
                        : "bg-muted border-border",
                )}
              >
                <Icon className={iconClass} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-center w-14 leading-tight font-medium">
                {stage.label}
              </p>
              {dateStr && (
                <p className="text-[9px] text-muted-foreground/70 mt-0.5 text-center">
                  {formatDate(dateStr)}
                </p>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-10 mt-3 mx-0.5 rounded",
                  isDone && !rejected ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ActionButtons — switch the discriminant to displayStatus
function ActionButtons({
  application,
  displayStatus,
  onApprove,
  onReject,
  onViewDetails,
}: {
  application: MembershipApplication;
  displayStatus: DisplayStatus;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const { id } = application;

  const viewBtn = (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-1.5 text-muted-foreground"
      onClick={(e) => {
        stop(e);
        onViewDetails(id);
      }}
    >
      <Eye data-icon="inline-start" />
      View Details
    </Button>
  );

  if (displayStatus === "Pending") {
    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        <Button
          size="sm"
          className="w-full gap-1.5 bg-primary hover:bg-primary/90"
          onClick={(e) => {
            stop(e);
            onApprove(id);
          }}
        >
          <CheckCircle2 data-icon="inline-start" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-destructive text-destructive hover:bg-destructive/5"
          onClick={(e) => {
            stop(e);
            onReject(id);
          }}
        >
          <XCircle data-icon="inline-start" />
          Reject
        </Button>
        {viewBtn}
      </div>
    );
  }

  if (displayStatus === "Approved" || displayStatus === "PaymentPending") {
    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        <Badge className="w-full justify-center py-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
          <Clock3 className="size-3 mr-1.5" />
          Payment Pending
        </Badge>
        {viewBtn}
      </div>
    );
  }

  if (displayStatus === "PaymentUploaded") {
    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        <Button
          size="sm"
          className="w-full gap-1.5 bg-primary hover:bg-primary/90"
          onClick={(e) => {
            stop(e);
            onViewDetails(id);
          }}
        >
          <Wallet data-icon="inline-start" />
          Verify Payment
        </Button>
        {viewBtn}
      </div>
    );
  }

  if (displayStatus === "PaymentRejected") {
    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        <Badge className="w-full justify-center py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <Receipt className="size-3 mr-1.5" />
          Waiting for New Receipt
        </Badge>
        {viewBtn}
      </div>
    );
  }

  if (displayStatus === "Active") {
    return (
      <div className="flex flex-col gap-2 min-w-[148px]">
        <Badge className="w-full justify-center py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
          <BadgeCheck className="size-3 mr-1.5" />
          Membership Active
        </Badge>
        {viewBtn}
      </div>
    );
  }

  // Rejected / Expired / Cancelled / Frozen — view only
  return <div className="flex flex-col gap-2 min-w-[148px]">{viewBtn}</div>;
}

// ApplicationCard — compute displayStatus once, pass it down
function ApplicationCard({
  application,
  onApprove,
  onReject,
  onViewDetails,
  onClick,
}: {
  application: MembershipApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  onClick: (id: string) => void;
}) {
  const displayStatus = getDisplayStatus(application);
  const cfg = STATUS_CONFIG[displayStatus];
  const member = application.members;
  const plan = application.membership_plans;
  const membership = application.gym_memberships?.[0];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Application by ${member?.full_name ?? "unknown"}, status: ${cfg.label}`}
      className={cn(
        "group bg-card border border-border rounded-2xl px-5 py-4 cursor-pointer",
        "hover:border-primary/40 hover:bg-muted/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      onClick={() => onClick(application.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(application.id);
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Member info block unchanged from previous version */}
        <div className="flex items-start gap-3 lg:w-56 lg:shrink-0">
          <div className="relative shrink-0">
            <Avatar className="size-12 ring-2 ring-border">
              <AvatarImage
                src={member?.photo_url ?? undefined}
                alt={member?.full_name ?? ""}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">
                {getInitials(member?.full_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-400 border-2 border-card" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground leading-tight truncate">
              {member?.full_name ?? "Unknown member"}
            </p>
            <Badge
              variant="secondary"
              className="mt-1 text-[10px] font-semibold px-1.5 py-0 h-5 bg-secondary text-primary border-0"
            >
              {member?.member_code ?? "—"}
            </Badge>
            <div className="mt-2 flex flex-col gap-0.5">
              {member?.contact_email && (
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Mail className="size-3 shrink-0" />
                  <span className="truncate max-w-[140px]">
                    {member.contact_email}
                  </span>
                </p>
              )}
              {member?.contact_phone && (
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Phone className="size-3 shrink-0" />
                  {member.contact_phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="hidden lg:block h-16 shrink-0"
        />

        <div className="lg:w-48 lg:shrink-0 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: plan?.plan_color ?? "#94a3b8" }}
            />
            <p className="font-semibold text-sm text-foreground truncate">
              {plan?.plan_name ?? "No plan"}
            </p>
          </div>
          {plan && (
            <div className="text-sm text-muted-foreground mb-1">
              <span>{plan.duration_months} mo</span>
              <span className="mx-1">&middot;</span>
              <span className="font-semibold text-foreground">
                {formatPrice(Number(plan.plan_price))}
                {plan.duration_months > 1 &&
                  ` for ${plan.duration_months} months`}
              </span>
              {plan.duration_months > 1 && (
                <span className="ml-1 text-[11px]">
                  (~
                  {formatPrice(Number(plan.plan_price) / plan.duration_months)}
                  /mo)
                </span>
              )}
              {plan.joining_fee && Number(plan.joining_fee) > 0 && (
                <span className="ml-1 text-[11px]">
                  + {formatPrice(Number(plan.joining_fee))} joining fee
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5">
            <CalendarDays className="size-3 shrink-0" />
            Applied on {formatDate(application.created_at)}
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="hidden lg:block h-16 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                cfg.badgeClass,
              )}
            >
              <span
                className={cn("size-1.5 rounded-full shrink-0", cfg.dotClass)}
              />
              {cfg.label}
            </span>
            {application.status === "Rejected" &&
              application.rejection_reason && (
                <p className="text-xs text-muted-foreground truncate">
                  {application.rejection_reason}
                </p>
              )}
            {application.message && application.status !== "Rejected" && (
              <p className="text-xs text-muted-foreground truncate">
                {application.message}
              </p>
            )}
          </div>
          <StatusTimeline
            displayStatus={displayStatus}
            appliedDate={application.created_at}
            reviewedAt={application.reviewed_at}
            activatedAt={membership?.activated_at}
          />
        </div>

        <div
          className="flex items-start gap-2 lg:ml-auto lg:shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButtons
            application={application}
            displayStatus={displayStatus}
            onApprove={onApprove}
            onReject={onReject}
            onViewDetails={onViewDetails}
          />
          <ChevronRight className="size-4 text-muted-foreground mt-2 shrink-0 hidden lg:block group-hover:text-primary" />
        </div>
      </div>
    </article>
  );
}
// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Users className="size-10 text-primary/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasSearch ? "No applications found" : "No membership applications yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {hasSearch
          ? "Try adjusting your search or filter to find what you're looking for."
          : "When members request to join your gym, their applications will appear here."}
      </p>
    </div>
  );
}

// ─── Combined panel ───────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Member name" },
  { value: "plan", label: "Membership plan" },
];

interface ApplicationsPanelProps {
  applications: MembershipApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  onClick: (id: string) => void;
}

// ApplicationsPanel — filter/sort/count against displayStatus
export function ApplicationsPanel({
  applications,
  onApprove,
  onReject,
  onViewDetails,
  onClick,
}: ApplicationsPanelProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DisplayStatus | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const withDisplayStatus = useMemo(
    () =>
      applications.map((a) => ({ app: a, displayStatus: getDisplayStatus(a) })),
    [applications],
  );

  const counts = useMemo(() => {
    const base = (s: DisplayStatus | "All") =>
      s === "All"
        ? withDisplayStatus.length
        : withDisplayStatus.filter((x) => x.displayStatus === s).length;
    return Object.fromEntries(
      STATUS_TABS.map(({ key }) => [key, base(key)]),
    ) as Record<DisplayStatus | "All", number>;
  }, [withDisplayStatus]);

  const filteredApplications = useMemo(() => {
    let result = withDisplayStatus;

    if (activeTab !== "All") {
      result = result.filter((x) => x.displayStatus === activeTab);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(({ app }) => {
        const m = app.members;
        return (
          m?.full_name?.toLowerCase().includes(q) ||
          m?.member_code?.toLowerCase().includes(q) ||
          m?.contact_email?.toLowerCase().includes(q) ||
          m?.contact_phone?.includes(q)
        );
      });
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.app.created_at).getTime() -
            new Date(a.app.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.app.created_at).getTime() -
            new Date(b.app.created_at).getTime()
          );
        case "name":
          return (a.app.members?.full_name ?? "").localeCompare(
            b.app.members?.full_name ?? "",
          );
        case "plan":
          return (a.app.membership_plans?.plan_name ?? "").localeCompare(
            b.app.membership_plans?.plan_name ?? "",
          );
        default:
          return 0;
      }
    });

    return sorted.map((x) => x.app);
  }, [withDisplayStatus, activeTab, search, sortBy]);
  const activeFilterCount = sortBy !== "newest" ? 1 : 0;

  const resetFilters = () => setSortBy("newest");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Search + Filter + Status badges ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, member code, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="relative gap-2 px-3 sm:px-4 py-2 h-auto text-sm font-normal shrink-0"
              >
                <SlidersHorizontal className="size-4" />
                <span>Sort</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Sort</h4>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Reset
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {STATUS_TABS.map(({ key, label }) => {
            const count = counts[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[11px] font-bold px-1",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cards ── */}
      {filteredApplications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onApprove={onApprove}
              onReject={onReject}
              onViewDetails={onViewDetails}
              onClick={onClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasSearch={search.trim().length > 0 || activeTab !== "All"}
        />
      )}
    </div>
  );
}
