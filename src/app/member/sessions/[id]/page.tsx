"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Dumbbell,
  Flame,
  LayoutGrid,
  TrendingUp,
  CheckCheck,
  CheckCircle2,
  Info,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "missed"
  | "cancelled";

interface Exercise {
  id: number;
  name: string;
  equipment: string;
  sets: number;
  reps: number;
  weight: string;
  rest: string;
}

interface Session {
  id: string;
  title: string;
  category: string;
  trainer: { name: string; avatar: string };
  date: string;
  time: string;
  duration: number;
  location: string;
  status: SessionStatus;
  elapsedMin: number;
  totalCalories: number;
  exercises: Exercise[];
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const SESSION: Session = {
  id: "1",
  title: "Upper Body Strength",
  category: "Personal Training",
  trainer: { name: "Rahul Sharma", avatar: "" },
  date: "22 Jul 2026",
  time: "6:00 PM - 7:00 PM",
  duration: 60,
  location: "Main Floor - Strength Area",
  status: "in_progress",
  elapsedMin: 36,
  totalCalories: 400,
  exercises: [
    {
      id: 1,
      name: "Bench Press",
      equipment: "Barbell",
      sets: 4,
      reps: 10,
      weight: "60 kg",
      rest: "90 sec",
    },
    {
      id: 2,
      name: "Incline Dumbbell Press",
      equipment: "Dumbbell",
      sets: 3,
      reps: 12,
      weight: "20 kg",
      rest: "75 sec",
    },
    {
      id: 3,
      name: "Cable Fly",
      equipment: "Cable",
      sets: 3,
      reps: 15,
      weight: "—",
      rest: "60 sec",
    },
    {
      id: 4,
      name: "Lat Pulldown",
      equipment: "Cable",
      sets: 3,
      reps: 12,
      weight: "45 kg",
      rest: "75 sec",
    },
    {
      id: 5,
      name: "Shoulder Press",
      equipment: "Dumbbell",
      sets: 3,
      reps: 10,
      weight: "15 kg",
      rest: "60 sec",
    },
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function initCompleted(exercises: Exercise[]): Record<number, boolean> {
  // Pre-check first 3 to match the "In Progress" demo state from the reference
  return Object.fromEntries(exercises.map((e) => [e.id, e.id <= 3]));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
        <div
          className={cn(
            "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl flex-shrink-0",
            iconBg,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-foreground leading-none truncate">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
          {sub && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">
        {value}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionDetailPage() {
  const session = SESSION;
  const [completed, setCompleted] = useState<Record<number, boolean>>(() =>
    initCompleted(session.exercises),
  );
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );
  const totalCount = session.exercises.length;
  const allDone = completedCount === totalCount;
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalSets = session.exercises.reduce((s, e) => s + e.sets, 0);
  const completedSets = session.exercises
    .filter((e) => completed[e.id])
    .reduce((s, e) => s + e.sets, 0);
  const estCalories = Math.round(
    (completedCount / totalCount) * session.totalCalories,
  );

  function toggle(id: number) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
    setDismissedAlert(false);
  }

  function markAll() {
    if (!allDone) {
      setCompleted(
        Object.fromEntries(session.exercises.map((e) => [e.id, true])),
      );
      setDismissedAlert(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="border-b border-border/60 bg-background pb-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2 sm:gap-3">
            {"Today's Workout Session"}
            <Badge
              className={cn(
                "text-xs font-medium px-2.5 py-0.5",
                allDone
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-primary/10 text-primary border-primary/20",
              )}
              variant="outline"
            >
              {allDone ? "Completed" : "In Progress"}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your progress and complete all exercises in today&apos;s
            session.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Session info card */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                      <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                        {session.title}
                      </h2>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs text-primary border-primary/30 bg-primary/5"
                      >
                        {session.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 gap-1.5 flex items-center self-start sm:self-auto w-fit",
                      allDone
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    <Timer className="h-3 w-3" />
                    {allDone ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                      <AvatarImage src={session.trainer.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {session.trainer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Trainer</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.trainer.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.location}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stat cards row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <StatCard
                iconBg="bg-primary/10"
                icon={<Dumbbell className="h-5 w-5 text-primary" />}
                value={
                  <>
                    <span className="text-primary">{completedCount}</span> /{" "}
                    {totalCount}
                  </>
                }
                label="Exercises Completed"
                sub={`${pct}% of workout completed`}
              />
              <StatCard
                iconBg="bg-green-100"
                icon={<LayoutGrid className="h-5 w-5 text-green-600" />}
                value={
                  <>
                    <span className="text-green-600">{completedSets}</span> /{" "}
                    {totalSets}
                  </>
                }
                label="Total Sets Completed"
                sub={`${pct}% of total sets`}
              />
              <StatCard
                iconBg="bg-orange-100"
                icon={<Clock3 className="h-5 w-5 text-orange-500" />}
                value={
                  <>
                    {session.elapsedMin}{" "}
                    <span className="text-base font-semibold">min</span>
                  </>
                }
                label="Elapsed Time"
                sub={`of ${session.duration} min`}
              />
              <StatCard
                iconBg="bg-red-100"
                icon={<Flame className="h-5 w-5 text-red-500" />}
                value={
                  <>
                    {estCalories}{" "}
                    <span className="text-base font-semibold">kcal</span>
                  </>
                }
                label="Est. Calories Burned"
                sub={`of ${session.totalCalories} kcal`}
              />
            </div>

            {/* Workout progress card */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Workout Progress
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground font-medium">
                    {completedCount} / {totalCount} Exercises Completed
                  </span>
                  <span className="font-semibold text-primary">
                    {pct}% Complete
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="h-3 rounded-full bg-primary/10 [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500"
                />
              </CardContent>
            </Card>

            {/* Completion celebration alert */}
            {allDone && !dismissedAlert && (
              <Alert className="relative border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold pr-6">
                  Workout Completed 🎉
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {"You've completed all exercises in today's session."}
                </AlertDescription>
                <button
                  onClick={() => setDismissedAlert(true)}
                  className="absolute right-3 top-3 text-green-500 hover:text-green-700"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </Alert>
            )}

            {/* Exercise table */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-0.5 p-4 sm:p-5 pb-3 sm:pb-0">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11" />
                      <circle cx="3.5" cy="6.5" r="1" />
                      <circle cx="3.5" cy="12" r="1" />
                      <circle cx="3.5" cy="17.5" r="1" />
                    </svg>
                    <span className="text-sm font-semibold text-foreground">
                      Exercises
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tap the checkbox when you complete an exercise.
                  </p>
                </div>

                {session.exercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-4">
                      <Dumbbell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Exercises Assigned
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your trainer hasn&apos;t added exercises to this session
                      yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tablet / desktop: full table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="mt-3 min-w-[640px]">
                        <TableHeader>
                          <TableRow className="border-t border-border/60">
                            <TableHead className="w-16 pl-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Done
                            </TableHead>
                            <TableHead className="w-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              #
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Exercise
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Equipment
                            </TableHead>
                            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Sets
                            </TableHead>
                            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Reps
                            </TableHead>
                            <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Weight
                            </TableHead>
                            <TableHead className="text-center pr-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Rest
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {session.exercises.map((ex) => {
                            const done = completed[ex.id];
                            return (
                              <TableRow
                                key={ex.id}
                                className={cn(
                                  "transition-colors duration-300 cursor-pointer group",
                                  done
                                    ? "bg-green-50/70 hover:bg-green-50"
                                    : "hover:bg-muted/40",
                                )}
                                onClick={() => toggle(ex.id)}
                              >
                                <TableCell className="pl-5">
                                  <Checkbox
                                    checked={done}
                                    onCheckedChange={() => toggle(ex.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                      "h-5 w-5 rounded-md border-2 transition-all duration-200",
                                      done
                                        ? "border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                        : "border-border/70",
                                    )}
                                    aria-label={`Mark ${ex.name} as completed`}
                                  />
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-sm font-medium",
                                    done
                                      ? "text-muted-foreground/60"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {ex.id}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {done && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                    <span
                                      className={cn(
                                        "text-sm font-semibold transition-all duration-200",
                                        done
                                          ? "text-muted-foreground/60 line-through decoration-muted-foreground/40"
                                          : "text-foreground",
                                      )}
                                    >
                                      {ex.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-sm",
                                    done
                                      ? "text-green-600/70"
                                      : "text-primary/80",
                                  )}
                                >
                                  {ex.equipment}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-center text-sm font-medium",
                                    done
                                      ? "text-muted-foreground/60"
                                      : "text-foreground",
                                  )}
                                >
                                  {ex.sets}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-center text-sm font-medium",
                                    done
                                      ? "text-muted-foreground/60"
                                      : "text-foreground",
                                  )}
                                >
                                  {ex.reps}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-center text-sm font-medium",
                                    done
                                      ? "text-muted-foreground/60"
                                      : "text-foreground",
                                  )}
                                >
                                  {ex.weight}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-center pr-5 text-sm font-medium",
                                    done
                                      ? "text-muted-foreground/60"
                                      : "text-foreground",
                                  )}
                                >
                                  {ex.rest}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile: stacked exercise cards, same tap-to-toggle behavior */}
                    <div className="md:hidden divide-y divide-border/60">
                      {session.exercises.map((ex) => {
                        const done = completed[ex.id];
                        return (
                          <div
                            key={ex.id}
                            onClick={() => toggle(ex.id)}
                            className={cn(
                              "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-300",
                              done ? "bg-green-50/70" : "active:bg-muted/40",
                            )}
                          >
                            <Checkbox
                              checked={done}
                              onCheckedChange={() => toggle(ex.id)}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "h-5 w-5 mt-0.5 rounded-md border-2 flex-shrink-0 transition-all duration-200",
                                done
                                  ? "border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                  : "border-border/70",
                              )}
                              aria-label={`Mark ${ex.name} as completed`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {done && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                )}
                                <span
                                  className={cn(
                                    "text-sm font-semibold truncate",
                                    done
                                      ? "text-muted-foreground/60 line-through decoration-muted-foreground/40"
                                      : "text-foreground",
                                  )}
                                >
                                  {ex.name}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  "text-xs mt-0.5",
                                  done
                                    ? "text-green-600/70"
                                    : "text-primary/80",
                                )}
                              >
                                {ex.equipment}
                              </p>
                              <div
                                className={cn(
                                  "flex flex-wrap gap-x-3 gap-y-0.5 text-xs mt-1",
                                  done
                                    ? "text-muted-foreground/60"
                                    : "text-muted-foreground",
                                )}
                              >
                                <span>{ex.sets} sets</span>
                                <span>{ex.reps} reps</span>
                                <span>{ex.weight}</span>
                                <span>Rest {ex.rest}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <div className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* Mark all button */}
            <Button
              className={cn(
                "w-full gap-2 h-11 font-semibold transition-all duration-300",
                allDone
                  ? "bg-green-600 hover:bg-green-600 text-white cursor-default"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground",
              )}
              onClick={markAll}
              disabled={allDone}
            >
              <CheckCheck className="h-4 w-4" />
              {allDone
                ? "All Exercises Completed"
                : "Mark All Exercises Completed"}
            </Button>
            {!allDone && (
              <p className="text-xs text-center text-muted-foreground -mt-2">
                Mark all remaining exercises as completed
              </p>
            )}

            {/* Workout Summary */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-4 sm:p-5 space-y-1">
                <p className="text-sm font-bold text-foreground mb-3">
                  Workout Summary
                </p>
                <InfoRow
                  label="Exercises Completed"
                  value={
                    <span>
                      <span className="text-primary font-bold">
                        {completedCount}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {totalCount}
                      </span>
                    </span>
                  }
                />
                <Separator className="my-1" />
                <InfoRow
                  label="Completion Percentage"
                  value={<span className="text-primary font-bold">{pct}%</span>}
                />
                <Separator className="my-1" />
                <InfoRow
                  label="Remaining Exercises"
                  value={
                    <span
                      className={cn(
                        "font-bold",
                        totalCount - completedCount > 0
                          ? "text-orange-500"
                          : "text-green-600",
                      )}
                    >
                      {totalCount - completedCount}
                    </span>
                  }
                />
                <Separator className="my-3" />
                <InfoRow
                  label="Session Status"
                  value={
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        allDone
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-primary/10 text-primary border-primary/20",
                      )}
                    >
                      {allDone ? "Completed" : "In Progress"}
                    </Badge>
                  }
                />
                <Separator className="my-1" />
                <InfoRow label="Started At" value="6:00 PM" />
                <Separator className="my-1" />
                <InfoRow label="Ends At" value="7:00 PM" />
                <Separator className="my-1" />
                <InfoRow label="Duration" value={`${session.duration} min`} />
                <Separator className="my-3" />
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                  <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Complete all exercises to mark this session as completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
