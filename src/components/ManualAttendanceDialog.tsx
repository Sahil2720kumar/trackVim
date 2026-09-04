// components/ManualAttendanceDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { manualCheckInOutAction } from "@/actions/owner.action";

interface ManualAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gymId?: string;
  memberId: string;
  memberName: string;
  /** Called after a successful check-in/out so the caller can refresh local state if needed. */
  onSuccess?: (action: "checked_in" | "checked_out" | "already_done") => void;
}

/**
 * Confirmation-style dialog for staff to manually check a member in/out.
 * Defaults the attendance date to today; staff can pick a different date
 * via the calendar popover (e.g. backfilling a missed check-in).
 */
export function ManualAttendanceDialog({
  open,
  onOpenChange,
  gymId,
  memberId,
  memberName,
  onSuccess,
}: ManualAttendanceDialogProps) {
  const [date, setDate] = useState<Date>(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await manualCheckInOutAction({
        memberId,
        attendanceDate: format(date, "yyyy-MM-dd"),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const action = result.data?.action as
        | "checked_in"
        | "checked_out"
        | "already_done";

      const messages = {
        checked_in: `${memberName} checked in`,
        checked_out: `${memberName} checked out`,
        already_done: `${memberName} already checked out for this date`,
      } as const;

      toast.success(messages[action]);
      onSuccess?.(action);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Manual attendance</AlertDialogTitle>
          <AlertDialogDescription>
            Record a check-in or check-out for{" "}
            <span className="font-medium text-foreground">{memberName}</span>.
            Checking in creates a new record for the date below; checking in
            again on the same date checks them out.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <label className="text-sm font-medium mb-1.5 block">
            Attendance date
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selected) => {
                  if (!selected) return;
                  setDate(selected);
                  setCalendarOpen(false);
                }}
                disabled={(d) => d > new Date()}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary hover:bg-primary/90"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Confirm
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Same target-holding convenience hook as useConfirmDialog, scoped to a member row. */
export function useManualAttendanceDialog<T extends { id: string }>() {
  const [target, setTarget] = useState<T | null>(null);

  return {
    target,
    isOpen: target !== null,
    request: (item: T) => setTarget(item),
    close: () => setTarget(null),
  };
}
