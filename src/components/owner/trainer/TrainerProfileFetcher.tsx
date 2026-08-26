"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import { TrainerProfileClient } from "@/components/owner/trainer/TrainerProfileClient";
import {
  useTrainerById,
  useTrainerSessionStats,
  useMonthlySessionsForTrainer,
} from "@/hooks/queries/owner.query";

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function TrainerProfileSkeleton() {
  return (
    <>
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function TrainerProfileError({
  message,
  onRetry,
  retrying,
}: {
  message: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col items-center text-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Couldn't load this trainer{message ? `: ${message}` : "."}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

// ─── Main fetcher ───────────────────────────────────────────────────────────

export function TrainerProfileFetcher({ trainerId }: { trainerId: string }) {
  const {
    data: trainerResponse,
    isLoading: trainerLoading,
    isError: trainerError,
    isFetching: trainerFetching,
    error: trainerErrorObj,
    refetch: refetchTrainer,
  } = useTrainerById(trainerId);

  const {
    data: statsResponse,
    isFetching: statsFetching,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useTrainerSessionStats(trainerId);

  const {
    data: monthlySessionsResponse,
    isFetching: monthlyFetching,
    error: monthlyErrorObj,
    refetch: refetchMonthly,
  } = useMonthlySessionsForTrainer(trainerId);

  // Only the core trainer fetch blocks the view.
  const isLoading = trainerLoading;

  const isFetching = trainerFetching || statsFetching || monthlyFetching;

  const refetchAll = () => {
    refetchTrainer();
    refetchStats();
    refetchMonthly();
  };

  if (isLoading) {
    return <TrainerProfileSkeleton />;
  }

  if (trainerError || !trainerResponse) {
    const firstError = trainerErrorObj ?? statsErrorObj ?? monthlyErrorObj;

    return (
      <TrainerProfileError
        message={
          firstError instanceof Error ? firstError.message : "Unknown error"
        }
        onRetry={refetchAll}
        retrying={isFetching}
      />
    );
  }

  const statsResult = statsResponse;
  const monthlyResult = monthlySessionsResponse;

  return (
    <TrainerProfileClient
      trainerId={trainerId}
      initialTrainer={trainerResponse.trainer}
      assignedMembers={trainerResponse.assignedMembers}
      initialStats={
        statsResult ? statsResult : { sessionsThisMonth: 0, attendanceRate: 0 }
      }
      monthlySessions={monthlyResult}
    />
  );
}
