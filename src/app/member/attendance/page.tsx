"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CalendarCheck,
  Clock3,
  Flame,
  TrendingUp,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleX,
  Dumbbell,
  UserRound,
  BarChart3,
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { useMemberAttendanceOverview } from "@/hooks/queries/member.query";
import type { AttendanceHistoryRow } from "@/services/member.query";
import { StatCard } from "@/components/StatCard";
import { useMemberStore } from "@/stores/member.store";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AttendanceStatus = AttendanceHistoryRow["status"]; // "present" | "missed" | "no_session"
type FilterTab = "all" | AttendanceStatus | "this_month" | "last_month";
type SortOption = "newest" | "oldest";

// ─── Filter config ──────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "missed", label: "Missed" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function matchesTab(
  record: AttendanceHistoryRow,
  tab: FilterTab,
  thisMonthKey: string,
  lastMonthKey: string,
) {
  if (tab === "all") return true;
  if (tab === "this_month") return record.date.startsWith(thisMonthKey);
  if (tab === "last_month") return record.date.startsWith(lastMonthKey);
  return record.status === tab;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  if (status === "present")
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 hover:bg-green-100 font-medium">
        Present
      </Badge>
    );
  if (status === "missed")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 hover:bg-red-100 font-medium">
        Missed
      </Badge>
    );
  return (
    <Badge variant="secondary" className="font-medium">
      No Session
    </Badge>
  );
}

const ROW_STATUS_BG: Record<AttendanceStatus, string> = {
  present:
    "bg-green-50/60 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20",
  missed:
    "bg-red-50/60 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20",
  no_session: "hover:bg-muted/30",
};

