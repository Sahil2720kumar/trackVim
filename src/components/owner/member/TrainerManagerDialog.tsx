"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Star, X, UserPlus, Users2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  addTrainerAssignment,
  removeTrainerAssignment,
  setPrimaryTrainerAssignment,
} from "@/actions/owner.action";
import type { TrainerList } from "@/services/owner.query";

type AssignedTrainer = {
  assignmentId: string;
  isPrimary: boolean;
  id: string;
  full_name: string | null;
  photo_url?: string | null;
  professional_title?: string | null;
};

export function TrainerManagerDialog({
  memberId,
  gymId,
  assignedTrainers,
  availableTrainers,
}: {
  memberId: string;
  gymId: string;
  assignedTrainers: AssignedTrainer[];
  availableTrainers: TrainerList; // fetched server-side, passed down
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const assignedIds = new Set(assignedTrainers.map((t) => t.id));

  const availableToAdd = useMemo(() => {
    const pool = availableTrainers.filter(
      (t) => !assignedIds.has(t.id) && t.status === "Active",
    );
    if (!query.trim()) return pool;
    const q = query.trim().toLowerCase();
    return pool.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.professional_title?.toLowerCase().includes(q) ||
        (t.specializations ?? []).some((s) => s.toLowerCase().includes(q)),
    );
  }, [availableTrainers, assignedIds, query]);

  const handleAdd = (trainerId: string) => {
    if (isPending) return;
    setPendingId(trainerId);
    startTransition(async () => {
      try {
        const result = await addTrainerAssignment({
          memberId,
          gymId,
          trainerId,
          isPrimary: assignedTrainers.length === 0,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Trainer assigned");
      } catch (error) {
        console.error("Error assigning trainer:", error);
        toast.error("Error assigning trainer. Please try again.");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleRemove = (assignmentId: string) => {
    if (isPending) return;
    setPendingId(assignmentId);
    startTransition(async () => {
      try {
        const result = await removeTrainerAssignment({
          assignmentId,
          gymId,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Trainer removed");
      } catch (error) {
        console.error("Error removing trainer:", error);
        toast.error("Error removing trainer. Please try again.");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleSetPrimary = (assignmentId: string) => {
    if (isPending) return;
    setPendingId(assignmentId);
    startTransition(async () => {
      try {
        const result = await setPrimaryTrainerAssignment({
          assignmentId,
          memberId,
          gymId,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Primary trainer updated");
      } catch (error) {
        console.error("Error setting primary trainer:", error);
        toast.error("Error setting primary trainer. Please try again.");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {assignedTrainers.length ? "Manage Trainers" : "Assign Trainer"}
      </Button>

      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="space-y-1 border-b border-gray-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users2 className="h-4 w-4 text-indigo-600" />
            Manage Trainers
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assign trainers to this member and choose a primary point of
            contact.
          </DialogDescription>
        </DialogHeader>

        {/* Currently assigned */}
        <div className="px-5 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assigned
            </p>
            {assignedTrainers.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {assignedTrainers.length}
              </Badge>
            )}
          </div>

          {assignedTrainers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
              <Users2 className="mx-auto mb-1.5 h-5 w-5 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No trainers assigned yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedTrainers.map((t) => {
                const isPendingRow = isPending && pendingId === t.assignmentId;
                return (
                  <div
                    key={t.assignmentId}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-2.5 transition-colors",
                      t.isPrimary && "border-amber-200 bg-amber-50/40",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage
                          src={t.photo_url ?? undefined}
                          alt={t.full_name ?? ""}
                        />
                        <AvatarFallback className="bg-indigo-50 text-xs font-bold text-indigo-600">
                          {getInitials(t.full_name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium">
                            {t.full_name}
                          </p>
                          {t.isPrimary && (
                            <Star className="h-3 w-3 flex-shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.professional_title ?? "Trainer"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      {isPendingRow ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          {!t.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-indigo-600 opacity-0 transition-opacity hover:bg-indigo-50 hover:text-indigo-700 group-hover:opacity-100"
                              disabled={isPending}
                              onClick={() => handleSetPrimary(t.assignmentId)}
                            >
                              Make primary
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            disabled={isPending}
                            onClick={() => handleRemove(t.assignmentId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Add trainers */}
        <div className="px-5 pb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Add a Trainer
          </p>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, or specialization"
              className={cn(
                "w-full px-3 py-2 pl-9 rounded-lg border transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "border-border bg-background",
                "hover:border-primary",
                "focus:border-primary outline-none",
              )}
            />
          </div>

          <ScrollArea className="h-[220px] pr-3">
            {availableToAdd.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <Search className="mb-2 h-5 w-5 text-gray-300" />
                <p className="text-sm text-muted-foreground">
                  {query.trim()
                    ? "No trainers match your search"
                    : "No more trainers to add"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableToAdd.map((t) => {
                  const isPendingRow = isPending && pendingId === t.id;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-200 p-2.5 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="h-9 w-9 border border-gray-100">
                          <AvatarImage
                            src={t.photo_url ?? undefined}
                            alt={t.full_name ?? ""}
                          />
                          <AvatarFallback className="bg-gray-100 text-xs font-bold text-gray-600">
                            {getInitials(t.full_name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t.full_name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs text-muted-foreground">
                              {t.professional_title ?? "Trainer"}
                            </p>
                            {t.experience_years ? (
                              <span className="text-xs text-muted-foreground">
                                · {t.experience_years} yrs
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 flex-shrink-0 px-2.5 text-xs"
                        disabled={isPending}
                        onClick={() => handleAdd(t.id)}
                      >
                        {isPendingRow ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
