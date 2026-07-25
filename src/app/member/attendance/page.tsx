"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
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
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleX,
  Dumbbell,
  UserRound,
  BarChart3,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AttendanceStatus = "present" | "late" | "missed" | "no_session";

interface AttendanceRecord {
  id: string;
  date: string;
  dateObj: { day: number; month: number; year: number };
  checkIn: string | null;
  checkOut: string | null;
  duration: string | null;
  session: string | null;
  trainer: string | null;
  status: AttendanceStatus;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "1",
    date: "22 Jul 2026",
    dateObj: { day: 22, month: 7, year: 2026 },
    checkIn: "07:02 AM",
    checkOut: "08:15 AM",
    duration: "1h 13m",
    session: "Upper Body Strength",
    trainer: "Rahul Sharma",
    status: "present",
  },
  {
    id: "2",
    date: "21 Jul 2026",
    dateObj: { day: 21, month: 7, year: 2026 },
    checkIn: "07:05 AM",
    checkOut: "08:10 AM",
    duration: "1h 05m",
    session: "Push Day",
    trainer: "Rahul Sharma",
    status: "present",
  },
  {
    id: "3",
    date: "20 Jul 2026",
    dateObj: { day: 20, month: 7, year: 2026 },
    checkIn: null,
    checkOut: null,
    duration: null,
    session: null,
    trainer: null,
    status: "missed",
  },
  {
    id: "4",
    date: "18 Jul 2026",
    dateObj: { day: 18, month: 7, year: 2026 },
    checkIn: "07:15 AM",
    checkOut: "08:20 AM",
    duration: "1h 05m",
    session: "Leg Workout",
    trainer: "Rahul Sharma",
    status: "late",
  },
  {
    id: "5",
    date: "17 Jul 2026",
    dateObj: { day: 17, month: 7, year: 2026 },
    checkIn: "07:00 AM",
    checkOut: "08:05 AM",
    duration: "1h 05m",
    session: "Pull Workout",
    trainer: "Rahul Sharma",
    status: "present",
  },
  {
    id: "6",
    date: "16 Jul 2026",
    dateObj: { day: 16, month: 7, year: 2026 },
    checkIn: null,
    checkOut: null,
    duration: null,
    session: null,
    trainer: null,
    status: "missed",
  },
  {
    id: "7",
    date: "15 Jul 2026",
    dateObj: { day: 15, month: 7, year: 2026 },
    checkIn: "07:10 AM",
    checkOut: "08:25 AM",
    duration: "1h 15m",
    session: "Core Training",
    trainer: "Rahul Sharma",
    status: "present",
  },
  {
    id: "8",
    date: "14 Jul 2026",
    dateObj: { day: 14, month: 7, year: 2026 },
    checkIn: "07:20 AM",
    checkOut: "08:30 AM",
    duration: "1h 10m",
    session: "Cardio Blast",
    trainer: "Rahul Sharma",
    status: "late",
  },
  {
    id: "9",
    date: "11 Jul 2026",
    dateObj: { day: 11, month: 7, year: 2026 },
    checkIn: "07:00 AM",
    checkOut: "08:10 AM",
    duration: "1h 10m",
    session: "Full Body Strength",
    trainer: "Rahul Sharma",
    status: "present",
  },
  {
    id: "10",
    date: "10 Jul 2026",
    dateObj: { day: 10, month: 7, year: 2026 },
    checkIn: "07:05 AM",
    checkOut: "08:00 AM",
    duration: "55m",
    session: "Upper Body Strength",
    trainer: "Rahul Sharma",
    status: "present",
  },
];

// July 2026 calendar data — day: status map (the only month with mock data)
const JULY_STATUS: Record<number, AttendanceStatus> = {
  1: "present",
  2: "present",
  3: "present",
  4: "no_session",
  5: "no_session",
  7: "present",
  8: "present",
  9: "present",
  10: "present",
  11: "present",
  12: "no_session",
  14: "late",
  15: "present",
  16: "missed",
  17: "present",
  18: "late",
  19: "no_session",
  20: "missed",
  21: "present",
  22: "present",
  23: "present",
  24: "present",
  25: "no_session",
  26: "missed",
  28: "present",
  29: "late",
  30: "present",
  31: "present",
};

