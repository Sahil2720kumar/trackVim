"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Dumbbell,
  LayoutGrid,
  TrendingUp,
  CheckCheck,
  CheckCircle2,
  Info,
  Timer,
  Layers,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressIndicator } from "@/components/ui/progress";
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
import {
  cn,
  formatSessionDate,
  formatTime12h,
  isToday,
  timeToMinutes,
  getInitials,
} from "@/lib/utils";

import {
  toggleSessionExerciseCompletionAction,
  markAllSessionExercisesCompletedAction,
} from "@/actions/member.action";
import { string } from "zod";
import { getDisplayStatus, RawSessionStatus } from "./SessionsPanel";

export function getElapsedMinutes(session: {
  status: RawSessionStatus;
  session_date: string;
  start_time: string;
  duration_minutes: number | null;
}) {
  const cap = session.duration_minutes ?? 0;
  if (session.status === "Completed") return cap;
  if (session.status !== "InProgress") return 0;
  if (!isToday(session.session_date)) return cap; // stale in-progress row from a prior day

  const startMin = timeToMinutes(session.start_time);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  return Math.max(0, Math.min(cap, nowMin - startMin));
}

export function getMuscleGroupsTargeted(
  exercises: { exercises: { muscle_group: string | null } | null }[],
) {
  const groups = new Set(
    exercises
      .map((e) => e.exercises?.muscle_group)
      .filter((g): g is string => !!g),
  );
  return groups.size;
}

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

