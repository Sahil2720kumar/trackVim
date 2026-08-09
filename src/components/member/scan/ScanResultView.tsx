import Link from "next/link";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  Home,
  Info,
  LockKeyhole,
  MapPin,
  QrCode,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import type { AttendanceResult } from "@/actions/scan.actions";

type ResultConfig = {
  title: string;
  description: string;
  icon: typeof CircleCheck;
  tone: "success" | "info" | "warning" | "error";
};

function resultConfigFor(result: AttendanceResult): ResultConfig {
  if (result.success) {
    switch (result.action) {
      case "checked_in":
        return {
          title: "You're checked in!",
          description: `Welcome to ${result.gymName}. Your attendance has been recorded.`,
          icon: CircleCheck,
          tone: "success",
        };
      case "checked_out":
        return {
          title: "You're checked out!",
          description: "Your attendance has been completed for today.",
          icon: CircleCheck,
          tone: "success",
        };
      case "already_done":
        return {
          title: "Attendance already completed",
          description:
            "You have already checked in and checked out at this gym today.",
          icon: Info,
          tone: "info",
        };
    }
  }

  // Failure — reason comes from the SQLSTATE code raised by
  // check_in_or_out(), mapped client-side in processAttendance().
  switch (result.reason) {
    case "INVALID_QR":
      return {
        title: "Invalid QR code",
        description: "This QR code is invalid or is no longer active.",
        icon: QrCode,
        tone: "error",
      };
    // NOT_A_MEMBER (no member profile at all) and NO_ACTIVE_MEMBERSHIP
    // (a member, but no membership row at this gym) share one UI slot
    // for now — split these if you want distinct copy/CTAs for each.
    case "NOT_A_MEMBER":
    case "NO_ACTIVE_MEMBERSHIP":
      return {
        title: "No membership found",
        description: "You don't have a membership at this gym.",
        icon: CircleAlert,
        tone: "error",
      };
    case "PAYMENT_PENDING":
      return {
        title: "Payment verification pending",
        description:
          "Your payment is still being verified. You can check in once your membership is activated.",
        icon: Clock3,
        tone: "warning",
      };
    case "PAYMENT_REJECTED":
      return {
        title: "Payment rejected",
        description:
          "Your last payment was rejected. Please re-upload your payment receipt.",
        icon: CircleAlert,
        tone: "error",
      };
    case "MEMBERSHIP_CANCELLED":
      return {
        title: "Membership cancelled",
        description: "Your membership at this gym has been cancelled.",
        icon: CircleAlert,
        tone: "error",
      };
    case "MEMBERSHIP_FROZEN":
      return {
        title: "Membership frozen",
        description:
          "Your membership is currently frozen. Please contact the gym for assistance.",
        icon: CircleAlert,
        tone: "warning",
      };
    case "MEMBERSHIP_EXPIRED":
      return {
        title: "Membership expired",
        description: "Your membership at this gym has expired.",
        icon: CircleAlert,
        tone: "warning",
      };
    case "MEMBERSHIP_NOT_STARTED":
      return {
        title: "Membership hasn't started",
        description: "Your membership at this gym hasn't started yet.",
        icon: CircleAlert,
        tone: "warning",
      };
    default:
      // UNKNOWN — no dedicated slot in the original design, added as a
      // safe fallback so the type stays exhaustive.
      return {
        title: "Something went wrong",
        description: "Please try scanning again in a moment.",
        icon: CircleAlert,
        tone: "error",
      };
  }
}

function StatusIcon({ config }: { config: ResultConfig }) {
  const Icon = config.icon;
  return (
    <div
      className={cn(
        "relative flex size-20 items-center justify-center rounded-full sm:size-24",
        {
          "bg-emerald-100 text-emerald-600": config.tone === "success",
          "bg-blue-100 text-blue-600": config.tone === "info",
          "bg-amber-100 text-amber-600": config.tone === "warning",
          "bg-red-100 text-red-600": config.tone === "error",
        },
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full border-4 bg-card sm:size-16",
          {
            "border-emerald-500": config.tone === "success",
            "border-blue-500": config.tone === "info",
            "border-amber-500": config.tone === "warning",
            "border-red-500": config.tone === "error",
          },
        )}
      >
        <Icon className="size-7 sm:size-8" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-t-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="ml-auto text-right text-sm font-semibold">
        {value}
      </strong>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function AttendanceDetails({
  result,
}: {
  result: Extract<AttendanceResult, { success: true }>;
}) {
  if (result.action === "checked_in") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-card text-emerald-600">
            <MapPin className="size-4" />
          </div>
          <span className="text-sm font-semibold">{result.gymName}</span>
        </div>
        <div className="flex items-center gap-2.5 text-emerald-700">
          <Clock3 className="size-4" />
          <span className="text-sm">Check-in</span>
          <strong className="ml-auto text-lg">
            {formatTime(result.checkIn)}
          </strong>
        </div>
        <p className="mt-2 pl-[26px] text-xs text-muted-foreground">
          {formatFullDate(result.checkIn)}
        </p>
      </div>
    );
  }

  // checked_out or already_done — both carry checkIn + checkOut
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-brand/5 text-brand">
          <MapPin className="size-4" />
        </div>
        <span className="text-sm font-semibold">{result.gymName}</span>
      </div>
      <DetailRow
        icon={Clock3}
        label="Check-in"
        value={formatTime(result.checkIn)}
      />
      {result.checkOut && (
        <DetailRow
          icon={Clock3}
          label="Check-out"
          value={formatTime(result.checkOut)}
        />
      )}
      {result.durationMinutes != null && (
        <DetailRow
          icon={Timer}
          label="Duration"
          value={formatDuration(result.durationMinutes)}
        />
      )}
    </div>
  );
}

export function ScanResultView({ result }: { result: AttendanceResult }) {
  const config = resultConfigFor(result);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center gap-6">
        <BrandMark />

        <Card className="w-full overflow-hidden rounded-3xl border-border/80 bg-card shadow-xl shadow-primary/5">
          <CardContent className="flex flex-col items-center px-5 py-7 sm:px-8 sm:py-9">
            <StatusIcon config={config} />
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight sm:text-[28px]">
              {config.title}
            </h1>
            <p className="mt-2 max-w-md text-center text-sm leading-6 text-muted-foreground sm:text-base">
              {config.description}
            </p>

            {result.success && (
              <div className="mt-6 w-full">
                <AttendanceDetails result={result} />
              </div>
            )}

            {!result.success && (
              <div className="mt-6 flex w-full items-center gap-2.5 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 text-brand" />
                <span>
                  Your account and gym access remain secure. Contact the gym if
                  you need assistance.
                </span>
              </div>
            )}

            <div className="mt-6 flex w-full flex-col gap-2.5">
              <Button
                asChild
                size="lg"
                className="h-10 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/member/home" className="flex flex-row gap-x-1">
                  <Home className="size-4" data-icon="inline-start" />
                  Go to Home
                </Link>
              </Button>
              {result.success && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-10 w-full rounded-xl text-sm font-semibold"
                >
                  <Link
                    href="/member/attendance"
                    className="flex flex-row gap-x-1"
                  >
                    <CalendarDays className="size-4" data-icon="inline-start" />
                    View Attendance
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5" />
          Your attendance is secure and private.
        </p>
      </div>
    </main>
  );
}