const INSIGHTS = [
  {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "You've attended 5 consecutive workouts.",
  },
  {
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/5",
    text: "Attendance rate increased by 12% compared to last month.",
  },
  {
    icon: Clock3,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "Average workout duration is 1 hour 8 minutes.",
  },
  {
    icon: Dumbbell,
    color: "text-primary",
    bg: "bg-primary/5",
    text: "Most attended workout: Upper Body Strength.",
  },
  {
    icon: UserRound,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "Most frequent trainer: Rahul Sharma.",
  },
];

const RECORDS_BY_DATE = new Map<string, AttendanceRecord>(
  ATTENDANCE_RECORDS.map((r) => [
    format(
      new Date(r.dateObj.year, r.dateObj.month - 1, r.dateObj.day),
      "yyyy-MM-dd",
    ),
    r,
  ]),
);

// Only July 2026 has mock status data — this keeps the calendar generic for
// any month without inventing data for months we don't have records for.
function getStatusDatesForMonth(month: Date) {
  const buckets: Record<AttendanceStatus, Date[]> = {
    present: [],
    late: [],
    missed: [],
    no_session: [],
  };

  if (month.getFullYear() === 2026 && month.getMonth() === 6) {
    Object.entries(JULY_STATUS).forEach(([day, status]) => {
      buckets[status].push(new Date(2026, 6, Number(day)));
    });
  }

  return buckets;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={cn("rounded-xl p-3 shrink-0", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium mb-0.5">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight tracking-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  if (status === "present")
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 hover:bg-green-100 font-medium">
        Present
      </Badge>
    );
  if (status === "late")
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 font-medium">
        Late
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

// Row tint applied per attendance status, used on the history table.
const ROW_STATUS_BG: Record<AttendanceStatus, string> = {
  present:
    "bg-green-50/60 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20",
  late: "bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20",
  missed:
    "bg-red-50/60 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20",
  no_session: "hover:bg-muted/30",
};

// ─── Table columns ─────────────────────────────────────────────────────────────

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {row.original.date}
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
      row.original.trainer ? (
        <span className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              RS
            </AvatarFallback>
          </Avatar>
          {row.original.trainer}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AttendanceBadge status={row.original.status} />,
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 6, 1));
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2026, 6, 22),
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const FILTER_BADGES = [
    { key: "all", label: "All" },
    { key: "present", label: "Present" },
    { key: "late", label: "Late" },
    { key: "missed", label: "Missed" },
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
  ];

  const statusDates = useMemo(
    () => getStatusDatesForMonth(calendarMonth),
    [calendarMonth],
  );

  const selectedRecord = selectedDate
    ? (RECORDS_BY_DATE.get(format(selectedDate, "yyyy-MM-dd")) ?? null)
    : null;

  // Filter + sort records. Memoized so the `data` array passed to the table
  // keeps a stable reference across unrelated re-renders (e.g. hovering a
  // row) — an unstable reference was resetting the table's pagination.
  const sorted = useMemo(() => {
    const filtered = ATTENDANCE_RECORDS.filter((r) => {
      const matchesStatus =
        activeFilter === "all" ||
        activeFilter === "this_month" ||
        activeFilter === "last_month" ||
        r.status === activeFilter;
      const matchesSearch =
        search === "" ||
        r.date.toLowerCase().includes(search.toLowerCase()) ||
        (r.session ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.trainer ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const da = new Date(
        `${a.dateObj.year}-${a.dateObj.month}-${a.dateObj.day}`,
      );
      const db = new Date(
        `${b.dateObj.year}-${b.dateObj.month}-${b.dateObj.day}`,
      );
      return sortOrder === "newest"
        ? db.getTime() - da.getTime()
        : da.getTime() - db.getTime();
    });
  }, [activeFilter, search, sortOrder]);

  const table = useReactTable({
    data: sorted,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  const handleFilterApply = () => {
    if (statusFilter !== "all") setActiveFilter(statusFilter);
    setFilterOpen(false);
    table.setPageIndex(0);
  };

  const handleFilterReset = () => {
    setStatusFilter("all");
    setSortOrder("newest");
    setActiveFilter("all");
    setFilterOpen(false);
    table.setPageIndex(0);
  };

  const rowCount = sorted.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              My Attendance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your gym attendance history, check-in records, and workout
              consistency.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarCheck}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Total Check-ins"
            value="22"
            sub="This Month"
          />
          <StatCard
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-950/40"
            iconColor="text-green-600"
            label="Attendance Rate"
            value="84%"
            sub="Last 30 Days"
          />
          <StatCard
            icon={Flame}
            iconBg="bg-orange-100 dark:bg-orange-950/40"
            iconColor="text-orange-500"
            label="Current Streak"
            value="5 Days"
            sub="Consecutive Days"
          />
          <StatCard
            icon={Clock3}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Last Visit"
            value="22 Jul 2026"
            sub="07:02 AM — Most Recent Check-in"
          />
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 bg-background border-border/70"
              placeholder="Search by date, session, or trainer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                table.setPageIndex(0);
              }}
            />
          </div>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 h-10 px-4 border-border/70"
              >
                <Filter className="h-4 w-4" />
                Filter
                <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 shadow-lg" align="end">
              <p className="text-sm font-semibold text-foreground mb-3">
                Filter Sessions
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                    Attendance Status
                  </p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                    Trainer
                  </p>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trainers</SelectItem>
                      <SelectItem value="rahul">Rahul Sharma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                    Sort By
                  </p>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleFilterReset}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleFilterApply}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {FILTER_BADGES.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveFilter(f.key);
                table.setPageIndex(0);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                activeFilter === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-foreground border-border/70 hover:border-primary/50 hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Attendance History (full width) */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Attendance History
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Recent membership payments.
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
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
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-12 text-muted-foreground text-sm"
                    >
                      No attendance records found.
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

        {/* Progress + Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Attendance Progress */}
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
                    22 / 26 Days
                  </p>
                  <span className="text-sm font-semibold text-primary">
                    84%
                  </span>
                </div>
                <Progress value={84} className="h-2.5 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Flame,
                    color: "text-orange-500",
                    bg: "bg-orange-100 dark:bg-orange-950/40",
                    label: "Current Streak",
                    value: "5 Days",
                  },
                  {
                    icon: Activity,
                    color: "text-amber-500",
                    bg: "bg-amber-100 dark:bg-amber-950/40",
                    label: "Longest Streak",
                    value: "12 Days",
                  },
                  {
                    icon: CircleX,
                    color: "text-red-500",
                    bg: "bg-red-100 dark:bg-red-950/40",
                    label: "Missed Days",
                    value: "4 Days",
                  },
                  {
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-100 dark:bg-green-950/40",
                    label: "Present Days",
                    value: "22 Days",
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

              {/* Start/End/Renewal dates */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "Start Date", value: "1 Jul 2026" },
                  { label: "End Date", value: "31 Jul 2026" },
                  { label: "Status", value: "Active", green: true },
                ].map(({ label, value, green }) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        green ? "text-green-600" : "text-foreground",
                      )}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              {/* Legend */}
              <div className="flex items-center justify-end gap-3">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
                  Present
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{" "}
                  Late
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
                  present: statusDates.present,
                  late: statusDates.late,
                  missed: statusDates.missed,
                  noSession: statusDates.no_session,
                }}
                modifiersClassNames={{
                  present:
                    "!bg-green-100 !text-green-700 dark:!bg-green-950/50 dark:!text-green-400 rounded-md",
                  late: "!bg-amber-100 !text-amber-700 dark:!bg-amber-950/50 dark:!text-amber-400 rounded-md",
                  missed:
                    "!bg-red-100 !text-red-700 dark:!bg-red-950/50 dark:!text-red-400 rounded-md",
                  noSession: "text-muted-foreground",
                }}
              />

              {/* Selected day detail */}
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
            {INSIGHTS.map(({ icon: Icon, color, bg, text }, i) => (
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