export function SessionDetailClient({ session }) {
  const [isPending, startTransition] = useTransition();
  const [dismissedAlert, setDismissedAlert] = useState(false);

  // Optimistic local copy so checkboxes respond instantly; the server
  // action + revalidatePath keeps this in sync with the DB on refetch.
  const [exercises, setExercises] = useState(
    () => session.session_exercises ?? [],
  );

  const displayStatus = getDisplayStatus(session);
  const trainerName = session.trainers?.full_name ?? "Unknown Trainer";
  const trainerPhoto = session.trainers?.photo_url ?? "";

  const completedCount = useMemo(
    () => exercises.filter((e) => e.completed).length,
    [exercises],
  );
  const totalCount = exercises.length;
  const allDone = totalCount > 0 && completedCount === totalCount;
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const completedSets = exercises
    .filter((e) => e.completed)
    .reduce((s, e) => s + e.sets, 0);
  const muscleGroups = useMemo(
    () => getMuscleGroupsTargeted(exercises),
    [exercises],
  );
  const elapsedMin = getElapsedMinutes(session);

  function toggle(sessionExerciseId: string, nextCompleted: boolean) {
    // Optimistic update
    setExercises((prev) =>
      prev.map((e) =>
        e.id === sessionExerciseId
          ? {
              ...e,
              completed: nextCompleted,
              completed_at: nextCompleted ? new Date().toISOString() : null,
            }
          : e,
      ),
    );
    setDismissedAlert(false);

    startTransition(async () => {
      try {
        const result = await toggleSessionExerciseCompletionAction(
          sessionExerciseId,
          session.id,
          nextCompleted,
        );
        if (!result.success) {
          toast.error(result.error);
          // roll back the optimistic change
          setExercises((prev) =>
            prev.map((e) =>
              e.id === sessionExerciseId
                ? { ...e, completed: !nextCompleted }
                : e,
            ),
          );
          return;
        }
      } catch (error) {
        console.error("Error updating exercise:", error);
        toast.error("Error updating exercise. Please try again.");
        setExercises((prev) =>
          prev.map((e) =>
            e.id === sessionExerciseId
              ? { ...e, completed: !nextCompleted }
              : e,
          ),
        );
      }
    });
  }

  function markAll() {
    if (allDone || isPending) return;
    const remainingIds = exercises.filter((e) => !e.completed).map((e) => e.id);
    const previous = exercises;

    setExercises((prev) =>
      prev.map((e) => ({
        ...e,
        completed: true,
        completed_at: new Date().toISOString(),
      })),
    );
    setDismissedAlert(false);

    startTransition(async () => {
      try {
        const result = await markAllSessionExercisesCompletedAction(
          session.id,
          remainingIds,
        );
        if (!result.success) {
          toast.error(result.error);
          setExercises(previous);
          return;
        }
        toast.success("All exercises marked complete");
      } catch (error) {
        console.error("Error marking all exercises complete:", error);
        toast.error("Error updating exercises. Please try again.");
        setExercises(previous);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div className="border-b border-border/60 bg-background pb-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2 sm:gap-3">
            {session.session_name}
            <Badge
              className={cn(
                "text-xs font-medium px-2.5 py-0.5",
                allDone
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-primary/10 text-primary border-primary/20",
              )}
              variant="outline"
            >
              {allDone ? "Completed" : displayStatus}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your progress and complete all exercises in this session.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
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
                        {session.session_name}
                      </h2>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs text-primary border-primary/30 bg-primary/5"
                      >
                        {session.session_type}
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
                    {allDone ? "Completed" : displayStatus}
                  </Badge>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                      <AvatarImage src={trainerPhoto} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {getInitials(trainerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Trainer</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {trainerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatSessionDate(session.session_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatTime12h(session.start_time)} -{" "}
                        {formatTime12h(session.end_time)}
                      </p>
                    </div>
                  </div>
                  {session.location && (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.location}
                        </p>
                      </div>
                    </div>
                  )}
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
                    {elapsedMin}{" "}
                    <span className="text-base font-semibold">min</span>
                  </>
                }
                label="Elapsed Time"
                sub={`of ${session.duration_minutes ?? 0} min`}
              />
              <StatCard
                iconBg="bg-purple-100"
                icon={<Layers className="h-5 w-5 text-purple-600" />}
                value={muscleGroups}
                label="Muscle Groups Targeted"
                sub="across this session"
              />
            </div>

            {/* Progress card */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Workout Progress
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    {completedCount} / {totalCount} Exercises Completed
                  </span>

                  <span className="font-semibold text-primary">
                    {pct}% Complete
                  </span>
                </div>

                <Progress
                  value={pct}
                  className="h-3 rounded-full bg-primary/10"
                />
              </CardContent>
            </Card>

            {allDone && !dismissedAlert && (
              <Alert className="relative border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold pr-6">
                  Workout Completed 🎉
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {"You've completed all exercises in this session."}
                </AlertDescription>
                <button
                  onClick={() => setDismissedAlert(true)}
                  className="absolute right-3 top-3 text-green-500 hover:text-green-700"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </Alert>
            )}

            {/* Exercise table */}
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-0.5 p-4 sm:p-5 pb-3 sm:pb-0">
                  <span className="text-sm font-semibold text-foreground">
                    Exercises
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Tap the checkbox when you complete an exercise.
                  </p>
                </div>

                {exercises.length === 0 ? (
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
                          {exercises
                            .slice()
                            .sort((a, b) => a.position - b.position)
                            .map((ex, idx) => {
                              const done = ex.completed;
                              return (
                                <TableRow
                                  key={ex.id}
                                  className={cn(
                                    "transition-colors duration-300 cursor-pointer group",
                                    done
                                      ? "bg-green-50/70 hover:bg-green-50"
                                      : "hover:bg-muted/40",
                                  )}
                                  onClick={() => toggle(ex.id, !done)}
                                >
                                  <TableCell className="pl-5">
                                    <Checkbox
                                      checked={done}
                                      onCheckedChange={(v) =>
                                        toggle(ex.id, !!v)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "h-5 w-5 rounded-md border-2 transition-all duration-200",
                                        done
                                          ? "border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                          : "border-border/70",
                                      )}
                                      aria-label={`Mark ${ex.exercises?.name ?? "exercise"} as completed`}
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
                                    {idx + 1}
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
                                        {ex.exercises?.name ??
                                          "Unknown exercise"}
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
                                    {ex.exercises?.equipment ?? "—"}
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
                                    {ex.weight || "—"}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      "text-center pr-5 text-sm font-medium",
                                      done
                                        ? "text-muted-foreground/60"
                                        : "text-foreground",
                                    )}
                                  >
                                    {ex.rest_seconds
                                      ? `${ex.rest_seconds} sec`
                                      : "—"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden divide-y divide-border/60">
                      {exercises
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((ex) => {
                          const done = ex.completed;
                          return (
                            <div
                              key={ex.id}
                              onClick={() => toggle(ex.id, !done)}
                              className={cn(
                                "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-300",
                                done ? "bg-green-50/70" : "active:bg-muted/40",
                              )}
                            >
                              <Checkbox
                                checked={done}
                                onCheckedChange={(v) => toggle(ex.id, !!v)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "h-5 w-5 mt-0.5 rounded-md border-2 flex-shrink-0 transition-all duration-200",
                                  done
                                    ? "border-green-500 bg-green-500 text-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    : "border-border/70",
                                )}
                                aria-label={`Mark ${ex.exercises?.name ?? "exercise"} as completed`}
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
                                    {ex.exercises?.name ?? "Unknown exercise"}
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
                                  {ex.exercises?.equipment ?? "—"}
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
                                  <span>{ex.weight || "—"}</span>
                                  <span>
                                    Rest{" "}
                                    {ex.rest_seconds
                                      ? `${ex.rest_seconds} sec`
                                      : "—"}
                                  </span>
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

          {/* Right sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <Button
              className={cn(
                "w-full gap-2 h-11 font-semibold transition-all duration-300",
                allDone
                  ? "bg-green-600 hover:bg-green-600 text-white cursor-default"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground",
              )}
              onClick={markAll}
              disabled={allDone || isPending || totalCount === 0}
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
                      {allDone ? "Completed" : displayStatus}
                    </Badge>
                  }
                />
                <Separator className="my-1" />
                <InfoRow
                  label="Started At"
                  value={formatTime12h(session.start_time)}
                />
                <Separator className="my-1" />
                <InfoRow
                  label="Ends At"
                  value={formatTime12h(session.end_time)}
                />
                <Separator className="my-1" />
                <InfoRow
                  label="Duration"
                  value={`${session.duration_minutes ?? 0} min`}
                />
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
