"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Dumbbell,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  CheckCircle2,
  Flame,
  Activity,
  LayoutDashboard,
  CalendarCheck,
  Users,
  CreditCard,
  User,
  MessageSquare,
  BarChart2,
  Settings,
  Headphones,
  Bell,
  RotateCcw,
  Settings2,
  BadgeCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type SessionStatus = "upcoming" | "completed" | "missed" | "cancelled";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  rest: string;
}

interface WorkoutSession {
  id: string;
  name: string;
  trainer: string;
  trainerAvatar?: string;
  date: string;
  dateRaw: string;
  time: string;
  location: string;
  status: SessionStatus;
  duration: string;
  description: string;
  iconColor: string;
  exercises: Exercise[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_SESSIONS: WorkoutSession[] = [
  {
    id: "s1",
    name: "Upper Body Strength",
    trainer: "Rahul Sharma",
    date: "Today, 22 Jul",
    dateRaw: "22 Jul 2026",
    time: "6:00 PM",
    location: "Main Floor - Strength Area",
    status: "upcoming",
    duration: "60 min",
    description: "Upper body compound movements for strength and hypertrophy.",
    iconColor: "bg-primary/10 text-primary",
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        sets: 4,
        reps: 10,
        weight: "60 kg",
        rest: "90 sec",
      },
      {
        id: "e2",
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 12,
        weight: "20 kg",
        rest: "75 sec",
      },
      {
        id: "e3",
        name: "Cable Fly",
        sets: 3,
        reps: 15,
        weight: "—",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Lat Pulldown",
        sets: 3,
        reps: 12,
        weight: "45 kg",
        rest: "75 sec",
      },
      {
        id: "e5",
        name: "Shoulder Press",
        sets: 3,
        reps: 10,
        weight: "15 kg",
        rest: "60 sec",
      },
    ],
  },
  {
    id: "s2",
    name: "Push Day",
    trainer: "Rahul Sharma",
    date: "24 Jul 2026",
    dateRaw: "24 Jul 2026",
    time: "6:00 PM",
    location: "Main Floor - Strength Area",
    status: "upcoming",
    duration: "55 min",
    description: "Chest, shoulders, and triceps focused push day.",
    iconColor: "bg-pink-100 text-pink-600",
    exercises: [
      {
        id: "e1",
        name: "Flat Bench Press",
        sets: 4,
        reps: 8,
        weight: "70 kg",
        rest: "90 sec",
      },
      {
        id: "e2",
        name: "Overhead Press",
        sets: 3,
        reps: 10,
        weight: "40 kg",
        rest: "75 sec",
      },
      {
        id: "e3",
        name: "Lateral Raises",
        sets: 3,
        reps: 15,
        weight: "8 kg",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Tricep Pushdown",
        sets: 3,
        reps: 12,
        weight: "25 kg",
        rest: "60 sec",
      },
    ],
  },
  {
    id: "s3",
    name: "Leg Workout",
    trainer: "Rahul Sharma",
    date: "26 Jul 2026",
    dateRaw: "26 Jul 2026",
    time: "8:00 AM",
    location: "Main Floor - Strength Area",
    status: "upcoming",
    duration: "70 min",
    description: "Quad, hamstring, and glute dominant leg day.",
    iconColor: "bg-green-100 text-green-600",
    exercises: [
      {
        id: "e1",
        name: "Barbell Squat",
        sets: 4,
        reps: 8,
        weight: "80 kg",
        rest: "120 sec",
      },
      {
        id: "e2",
        name: "Romanian Deadlift",
        sets: 3,
        reps: 10,
        weight: "60 kg",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Leg Press",
        sets: 3,
        reps: 12,
        weight: "120 kg",
        rest: "90 sec",
      },
      {
        id: "e4",
        name: "Leg Curl",
        sets: 3,
        reps: 15,
        weight: "35 kg",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Calf Raises",
        sets: 4,
        reps: 20,
        weight: "40 kg",
        rest: "45 sec",
      },
    ],
  },
  {
    id: "s4",
    name: "Pull Workout",
    trainer: "Rahul Sharma",
    date: "18 Jul 2026",
    dateRaw: "18 Jul 2026",
    time: "6:00 PM",
    location: "Main Floor - Strength Area",
    status: "completed",
    duration: "60 min",
    description:
      "Back and biceps focused pull day with compound and isolation work.",
    iconColor: "bg-blue-100 text-blue-600",
    exercises: [
      {
        id: "e1",
        name: "Pull-ups",
        sets: 4,
        reps: 8,
        weight: "BW",
        rest: "90 sec",
      },
      {
        id: "e2",
        name: "Barbell Row",
        sets: 3,
        reps: 10,
        weight: "60 kg",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Seated Cable Row",
        sets: 3,
        reps: 12,
        weight: "50 kg",
        rest: "75 sec",
      },
      {
        id: "e4",
        name: "Face Pulls",
        sets: 3,
        reps: 15,
        weight: "15 kg",
        rest: "60 sec",
      },
      {
        id: "e5",
        name: "Hammer Curls",
        sets: 3,
        reps: 12,
        weight: "14 kg",
        rest: "60 sec",
      },
    ],
  },
  {
    id: "s5",
    name: "Core Training",
    trainer: "Rahul Sharma",
    date: "15 Jul 2026",
    dateRaw: "15 Jul 2026",
    time: "7:00 AM",
    location: "Main Floor - Strength Area",
    status: "missed",
    duration: "45 min",
    description: "Core stability and strength focused session.",
    iconColor: "bg-amber-100 text-amber-600",
    exercises: [
      {
        id: "e1",
        name: "Plank",
        sets: 3,
        reps: 1,
        weight: "—",
        rest: "60 sec",
      },
      {
        id: "e2",
        name: "Cable Crunch",
        sets: 3,
        reps: 15,
        weight: "20 kg",
        rest: "60 sec",
      },
      {
        id: "e3",
        name: "Hanging Leg Raise",
        sets: 3,
        reps: 12,
        weight: "BW",
        rest: "60 sec",
      },
      {
        id: "e4",
        name: "Russian Twists",
        sets: 3,
        reps: 20,
        weight: "10 kg",
        rest: "45 sec",
      },
    ],
  },
  {
    id: "s6",
    name: "Full Body Strength",
    trainer: "Rahul Sharma",
    date: "10 Jul 2026",
    dateRaw: "10 Jul 2026",
    time: "6:00 PM",
    location: "Main Floor - Strength Area",
    status: "cancelled",
    duration: "75 min",
    description: "Full body compound movement session for overall strength.",
    iconColor: "bg-slate-100 text-slate-500",
    exercises: [
      {
        id: "e1",
        name: "Deadlift",
        sets: 4,
        reps: 5,
        weight: "100 kg",
        rest: "180 sec",
      },
      {
        id: "e2",
        name: "Bench Press",
        sets: 3,
        reps: 8,
        weight: "65 kg",
        rest: "90 sec",
      },
      {
        id: "e3",
        name: "Squat",
        sets: 3,
        reps: 8,
        weight: "80 kg",
        rest: "120 sec",
      },
      {
        id: "e4",
        name: "Overhead Press",
        sets: 3,
        reps: 10,
        weight: "40 kg",
        rest: "75 sec",
      },
    ],
  },
];