// ─── Table columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<AttendanceHistoryRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {format(parseISO(row.original.date), "dd MMM yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "checkIn",
    header: "Check-in",
    cell: ({ row }) =>
      row.original.checkIn ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "checkOut",
    header: "Check-out",
    cell: ({ row }) =>
      row.original.checkOut ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) =>
      row.original.duration ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "session",
    header: "Workout Session",
    cell: ({ row }) =>
      row.original.session ? (
        <span className="flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {row.original.session}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "trainer",
    header: "Trainer",
    cell: ({ row }) =>
      row.original.trainer ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AttendanceBadge status={row.original.status} />,
  },
];

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <CalendarCheck className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No attendance records found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Check-ins will show up here once you start attending sessions."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onReset} className="gap-2">
          <CircleX className="w-4 h-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function AttendancePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border/60 shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-full" />

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function AttendancePageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Couldn't load your attendance
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            {message}
          </p>
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const router = useRouter();
  const activeMemberId = useMemberStore((state) => state.activeMemberId);
  const activeGymId = useMemberStore((state) => state.activeGymId);

  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMemberAttendanceOverview();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortOrder, setSortOrder] = useState<SortOption>("newest");
  const [trainer, setTrainer] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const history = result ? result.history : [];
  const stats = result ? result.stats : null;
  const membership = result ? result.membership : null;

  const now = new Date();
  const thisMonthKey = format(now, "yyyy-MM");
  const lastMonthKey = format(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
    "yyyy-MM",
  );

  const trainers = useMemo(
    () =>
      Array.from(
        new Set(
          history.map((r) => r.trainer).filter((t): t is string => Boolean(t)),
        ),
      ),
    [history],
  );

  const counts = useMemo(() => {
    return Object.fromEntries(
      FILTER_TABS.map(({ key }) => [
        key,
        history.filter((r) => matchesTab(r, key, thisMonthKey, lastMonthKey))
          .length,
      ]),
    ) as Record<FilterTab, number>;
  }, [history, thisMonthKey, lastMonthKey]);

  const recordsByDate = useMemo(
    () => new Map(history.map((r) => [r.date, r])),
    [history],
  );

  const statusDatesForMonth = useMemo(() => {
    const present: Date[] = [];
    const missed: Date[] = [];
    for (const r of history) {
      const d = parseISO(r.date);
      if (
        d.getFullYear() !== calendarMonth.getFullYear() ||
        d.getMonth() !== calendarMonth.getMonth()
      )
        continue;
      if (r.status === "present") present.push(d);
      else if (r.status === "missed") missed.push(d);
    }
    return { present, missed };
  }, [history, calendarMonth]);

  const selectedRecord = selectedDate
    ? (recordsByDate.get(format(selectedDate, "yyyy-MM-dd")) ?? null)
    : null;

  const sorted = useMemo(() => {
    const filtered = history.filter((r) => {
      const matchesStatus = matchesTab(
        r,
        activeTab,
        thisMonthKey,
        lastMonthKey,
      );
      const matchesTrainer = trainer === "all" || r.trainer === trainer;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        r.date.includes(q) ||
        (r.session ?? "").toLowerCase().includes(q) ||
        (r.trainer ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesTrainer && matchesSearch;
    });

    return [...filtered].sort((a, b) =>
      sortOrder === "newest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
  }, [
    history,
    activeTab,
    search,
    sortOrder,
    trainer,
    thisMonthKey,
    lastMonthKey,
  ]);

  const table = useReactTable({
    data: sorted,
    columns,
    getRowId: (row) => row.date,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  const activeFilterCount =
    (sortOrder !== "newest" ? 1 : 0) + (trainer !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSortOrder("newest");
    setTrainer("all");
  };

  const resetAll = () => {
    resetFilters();
    setSearch("");
    setActiveTab("all");
    table.setPageIndex(0);
  };

  const hasActiveFilters =
    search.trim().length > 0 || activeTab !== "all" || trainer !== "all";

  const rowCount = sorted.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  // No member/gym context yet — this is a disabled query, not a loading
  // one. Must come before the isPending check or the skeleton spins
  // forever, since a disabled query never leaves the pending state.
  if (!activeMemberId || !activeGymId) {
    return (
      <AttendancePageError
        message="You haven't been enrolled in a gym membership yet. Speak to the front desk to get started."
        onRetry={() => router.push("/member/applications")} // or hide the button entirely
      />
    );
  }

  if (isPending) {
    return <AttendancePageSkeleton />;
  }

  if (isError || !result) {
    const message = isError
      ? error instanceof Error
        ? error.message
        : "Something went wrong."
      : "Something went wrong.";
    return <AttendancePageError message={message} onRetry={() => refetch()} />;
  }

  const s = stats!;
  const monthProgressPct =
    s.daysSoFarThisMonth > 0
      ? Math.round((s.totalCheckInsThisMonth / s.daysSoFarThisMonth) * 100)
      : 0;

  const insights = [
    s.currentStreak > 0
      ? {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 dark:bg-green-950/30",
          text: `You've attended ${s.currentStreak} consecutive day${s.currentStreak > 1 ? "s" : ""}.`,
        }
      : null,
    {
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/5",
      text: `Attendance rate is ${s.attendanceRate}% for your current membership.`,
    },
    s.mostAttendedWorkout
      ? {
          icon: Dumbbell,
          color: "text-primary",
          bg: "bg-primary/5",
          text: `Most attended workout: ${s.mostAttendedWorkout}.`,
        }
      : null,
    s.mostFrequentTrainer
      ? {
          icon: UserRound,
          color: "text-orange-500",
          bg: "bg-orange-50 dark:bg-orange-950/30",
          text: `Most frequent trainer: ${s.mostFrequentTrainer}.`,
        }
      : null,
    {
      icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: `Longest streak so far: ${s.longestStreak} day${s.longestStreak !== 1 ? "s" : ""}.`,
    },
  ].filter((i): i is NonNullable<typeof i> => i !== null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              My Attendance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your gym attendance history, check-in records, and workout
              consistency.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => refetch()}
            disabled={isRefetching}
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefetching && "animate-spin")}
            />
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarCheck}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            title="Total Check-ins"
            value={s.totalCheckInsThisMonth}
            subtitle="This Month"
          />

          <StatCard
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-950/40"
            iconColor="text-green-600"
            title="Attendance Rate"
            value={`${s.attendanceRate}%`}
            subtitle="Current Membership"
          />

          <StatCard
            icon={Flame}
            iconBg="bg-orange-100 dark:bg-orange-950/40"
            iconColor="text-orange-500"
            title="Current Streak"
            value={`${s.currentStreak} Day${s.currentStreak !== 1 ? "s" : ""}`}
            subtitle="Consecutive Days"
          />

          <StatCard
            icon={Clock3}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            title="Last Visit"
            value={
              s.lastVisitDate
                ? format(parseISO(s.lastVisitDate), "dd MMM yyyy")
                : "—"
            }
            subtitle={
              s.lastVisitTime
                ? `${s.lastVisitTime} — Most Recent Check-in`
                : "No visits yet"
            }
          />
        </div>

        {/* Search + Sort & Filter */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by date, session, or trainer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  table.setPageIndex(0);
                }}
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
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as SortOption)
                      }
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

          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {FILTER_TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    table.setPageIndex(0);
                  }}
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
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Attendance History */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Attendance History
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Your check-in and workout session records.
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-border/60">
                      {headerGroup.headers.map((header, i) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "text-xs font-semibold text-muted-foreground",
                            i === 0 && "pl-5 w-[110px]",
                            i === headerGroup.headers.length - 1 && "pr-5",
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <EmptyState
                          hasFilters={hasActiveFilters}
                          onReset={resetAll}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "border-border/40",
                          ROW_STATUS_BG[row.original.status],
                        )}
                      >
                        {row.getVisibleCells().map((cell, i) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "text-sm text-foreground py-3",
                              i === 0 && "pl-5 font-medium",
                              i === row.getVisibleCells().length - 1 && "pr-5",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Showing {rowCount === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, rowCount)} of {rowCount}{" "}
                entries
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from(
                  { length: Math.min(pageCount, 5) },
                  (_, i) => i,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => table.setPageIndex(p)}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-medium transition-all",
                      pageIndex === p
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {p + 1}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Attendance This Month
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-5">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-2xl font-bold text-foreground">
                    {s.totalCheckInsThisMonth} / {s.daysSoFarThisMonth} Days
                  </p>
                  <span className="text-sm font-semibold text-primary">
                    {monthProgressPct}%
                  </span>
                </div>
                <Progress
                  value={monthProgressPct}
                  className="h-2.5 rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Flame,
                    color: "text-orange-500",
                    bg: "bg-orange-100 dark:bg-orange-950/40",
                    label: "Current Streak",
                    value: `${s.currentStreak} Days`,
                  },
                  {
                    icon: Activity,
                    color: "text-amber-500",
                    bg: "bg-amber-100 dark:bg-amber-950/40",
                    label: "Longest Streak",
                    value: `${s.longestStreak} Days`,
                  },
                  {
                    icon: CircleX,
                    color: "text-red-500",
                    bg: "bg-red-100 dark:bg-red-950/40",
                    label: "Missed Days",
                    value: `${s.missedThisMonth} Days`,
                  },
                  {
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-100 dark:bg-green-950/40",
                    label: "Present Days",
                    value: `${s.totalCheckInsThisMonth} Days`,
                  },
                ].map(({ icon: Icon, color, bg, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("rounded-xl p-2.5 shrink-0", bg)}>
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground leading-tight">
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {membership && (
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      Start Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(parseISO(membership.start_date), "d MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      End Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(parseISO(membership.end_date), "d MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      Status
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {membership.status}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-end gap-3">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
                  Present
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{" "}
                  Missed
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                showOutsideDays
                className="w-full p-0"
                modifiers={{
                  present: statusDatesForMonth.present,
                  missed: statusDatesForMonth.missed,
                }}
                modifiersClassNames={{
                  present:
                    "!bg-green-100 !text-green-700 dark:!bg-green-950/50 dark:!text-green-400 rounded-md",
                  missed:
                    "!bg-red-100 !text-red-700 dark:!bg-red-950/50 dark:!text-red-400 rounded-md",
                }}
              />

              {selectedDate && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-[11px] font-semibold text-foreground mb-2">
                    {format(selectedDate, "MMM dd, yyyy")}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      {
                        label: "Check-in",
                        value: selectedRecord?.checkIn ?? "—",
                      },
                      {
                        label: "Check-out",
                        value: selectedRecord?.checkOut ?? "—",
                      },
                      {
                        label: "Duration",
                        value: selectedRecord?.duration ?? "—",
                      },
                      {
                        label: "Workout",
                        value: selectedRecord?.session ?? "—",
                      },
                      ...(selectedRecord?.trainer
                        ? [{ label: "Trainer", value: selectedRecord.trainer }]
                        : []),
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between col-span-2 sm:col-span-1"
                      >
                        <span className="text-[11px] text-muted-foreground">
                          {label}
                        </span>
                        <span className="text-[11px] font-medium text-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Attendance Insights
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {insights.map(({ icon: Icon, color, bg, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("rounded-xl p-2 shrink-0 mt-0.5", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
