"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Dumbbell,
  Eye,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cn,
  formatSessionDate,
  formatTime12h,
  getInitials,
  getTodayDateStr,
  isPastDate,
  isToday,
} from "@/lib/utils";
import Link from "next/link";
import { useMyTrainingSessions } from "@/hooks/queries/member.query";
import { StatCard } from "@/components/StatCard";

export type RawSessionStatus =
  | "Upcoming"
  | "InProgress"
  | "Completed"
  | "Cancelled";
export type DisplayStatus = RawSessionStatus | "Missed";
export type SessionTab = DisplayStatus | "All" | "Today";

export const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Upcoming: {
    label: "Upcoming",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  InProgress: {
    label: "In Progress",
    badgeClass:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  Completed: {
    label: "Completed",
    badgeClass:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
    dotClass: "bg-green-500",
  },
  Missed: {
    label: "Missed",
    badgeClass:
      "bg-red-100 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  Cancelled: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

export const STATUS_TABS: { key: SessionTab; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Today", label: "Today" },
  { key: "Upcoming", label: "Upcoming" },
  { key: "InProgress", label: "In Progress" },
  { key: "Completed", label: "Completed" },
  { key: "Missed", label: "Missed" },
  { key: "Cancelled", label: "Cancelled" },
];

// ── Date/time helpers ────────────────────────────────────────────────────

export function getDisplayStatus(session): DisplayStatus {
  if (session.status === "Upcoming" && isPastDate(session.session_date)) {
    return "Missed";
  }
  return session.status as DisplayStatus;
}

export function matchesTab(session, tab: SessionTab) {
  if (tab === "All") return true;
  if (tab === "Today") return isToday(session.session_date);
  return getDisplayStatus(session) === tab;
}

type SortOption = "soonest" | "latest" | "name" | "trainer";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "soonest", label: "Soonest first" },
  { value: "latest", label: "Latest first" },
  { value: "name", label: "Session name" },
  { value: "trainer", label: "Trainer" },
];

// ── Session card (accordion) ────────────────────────────────────────────

function SessionAccordionCard({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const displayStatus = getDisplayStatus(session);
  const meta = STATUS_CONFIG[displayStatus];
  const trainerName = session.trainers?.full_name ?? "Unassigned trainer";
  const exercises = session.session_exercises ?? [];

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden",
        open
          ? "border-primary/40 shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-md",
      )}
    >
      {/* Was a <button> — swapped to div[role=button] so the View Details
          Link inside can be its own focusable/clickable element without
          nesting interactive elements inside a <button>. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="w-full text-left cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
            <Dumbbell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">
              {session.session_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Avatar className="w-4 h-4">
                <AvatarImage src={session.trainers?.photo_url ?? undefined} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                  {getInitials(trainerName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {trainerName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-32">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">
              {formatSessionDate(session.session_date)}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-24">
            <Clock3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{formatTime12h(session.start_time)}</span>
          </div>

          {session.location && (
            <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-44">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{session.location}</span>
            </div>
          )}

          <div className="flex-shrink-0 ml-auto mr-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
            >
              {meta.label}
            </span>
          </div>

          <div className="hidden md:block">
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                className="flex flex-row gap-1 justify-center items-center"
                href={`/member/sessions/${session.id}`}
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </Link>
            </Button>
          </div>

          <div className="flex-shrink-0 text-muted-foreground">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Compact View Details for small screens, where the row above
            hides it to save space */}
        <div className="sm:hidden px-5 pb-3 -mt-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              className="flex flex-row gap-1 justify-center items-center"
              href={`/member/sessions/${session.id}`}
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </Link>
          </Button>
        </div>
      </div>

      {open && (
        <>
          <Separator />
          <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Session Information
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Duration
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {session.duration_minutes} min
                  </p>
                </div>
                {session.location && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Location
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {session.location}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Trainer
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {trainerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Session Type
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.session_type}
                  </p>
                </div>
                {session.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Notes
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {session.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Exercises
                </h4>
              </div>
              {exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No exercises added to this session.
                </p>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10 text-xs py-2.5">#</TableHead>
                        <TableHead className="text-xs py-2.5">
                          Exercise
                        </TableHead>
                        <TableHead className="text-xs py-2.5 text-center">
                          Sets
                        </TableHead>
                        <TableHead className="text-xs py-2.5 text-center">
                          Reps
                        </TableHead>
                        <TableHead className="text-xs py-2.5 text-center">
                          Weight
                        </TableHead>
                        <TableHead className="text-xs py-2.5 text-center">
                          Rest
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((ex, idx) => (
                          <TableRow
                            key={ex.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="text-xs text-muted-foreground py-2.5">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-foreground py-2.5">
                              {ex.exercises?.name ?? "Unknown exercise"}
                            </TableCell>
                            <TableCell className="text-sm text-foreground py-2.5 text-center">
                              {ex.sets}
                            </TableCell>
                            <TableCell className="text-sm text-primary py-2.5 text-center font-medium">
                              {ex.reps}
                            </TableCell>
                            <TableCell className="text-sm text-foreground py-2.5 text-center">
                              {ex.weight || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground py-2.5 text-center">
                              {ex.rest_seconds ? `${ex.rest_seconds} sec` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <Dumbbell className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? "No sessions found" : "No Workout Sessions Assigned"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Your trainer hasn't assigned any workout sessions yet."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────

export function SessionsPanel() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<SessionTab>("All");
  const [sortBy, setSortBy] = useState<SortOption>("soonest");
  const [trainer, setTrainer] = useState("all");

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyTrainingSessions();

  const sessions = response ? response : [];

  const upcoming = sessions.filter((s) => getDisplayStatus(s) === "Upcoming");
  const completed = sessions.filter((s) => getDisplayStatus(s) === "Completed");

  const exerciseCount = sessions.reduce(
    (sum, s) => sum + (s.session_exercises?.length ?? 0),
    0,
  );
  const nextSession = [...upcoming].sort((a, b) =>
    `${a.session_date}T${a.start_time}`.localeCompare(
      `${b.session_date}T${b.start_time}`,
    ),
  )[0];

  const trainers = useMemo(
    () =>
      Array.from(
        new Set(
          sessions
            .map((s) => s.trainers?.full_name)
            .filter((n): n is string => Boolean(n)),
        ),
      ),
    [sessions],
  );

  const counts = useMemo(() => {
    return Object.fromEntries(
      STATUS_TABS.map(({ key }) => [
        key,
        sessions.filter((s) => matchesTab(s, key)).length,
      ]),
    ) as Record<SessionTab, number>;
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let result = sessions.filter((s) => matchesTab(s, activeTab));

    if (trainer !== "all") {
      result = result.filter((s) => s.trainers?.full_name === trainer);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.session_name.toLowerCase().includes(q) ||
          (s.trainers?.full_name ?? "").toLowerCase().includes(q) ||
          (s.session_exercises ?? []).some((e) =>
            e.exercises?.name?.toLowerCase().includes(q),
          ),
      );
    }

    const key = (s) => `${s.session_date}T${s.start_time}`;
    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "soonest":
          return key(a).localeCompare(key(b));
        case "latest":
          return key(b).localeCompare(key(a));
        case "name":
          return a.session_name.localeCompare(b.session_name);
        case "trainer":
          return (a.trainers?.full_name ?? "").localeCompare(
            b.trainers?.full_name ?? "",
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [sessions, activeTab, trainer, search, sortBy]);

  const activeFilterCount =
    (sortBy !== "soonest" ? 1 : 0) + (trainer !== "all" ? 1 : 0);
  const resetFilters = () => {
    setSortBy("soonest");
    setTrainer("all");
  };
  const resetAll = () => {
    resetFilters();
    setSearch("");
    setActiveTab("All");
  };

  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-3">
            <div className="h-14 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 flex-shrink-0 animate-pulse rounded-full bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Error state — covers both a network/query-level failure (isError)
  // and a request that resolved but reported success: false.
  if (isError || !response) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-lg font-semibold">
          We couldn't load your sessions
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error ? error.message : "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Upcoming Sessions"
          value={upcoming.length}
          subtitle={
            nextSession
              ? `Next: ${nextSession.session_name}`
              : "Nothing scheduled"
          }
        />

        <StatCard
          icon={CheckCircle2}
          iconBg="bg-green-100 dark:bg-green-950/40"
          iconColor="text-green-600"
          title="Completed Sessions"
          value={completed.length}
          subtitle="All time"
        />

        <StatCard
          icon={Flame}
          iconBg="bg-orange-100 dark:bg-orange-950/40"
          iconColor="text-orange-500"
          title="Current Streak"
          value="—"
          subtitle="Coming soon"
        />

        <StatCard
          icon={Dumbbell}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Exercises Assigned"
          value={exerciseCount}
          subtitle="All sessions"
        />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sessions, trainer, or exercise..."
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
                  <X className="size-3.5" />
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
                  <span>Sort & Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Sort & Filter
                  </h4>
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

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Trainer
                    </label>
                    <select
                      value={trainer}
                      onChange={(e) => setTrainer(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All trainers</option>
                      {trainers.map((t) => (
                        <option key={t} value={t}>
                          {t}
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

        {filteredSessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredSessions.map((s) => (
              <SessionAccordionCard key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFilters={
              search.trim().length > 0 ||
              activeTab !== "All" ||
              trainer !== "all"
            }
            onReset={resetAll}
          />
        )}
      </div>
    </>
  );
}