// ── Nav Items ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Sessions", icon: CalendarCheck, href: "/sessions", active: true },
  { label: "Attendance", icon: CalendarDays, href: "/attendance" },
  { label: "Workouts", icon: Dumbbell, href: "/workouts" },
  { label: "Membership", icon: BadgeCheck, href: "/membership" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Profile", icon: User, href: "/profile" },
  { label: "Messages", icon: MessageSquare, href: "/messages" },
  { label: "Reports", icon: BarChart2, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

// ── Status Helpers ─────────────────────────────────────────────────────────────

const STATUS_META: Record<SessionStatus, { label: string; className: string }> =
  {
    upcoming: {
      label: "Upcoming",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    completed: {
      label: "Completed",
      className:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
    },
    missed: {
      label: "Missed",
      className:
        "bg-red-100 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

const FILTER_BADGES: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
  { label: "Cancelled", value: "cancelled" },
];

// ── Stats ──────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub: string;
}

function StatsCard({ icon, iconBg, label, value, sub }: StatCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium leading-tight">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Session Accordion Card ─────────────────────────────────────────────────────

function SessionAccordionCard({ session }: { session: WorkoutSession }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[session.status];

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden",
        open
          ? "border-primary/40 shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-md",
      )}
    >
      {/* Collapsed header */}
      <button
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${session.iconColor}`}
          >
            <Dumbbell className="w-5 h-5" />
          </div>

          {/* Name + Trainer */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">
              {session.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Avatar className="w-4 h-4">
                <AvatarImage src={session.trainerAvatar} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                  {session.trainer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {session.trainer}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-32">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{session.date}</span>
          </div>

          {/* Time */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-24">
            <Clock3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{session.time}</span>
          </div>

          {/* Location */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0 w-44">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs truncate">{session.location}</span>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0 ml-auto mr-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.className}`}
            >
              {meta.label}
            </span>
          </div>

          {/* Chevron */}
          <div className="flex-shrink-0 text-muted-foreground">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <>
          <Separator />
          <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Left: Session Information */}
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
                    {session.duration}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Location
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {session.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Trainer
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {session.trainer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {session.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Exercises Table */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Exercises
                </h4>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10 text-xs py-2.5">#</TableHead>
                      <TableHead className="text-xs py-2.5">Exercise</TableHead>
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
                    {session.exercises.map((ex, idx) => (
                      <TableRow
                        key={ex.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-xs text-muted-foreground py-2.5">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground py-2.5">
                          {ex.name}
                        </TableCell>
                        <TableCell className="text-sm text-foreground py-2.5 text-center">
                          {ex.sets}
                        </TableCell>
                        <TableCell className="text-sm text-primary py-2.5 text-center font-medium">
                          {ex.reps}
                        </TableCell>
                        <TableCell className="text-sm text-foreground py-2.5 text-center">
                          {ex.weight}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-2.5 text-center">
                          {ex.rest}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// ── Loading Skeletons ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats skeletons */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Search skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
      {/* Filter badge skeletons */}
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Accordion skeletons */}
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="rounded-2xl border border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="h-4 w-36 hidden lg:block" />
            <Skeleton className="h-6 w-20 rounded-full ml-auto" />
            <Skeleton className="h-4 w-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <Dumbbell className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        No Workout Sessions Assigned
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Your trainer hasn&apos;t assigned any workout sessions yet.
      </p>
      <Button variant="outline" onClick={onRefresh} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Refresh
      </Button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [filterSort, setFilterSort] = useState("newest");

  const filteredSessions = useMemo(() => {
    let list = MOCK_SESSIONS;

    // Badge filter
    if (filterBadge !== "all" && filterBadge !== "today") {
      list = list.filter((s) => s.status === filterBadge);
    }
    if (filterBadge === "today") {
      list = list.filter((s) => s.date.toLowerCase().includes("today"));
    }

    // Popover status filter
    if (filterStatus !== "all") {
      list = list.filter((s) => s.status === filterStatus);
    }

    // Popover trainer filter
    if (filterTrainer !== "all") {
      list = list.filter((s) => s.trainer === filterTrainer);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.trainer.toLowerCase().includes(q) ||
          s.exercises.some((e) => e.name.toLowerCase().includes(q)),
      );
    }

    // Sort
    if (filterSort === "oldest") list = [...list].reverse();

    return list;
  }, [search, filterBadge, filterStatus, filterTrainer, filterSort]);

  const stats = useMemo(
    () => ({
      upcoming: MOCK_SESSIONS.filter((s) => s.status === "upcoming").length,
      completed: MOCK_SESSIONS.filter((s) => s.status === "completed").length,
      streak: 7,
      exercises: MOCK_SESSIONS.flatMap((s) => s.exercises).length,
    }),
    [],
  );

  function handleReset() {
    setFilterStatus("all");
    setFilterTrainer("all");
    setFilterSort("newest");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Workout Sessions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View your assigned workout sessions, upcoming schedules, and
            completed workouts.
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatsCard
                icon={<CalendarDays className="w-5 h-5 text-primary" />}
                iconBg="bg-primary/10"
                label="Upcoming Sessions"
                value={stats.upcoming}
                sub="Next: Today, 6:00 PM"
              />
              <StatsCard
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                iconBg="bg-green-100 dark:bg-green-950/40"
                label="Completed Sessions"
                value={stats.completed}
                sub="This Month"
              />
              <StatsCard
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                iconBg="bg-orange-100 dark:bg-orange-950/40"
                label="Current Streak"
                value={stats.streak}
                sub="Days in a row"
              />
              <StatsCard
                icon={<Dumbbell className="w-5 h-5 text-primary" />}
                iconBg="bg-primary/10"
                label="Exercises Completed"
                value={stats.exercises}
                sub="This Month"
              />
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-10 h-11 rounded-xl border-border bg-card focus-visible:ring-primary/30"
                  placeholder="Search sessions, trainer, or exercise..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearch("")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 gap-2 rounded-xl border-border",
                      filterOpen && "border-primary/60 text-primary",
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform",
                        filterOpen && "rotate-180",
                      )}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 p-5 rounded-2xl shadow-lg"
                >
                  <h4 className="font-semibold text-foreground text-sm mb-4">
                    Filter Sessions
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Status
                      </p>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger className="rounded-lg h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="missed">Missed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Trainer
                      </p>
                      <Select
                        value={filterTrainer}
                        onValueChange={setFilterTrainer}
                      >
                        <SelectTrigger className="rounded-lg h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Trainers</SelectItem>
                          <SelectItem value="Rahul Sharma">
                            Rahul Sharma
                          </SelectItem>
                          <SelectItem value="Neha Iyer">Neha Iyer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Date Range
                      </p>
                      <Input
                        className="rounded-lg h-9 text-sm"
                        placeholder="Select range"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Sort By
                      </p>
                      <Select value={filterSort} onValueChange={setFilterSort}>
                        <SelectTrigger className="rounded-lg h-9 text-sm">
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
                        className="flex-1 rounded-lg"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg bg-primary hover:bg-primary/90"
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filter badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTER_BADGES.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setFilterBadge(b.value)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                    filterBadge === b.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Session list */}
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <EmptyState
                  onRefresh={() => {
                    setSearch("");
                    setFilterBadge("all");
                  }}
                />
              ) : (
                filteredSessions.map((s) => (
                  <SessionAccordionCard key={s.id} session={s} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
