"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import {
  ScanLine,
  CheckCircle2,
  Clock3,
  Calendar,
  Activity,
  Timer,
  CreditCard,
  ChevronRight,
  MessageCircle,
  Dumbbell,
  ShieldAlert,
  TriangleAlert,
  Building2,
  History,
  Crown,
  QrCode,
  DoorOpen,
  DoorClosed,
  Sprout,
  Zap,
  TrendingUp,
  Search,
  ClipboardList,
  Lock,
  Info,
  CameraOff,
  Camera,
  Loader2,
  Settings,
  RotateCw,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  AttendanceView,
  DetailItem,
  MemberHomeState,
  MembershipView,
} from "@/services/scan.query";
import type {
  AttendanceReason,
  AttendanceResult,
} from "@/actions/scan.actions";
import { useMemberStore } from "@/stores/member.store";
import { useMemberHomeState } from "@/hooks/queries/scan.query";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDurationMinutes(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function useElapsedTime(startIso: string) {
  const [elapsedMs, setElapsedMs] = useState(
    () => Date.now() - new Date(startIso).getTime(),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMs(Date.now() - new Date(startIso).getTime());
    }, 1000);
    return () => clearInterval(id);
  }, [startIso]);

  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ---------------------------------------------------------------------------
// Quick links (adjust hrefs to your actual route structure)
// ---------------------------------------------------------------------------

const quickLinks: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    title: "My Sessions",
    description: "View your assigned workouts",
    icon: Dumbbell,
    href: "/sessions",
  },
  {
    title: "Attendance History",
    description: "View your check-in history",
    icon: History,
    href: "/attendance",
  },
  {
    title: "Membership",
    description: "View your membership details",
    icon: CreditCard,
    href: "/membership",
  },
  {
    title: "Messages",
    description: "Chat with your trainer or gym",
    icon: MessageCircle,
    href: "/messages",
  },
];

// ---------------------------------------------------------------------------
// Section eyebrow
// ---------------------------------------------------------------------------

function SectionEyebrow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
      <Icon className="h-4 w-4" />
      {label}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Camera permission handling
// ---------------------------------------------------------------------------

type ScanMode = "check-in" | "check-out";
type ScanStatus = "idle" | "processing" | "success" | "error";

// Human-readable copy for every failure the check_in_or_out() RPC can
// report, keyed off the reason code set in scan.actions.ts.
const ATTENDANCE_REASON_MESSAGES: Record<AttendanceReason, string> = {
  NOT_A_MEMBER:
    "This QR code isn't linked to your account. Make sure you're signed in with the right account.",
  INVALID_QR: "That doesn't look like a valid gym QR code. Try scanning again.",
  NO_ACTIVE_MEMBERSHIP: "You don't have an active membership at this gym yet.",
  PAYMENT_PENDING:
    "Your payment is still being verified — check-in opens once it's approved.",
  PAYMENT_REJECTED:
    "Your last payment was rejected. Please contact the gym to resolve it.",
  MEMBERSHIP_CANCELLED: "Your membership at this gym has been cancelled.",
  MEMBERSHIP_FROZEN:
    "Your membership is currently frozen. Contact the gym to unfreeze it.",
  MEMBERSHIP_EXPIRED:
    "Your membership has expired. Please renew it to check in.",
  MEMBERSHIP_NOT_STARTED: "Your membership hasn't started yet.",
  UNKNOWN: "Something went wrong verifying that code. Please try again.",
};

/**
 * Extracts the attendance token from a scanned QR payload.
 *
 * The gym's posted QR encodes a full URL, e.g.
 *   https://app.trackvim.com/member/scan?token=8f72...a91c
 * but `processAttendance` (and the `check_in_or_out` RPC) only wants the
 * bare token. This never throws — an invalid/non-URL payload just yields
 * `null`, which the caller reports as an INVALID_QR result instead of
 * letting a URL-parsing error bubble up as an uncaught exception.
 */
function extractAttendanceToken(rawValue: string): string | null {
  try {
    const url = new URL(rawValue);
    return url.searchParams.get("token");
  } catch {
    return null;
  }
}

// Mirrors the Permissions API's PermissionState, plus two states it can't
// express: "unsupported" (no Permissions API / camera not queryable — e.g.
// Safari) and "unknown" (still checking).
type CameraPermission =
  | "unknown"
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

/**
 * Tracks live camera permission state via the Permissions API where
 * available, and stays reactive if the user changes it from browser
 * settings while the dialog is open (onchange fires without a reload).
 * Safari doesn't support querying "camera", so it falls back to "prompt"
 * and we rely on getUserMedia's own error to detect a denial.
 */
function useCameraPermission() {
  const [status, setStatus] = useState<CameraPermission>("unknown");

  useEffect(() => {
    let sub: PermissionStatus | null = null;
    let cancelled = false;

    async function check() {
      if (typeof navigator === "undefined" || !navigator.permissions?.query) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        if (cancelled) return;
        sub = result;
        setStatus(result.state as CameraPermission);
        result.onchange = () => setStatus(result.state as CameraPermission);
      } catch {
        if (!cancelled) setStatus("unsupported");
      }
    }

    check();
    return () => {
      cancelled = true;
      if (sub) sub.onchange = null;
    };
  }, []);

  return status;
}

function getCameraSettingsHint() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);

  if (isIOS && isSafari) {
    return "Go to Settings → Safari → Camera on your device, or tap the “aA” icon in the address bar → Website Settings, and set Camera to Allow.";
  }
  if (isSafari) {
    return "Open Safari → Settings → Websites → Camera, find this site, and set it to Allow.";
  }
  if (isFirefox) {
    return "Tap the lock/info icon in the address bar, open Permissions, and allow Camera for this site.";
  }
  // Chrome, Edge, and most Android/Chromium browsers
  return "Tap the lock icon in the address bar → Permissions (or Site settings) → Camera, and set it to Allow.";
}

// ---------------------------------------------------------------------------
// QR Scan Dialog
// ---------------------------------------------------------------------------

function QrScanDialog({
  open,
  mode,
  status,
  result,
  exceptionMessage,
  onOpenChange,
  onDetected,
}: {
  open: boolean;
  mode: ScanMode;
  status: ScanStatus;
  /** The server action's return value once a scan has been processed. */
  result: AttendanceResult | null;
  /** Set only when the server action itself threw (network failure, etc.) — takes precedence over `result` for the error message. */
  exceptionMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onDetected: (rawValue: string) => void;
}) {
  const permission = useCameraPermission();

  // Whether the user has clicked "Allow Camera Access" this session — this
  // is what actually mounts <Scanner> and triggers the real getUserMedia
  // prompt, so we control when that native dialog appears instead of
  // surprising the user the instant the sheet opens.
  const [requested, setRequested] = useState(false);
  // Set directly from getUserMedia's own rejection — needed on browsers
  // (Safari) where the Permissions API can't report "denied" up front.
  const [deniedFromError, setDeniedFromError] = useState(false);
  const [otherCameraError, setOtherCameraError] = useState<string | null>(null);

  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (open) {
      hasFiredRef.current = false;
      setDeniedFromError(false);
      setOtherCameraError(null);
      // If permission is already granted from a previous visit, skip the
      // pre-request screen and go straight to scanning.
      setRequested(permission === "granted");
    } else {
      setRequested(false);
    }
    // Only re-run when the dialog opens/closes, not on every permission tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // A failed attendance result (wrong/expired QR, etc.) shouldn't lock the
  // scanner — let the user try another code without reopening the dialog.
  useEffect(() => {
    if (status === "error") {
      hasFiredRef.current = false;
    }
  }, [status]);

  const handleScan = useCallback(
    (detected: IDetectedBarcode[]) => {
      if (hasFiredRef.current || detected.length === 0) return;
      hasFiredRef.current = true;
      onDetected(detected[0].rawValue);
    },
    [onDetected],
  );

  const handleCameraError = useCallback((err: unknown) => {
    const name = err instanceof Error ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      setDeniedFromError(true);
      return;
    }
    setOtherCameraError(
      err instanceof Error ? err.message : "Unable to access the camera.",
    );
  }, []);

  const isBusy = status === "processing";
  const isSuccess = status === "success" && result?.success === true;
  const isDenied = permission === "denied" || deniedFromError;
  const showPreRequest = !isSuccess && !isDenied && !requested;
  const showScanner = !isSuccess && !isDenied && requested;

  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className="max-w-sm gap-4 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            {mode === "check-in" ? "Scan to Check In" : "Scan to Check Out"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "All set — you're good to go."
              : isDenied
                ? "Camera access is blocked for this site."
                : status === "error"
                  ? "That didn't go through. You can try scanning again."
                  : "Point your camera at the QR code posted at the gym entrance. It will be detected automatically."}
          </DialogDescription>
        </DialogHeader>

        {/* Success — attendance was recorded */}
        {isSuccess && result?.success && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-500/10 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">
                {result.action === "checked_in"
                  ? "Checked in!"
                  : result.action === "checked_out"
                    ? "Checked out!"
                    : "Already recorded for today"}
              </p>
              <p className="text-sm text-muted-foreground">{result.gymName}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="text-sm font-medium text-foreground">
                  {formatTime(result.checkIn)}
                </p>
              </div>
              {result.checkOut && (
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatTime(result.checkOut)}
                  </p>
                </div>
              )}
              {result.durationMinutes != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDurationMinutes(result.durationMinutes)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Denied — permission was refused, either previously or just now */}
        {!isSuccess && isDenied && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted/40 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <CameraOff className="h-7 w-7 text-red-500" />
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">
                Camera permission denied
              </p>
              <p className="text-sm text-muted-foreground">
                {getCameraSettingsHint()}
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setDeniedFromError(false);
                setRequested(true);
              }}
            >
              <RotateCw className="h-4 w-4" />
              I've allowed it — try again
            </Button>
          </div>
        )}

        {/* Pre-request — ask before triggering the native browser prompt */}
        {showPreRequest && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted/40 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">
                Camera access needed
              </p>
              <p className="text-sm text-muted-foreground">
                We use your camera only to read the gym's QR code — nothing is
                recorded or stored.
              </p>
            </div>
            <Button
              className="rounded-xl"
              onClick={() => {
                setOtherCameraError(null);
                setRequested(true);
              }}
            >
              <Camera className="h-4 w-4" />
              Allow Camera Access
            </Button>
          </div>
        )}

        {/* Live scanner */}
        {showScanner && (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
            <Scanner
              onScan={handleScan}
              onError={handleCameraError}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              paused={isBusy}
              components={{ finder: true, torch: true }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover" },
              }}
            />

            {isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">
                  {mode === "check-in" ? "Checking in…" : "Checking out…"}
                </p>
              </div>
            )}
          </div>
        )}

        {otherCameraError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            <CameraOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              {otherCameraError} Check that no other app is using the camera and
              try again.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              {exceptionMessage ??
                (result && !result.success
                  ? ATTENDANCE_REASON_MESSAGES[result.reason]
                  : "Something went wrong. Please try again.")}
            </p>
          </div>
        )}

        {!isSuccess && isDenied && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <Settings className="h-3 w-3" />
            I'll open browser settings and come back
          </button>
        )}

        {!isSuccess && !isDenied && (
          <p className="text-center text-xs text-muted-foreground">
            Having trouble? You can also open your camera app and scan the QR
            code directly.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Onboarding Card (no-gym / pending)
// ---------------------------------------------------------------------------

function OnboardingCard({
  mode,
  application,
}: {
  mode: "no-gym" | "pending";
  application?: { gymName: string; planName: string; appliedOn: string };
}) {
  const isPending = mode === "pending";

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-10 text-center sm:px-8">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/5 sm:h-48 sm:w-48">
        <div className="absolute -left-2 top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-sm">
          {isPending ? (
            <Clock3 className="h-6 w-6 text-primary/70" />
          ) : (
            <Dumbbell className="h-6 w-6 text-primary/70" />
          )}
        </div>
        <div className="absolute -right-3 bottom-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm">
          <Sprout className="h-5 w-5 text-primary/60" />
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-md sm:h-28 sm:w-28">
          {isPending ? (
            <ClipboardList className="h-11 w-11 text-primary" />
          ) : (
            <Building2 className="h-11 w-11 text-primary" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {isPending ? "Application Pending" : "New Member"}
        </Badge>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {isPending
            ? "Membership Request Under Review"
            : "You haven't joined a gym yet"}
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {isPending
            ? "Your membership request is currently under review. Once the gym owner approves your application and activates your membership, you'll be able to check in and track your attendance."
            : "Join a gym to receive workout sessions, track your attendance, and stay connected with your trainer."}
        </p>
      </div>

      {isPending && application && (
        <div className="grid w-full max-w-md grid-cols-1 gap-4 rounded-2xl bg-muted/50 p-5 text-left sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Applied Gym</p>
            <p className="text-sm font-medium text-foreground">
              {application.gymName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applied Plan</p>
            <p className="text-sm font-medium text-foreground">
              {application.planName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Applied On</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(application.appliedOn)}
            </p>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild size="lg" className="w-full rounded-xl">
          <Link
            href={isPending ? "/applications" : "/gyms/discover"}
            className="flex items-center justify-center gap-2"
          >
            {isPending ? (
              <ClipboardList className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {isPending ? "View My Applications" : "Discover Gyms"}
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full rounded-xl"
        >
          <Link
            href={isPending ? "/gyms/discover" : "/applications"}
            className="flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Search className="h-5 w-5" />
            ) : (
              <ClipboardList className="h-5 w-5" />
            )}
            {isPending ? "Discover More Gyms" : "View My Applications"}
          </Link>
        </Button>
      </div>

      {!isPending && (
        <div className="w-full rounded-2xl bg-muted/40 p-5">
          <p className="mb-4 text-sm font-medium text-foreground">
            Why join a gym on TrackVim?
          </p>
          <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Dumbbell, label: "Personalized workout sessions" },
              { icon: Calendar, label: "Track attendance easily" },
              {
                icon: MessageCircle,
                label: "Stay connected with your trainer",
              },
              { icon: CreditCard, label: "Manage membership & payments" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendance cards — split per status so the elapsed-time hook is only
// ever called from the branch that actually needs it (Rules of Hooks).
// ---------------------------------------------------------------------------

function NotCheckedInCard({ onScanClick }: { onScanClick: () => void }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-primary/5 shadow-md">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Not Checked In
          </Badge>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <ScanLine className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  Ready to start your workout?
                </h2>
                <p className="text-muted-foreground">
                  Scan the QR code at the gym entrance to check in and track
                  your workout.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full rounded-xl sm:w-auto sm:px-8"
                onClick={onScanClick}
              >
                <ScanLine className="h-5 w-5" />
                Scan to Check In
              </Button>
              <p className="text-xs text-muted-foreground">
                Opens your camera to scan the QR code posted at the gym
                entrance.
              </p>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorOpen className="absolute -left-6 h-28 w-28 text-primary/10" />
            <DoorOpen className="absolute -right-6 h-28 w-28 -scale-x-100 text-primary/10" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] border-4 border-primary/15 bg-card shadow-md">
              <QrCode className="h-14 w-14 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckedInCard({
  checkIn,
  onScanClick,
}: {
  checkIn: string;
  onScanClick: () => void;
}) {
  const liveDuration = useElapsedTime(checkIn);

  return (
    <Card className="overflow-hidden rounded-2xl border-emerald-500/20 bg-emerald-500/5 shadow-md">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500">
              Checked In
            </Badge>
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active Session
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  You&apos;re checked in!
                </h2>
                <p className="text-muted-foreground">
                  Enjoy your workout. Don&apos;t forget to scan again when you
                  leave.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Check-in Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatTime(checkIn)}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    Duration
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {liveDuration}
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full rounded-xl sm:w-auto sm:px-8"
                onClick={onScanClick}
              >
                <ScanLine className="h-5 w-5" />
                Scan to Check Out
              </Button>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorOpen className="absolute -left-6 h-28 w-28 text-emerald-500/10" />
            <DoorOpen className="absolute -right-6 h-28 w-28 -scale-x-100 text-emerald-500/10" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-emerald-500/10 shadow-md">
              <Activity className="h-14 w-14 text-emerald-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckedOutCard({
  checkIn,
  checkOut,
  durationMinutes,
}: {
  checkIn: string;
  checkOut: string;
  durationMinutes?: number;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-sky-500/20 bg-sky-500/5 shadow-md">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={Activity} label="Today's Check-in Status" />
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-sky-500 px-3 py-1 text-white hover:bg-sky-500">
              Checked Out
            </Badge>
            <Badge
              variant="outline"
              className="hidden rounded-full border-sky-500/30 bg-card px-3 py-1 text-sky-700 dark:text-sky-400 sm:inline-flex"
            >
              Done for today 👋
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  Great workout!
                </h2>
                <p className="text-muted-foreground">
                  You&apos;ve checked out for today. See you tomorrow!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Check-in Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatTime(checkIn)}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Check-out Time
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatTime(checkOut)}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    Total Duration
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {durationMinutes != null
                      ? formatDurationMinutes(durationMinutes)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorClosed className="absolute -left-6 h-28 w-28 text-sky-500/10" />
            <DoorClosed className="absolute -right-6 h-28 w-28 -scale-x-100 text-sky-500/10" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-sky-500/10 shadow-md">
              <Sprout className="h-14 w-14 text-sky-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceCard({
  attendance,
  onScanClick,
}: {
  attendance: AttendanceView;
  onScanClick: (mode: ScanMode) => void;
}) {
  if (attendance.status === "not-checked-in") {
    return <NotCheckedInCard onScanClick={() => onScanClick("check-in")} />;
  }
  if (attendance.status === "checked-in" && attendance.checkIn) {
    return (
      <CheckedInCard
        checkIn={attendance.checkIn}
        onScanClick={() => onScanClick("check-out")}
      />
    );
  }
  if (
    attendance.status === "checked-out" &&
    attendance.checkIn &&
    attendance.checkOut
  ) {
    return (
      <CheckedOutCard
        checkIn={attendance.checkIn}
        checkOut={attendance.checkOut}
        durationMinutes={attendance.durationMinutes}
      />
    );
  }
  return <NotCheckedInCard onScanClick={() => onScanClick("check-in")} />;
}

// ---------------------------------------------------------------------------
// Membership Attention Card — covers every non-active membership status
// ---------------------------------------------------------------------------

type Tone = "amber" | "red" | "sky" | "slate";

const toneStyles: Record<
  Tone,
  {
    cardBorder: string;
    cardBg: string;
    badgeBg: string;
    iconBg: string;
    doorTint: string;
    circleBg: string;
    circleIcon: string;
    noteBorder: string;
    noteBg: string;
    noteText: string;
  }
> = {
  amber: {
    cardBorder: "border-amber-500/20",
    cardBg: "bg-amber-500/5",
    badgeBg: "bg-amber-500",
    iconBg: "bg-amber-500",
    doorTint: "text-amber-500/10",
    circleBg: "bg-amber-500/10",
    circleIcon: "text-amber-500",
    noteBorder: "border-amber-200 dark:border-amber-800",
    noteBg: "bg-amber-50 dark:bg-amber-950/30",
    noteText: "text-amber-700 dark:text-amber-400",
  },
  red: {
    cardBorder: "border-red-500/20",
    cardBg: "bg-red-500/5",
    badgeBg: "bg-red-500",
    iconBg: "bg-red-500",
    doorTint: "text-red-500/10",
    circleBg: "bg-red-500/10",
    circleIcon: "text-red-500",
    noteBorder: "border-red-200 dark:border-red-800",
    noteBg: "bg-red-50 dark:bg-red-950/30",
    noteText: "text-red-700 dark:text-red-400",
  },
  sky: {
    cardBorder: "border-sky-500/20",
    cardBg: "bg-sky-500/5",
    badgeBg: "bg-sky-500",
    iconBg: "bg-sky-500",
    doorTint: "text-sky-500/10",
    circleBg: "bg-sky-500/10",
    circleIcon: "text-sky-500",
    noteBorder: "border-sky-200 dark:border-sky-800",
    noteBg: "bg-sky-50 dark:bg-sky-950/30",
    noteText: "text-sky-700 dark:text-sky-400",
  },
  slate: {
    cardBorder: "border-slate-400/20",
    cardBg: "bg-slate-400/5",
    badgeBg: "bg-slate-500",
    iconBg: "bg-slate-500",
    doorTint: "text-slate-400/10",
    circleBg: "bg-slate-400/10",
    circleIcon: "text-slate-500",
    noteBorder: "border-slate-200 dark:border-slate-800",
    noteBg: "bg-slate-50 dark:bg-slate-900/30",
    noteText: "text-slate-700 dark:text-slate-400",
  },
};

type AttentionKind = Exclude<
  MemberHomeState["kind"],
  "no-gym" | "pending" | "active"
>;

const attentionConfig: Record<
  AttentionKind,
  {
    tone: Tone;
    icon: LucideIcon;
    badgeLabel: string;
    title: string;
    description: (gymName: string) => string;
    note: string;
    primaryAction?: { label: string; icon: LucideIcon; href: string };
    secondaryAction?: { label: string; icon: LucideIcon; href: string };
  }
> = {
  "not-started": {
    tone: "sky",
    icon: Clock3,
    badgeLabel: "Starts Soon",
    title: "Your membership hasn't started yet",
    description: (gym) =>
      `Your membership at ${gym} is confirmed and will begin soon.`,
    note: "Check-in will be available once your membership start date arrives.",
    secondaryAction: {
      label: "View Membership",
      icon: CreditCard,
      href: "/membership",
    },
  },
  expired: {
    tone: "amber",
    icon: TriangleAlert,
    badgeLabel: "Membership Expired",
    title: "Your membership has expired",
    description: () =>
      "You currently don't have an active membership. Please contact the gym owner to renew your membership.",
    note: "Check-in and workout access are paused until your membership is renewed by the gym owner.",
    primaryAction: {
      label: "Contact Gym",
      icon: ShieldAlert,
      href: "/messages",
    },
    secondaryAction: {
      label: "View Membership",
      icon: CreditCard,
      href: "/membership",
    },
  },
  "payment-pending": {
    tone: "sky",
    icon: Clock3,
    badgeLabel: "Payment Pending",
    title: "Payment verification pending",
    description: () =>
      "Your payment is being verified by the gym. You'll be able to check in once it's approved.",
    note: "This usually takes a short while — you'll be notified once your membership is activated.",
    secondaryAction: {
      label: "View Membership",
      icon: CreditCard,
      href: "/membership",
    },
  },
  "payment-rejected": {
    tone: "red",
    icon: TriangleAlert,
    badgeLabel: "Payment Rejected",
    title: "Your last payment was rejected",
    description: () =>
      "Please re-upload your payment receipt or contact the gym for assistance.",
    note: "Check-in is paused until a valid payment is verified.",
    primaryAction: {
      label: "Go to Membership",
      icon: CreditCard,
      href: "/membership",
    },
    secondaryAction: {
      label: "Contact Gym",
      icon: ShieldAlert,
      href: "/messages",
    },
  },
  cancelled: {
    tone: "red",
    icon: TriangleAlert,
    badgeLabel: "Membership Cancelled",
    title: "Your membership has been cancelled",
    description: (gym) => `Your membership at ${gym} has been cancelled.`,
    note: "Contact the gym if you believe this is a mistake, or apply for a new membership.",
    primaryAction: {
      label: "Contact Gym",
      icon: ShieldAlert,
      href: "/messages",
    },
    secondaryAction: {
      label: "Discover Gyms",
      icon: Search,
      href: "/gyms/discover",
    },
  },
  frozen: {
    tone: "slate",
    icon: ShieldAlert,
    badgeLabel: "Membership Frozen",
    title: "Your membership is frozen",
    description: () =>
      "Your membership is temporarily paused. Contact the gym to unfreeze it.",
    note: "Check-in is unavailable while your membership is frozen.",
    primaryAction: {
      label: "Contact Gym",
      icon: ShieldAlert,
      href: "/messages",
    },
    secondaryAction: {
      label: "View Membership",
      icon: CreditCard,
      href: "/membership",
    },
  },
};

function detailIcon(key: string): LucideIcon {
  switch (key) {
    case "plan":
      return Crown;
    default:
      return Calendar;
  }
}

function MembershipAttentionCard({
  kind,
  membership,
  details,
}: {
  kind: AttentionKind;
  membership: MembershipView;
  details: DetailItem[];
}) {
  const config = attentionConfig[kind];
  const tone = toneStyles[config.tone];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl shadow-md",
        tone.cardBorder,
        tone.cardBg,
      )}
    >
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow icon={ShieldAlert} label="Membership Alert" />
          <Badge
            className={cn("rounded-full px-3 py-1 text-white", tone.badgeBg)}
          >
            {config.badgeLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white",
                tone.iconBg,
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-foreground">
                  {config.title}
                </h2>
                <p className="text-muted-foreground">
                  {config.description(membership.gymName)}
                </p>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {details.map((d) => {
                    const DIcon = detailIcon(d.key);
                    const value =
                      d.key.toLowerCase().includes("on") ||
                      d.key === "startDate"
                        ? formatDate(d.value)
                        : d.value;
                    return (
                      <div
                        key={d.key}
                        className="rounded-xl bg-card p-4 shadow-sm"
                      >
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <DIcon className="h-3.5 w-3.5" />
                          {d.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {config.primaryAction && (
                  <Button asChild size="lg" className="rounded-xl sm:px-8">
                    <Link
                      href={config.primaryAction.href}
                      className="flex items-center gap-2"
                    >
                      <config.primaryAction.icon className="h-5 w-5" />
                      {config.primaryAction.label}
                    </Link>
                  </Button>
                )}
                {config.secondaryAction && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-xl sm:px-8"
                  >
                    <Link
                      href={config.secondaryAction.href}
                      className="flex items-center gap-2"
                    >
                      <config.secondaryAction.icon className="h-5 w-5" />
                      {config.secondaryAction.label}
                    </Link>
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "flex items-start gap-1.5 rounded-lg border px-3 py-2",
                  tone.noteBorder,
                  tone.noteBg,
                  tone.noteText,
                )}
              >
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p className="text-xs">{config.note}</p>
              </div>
            </div>
          </div>

          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-2xl lg:flex">
            <DoorClosed
              className={cn("absolute -left-6 h-28 w-28", tone.doorTint)}
            />
            <DoorClosed
              className={cn(
                "absolute -right-6 h-28 w-28 -scale-x-100",
                tone.doorTint,
              )}
            />
            <div
              className={cn(
                "relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] shadow-md",
                tone.circleBg,
              )}
            >
              <Lock className={cn("h-14 w-14", tone.circleIcon)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Membership Card
// ---------------------------------------------------------------------------

function MembershipCard({
  membership,
  statusLabel,
  isPositive,
}: {
  membership: MembershipView;
  statusLabel: string;
  isPositive: boolean;
}) {
  const isExpiringSoon =
    isPositive &&
    membership.daysRemaining != null &&
    membership.daysRemaining <= 30;

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <SectionEyebrow icon={CreditCard} label="Membership Status" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-sm">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">
                  {membership.planName}
                </p>
                <Badge
                  variant={isPositive ? "secondary" : "outline"}
                  className={
                    isPositive
                      ? "rounded-full px-2.5 py-0.5"
                      : "rounded-full border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-700 dark:text-amber-400"
                  }
                >
                  {statusLabel}
                </Badge>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {isPositive
                  ? `Valid until ${formatDate(membership.endDate)}`
                  : `Ended ${formatDate(membership.endDate)}`}
              </p>
            </div>
          </div>

          <Separator className="lg:hidden" />
          <Separator orientation="vertical" className="hidden h-16 lg:block" />

          <div className="flex flex-col items-center gap-1.5 text-center">
            {isPositive && membership.daysRemaining != null ? (
              <>
                <p className="text-xs text-muted-foreground">Days Remaining</p>
                <p className="text-3xl font-bold text-foreground">
                  {membership.daysRemaining}
                </p>
                <p className="text-xs text-muted-foreground">days left</p>
                {isExpiringSoon && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-700 dark:text-amber-400"
                  >
                    Expires Soon
                  </Badge>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-400"
                >
                  {statusLabel}
                </Badge>
              </>
            )}
          </div>

          <Separator className="lg:hidden" />
          <Separator orientation="vertical" className="hidden h-16 lg:block" />

          <div>
            <p className="mb-3 text-sm font-medium text-foreground lg:hidden">
              Membership Details
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(membership.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {membership.durationLabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {membership.planType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick Links
// ---------------------------------------------------------------------------

function QuickLinks() {
  return (
    <div className="space-y-4">
      <SectionEyebrow icon={Zap} label="Quick Access" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} href={link.href}>
              <Card className="group cursor-pointer rounded-2xl border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-3 p-5">
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {link.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Today's Summary
// ---------------------------------------------------------------------------

function TodaySummaryCard({
  attendance,
}: {
  attendance: AttendanceView | null;
}) {
  const workoutDuration =
    attendance?.status === "checked-out" && attendance.durationMinutes != null
      ? formatDurationMinutes(attendance.durationMinutes)
      : attendance?.status === "checked-in"
        ? "In progress"
        : "0 min";

  const sessions =
    attendance?.status === "not-checked-in" || !attendance ? 0 : 1;

  const items: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Timer, label: "Total Workout Time", value: workoutDuration },
    { icon: Dumbbell, label: "Workouts Completed", value: String(sessions) },
    // No calorie-tracking data source exists yet in the schema — showing
    // "—" instead of a fabricated number. Wire this up once you have a
    // real source (e.g. per-session estimates).
    { icon: TrendingUp, label: "Calories Burned", value: "—" },
  ];

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="space-y-5 p-6 sm:p-8">
        <SectionEyebrow icon={TrendingUp} label="Today's Summary" />
        <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-1 items-center gap-3 py-4 first:pt-0 last:pb-0 sm:justify-center sm:py-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MemberHomeClient({
  onScan,
}: {
  onScan?: (token: string) => Promise<AttendanceResult>;
}) {
  const router = useRouter();
  const [scanOpen, setScanOpen] = useState(false);
  const setActiveGym = useMemberStore((state) => state.setActiveGym);
  // scanMode is UI-only — it drives copy like "Scan to Check In" vs.
  // "Scan to Check Out" based on today's attendance state. It is never
  // sent to processAttendance; the RPC alone decides the actual operation.
  const [scanMode, setScanMode] = useState<ScanMode>("check-in");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanResult, setScanResult] = useState<AttendanceResult | null>(null);
  const [scanException, setScanException] = useState<string | null>(null);

  const { data: state, isLoading, isError, refetch } = useMemberHomeState();

  const openScanner = useCallback((mode: ScanMode) => {
    setScanMode(mode);
    setScanStatus("idle");
    setScanResult(null);
    setScanException(null);
    setScanOpen(true);
  }, []);

  const handleDetected = useCallback(
    async (rawValue: string) => {
      setScanStatus("processing");
      setScanResult(null);
      setScanException(null);

      const token = extractAttendanceToken(rawValue);
      if (!token) {
        // Non-URL payload, or a URL missing the token param — report it
        // the same way as any other rejected scan rather than throwing.
        setScanStatus("error");
        setScanResult({ success: false, reason: "INVALID_QR" });
        return;
      }

      try {
        const result = onScan
          ? await onScan(token)
          : ({ success: false, reason: "UNKNOWN" } as AttendanceResult);

        setScanResult(result);

        if (result.success) {
          setScanStatus("success");
          // Let the success state register on screen, then close and pull
          // fresh membership/attendance data from the server.
          window.setTimeout(() => {
            setScanOpen(false);
            setScanStatus("idle");
            router.refresh();
          }, 1400);
        } else {
          setScanStatus("error");
        }
      } catch (err) {
        setScanStatus("error");
        setScanException(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    },
    [onScan, router],
  );

  useEffect(() => {
    if (state?.kind === "active") {
      setActiveGym(state.membership.gymId);
    }
  }, [state, setActiveGym]);

  // Loading state — no data yet, show skeleton placeholders in place of
  // the cards that will eventually render.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  // Error state — the fetch failed or came back malformed. Give the
  // member a way to retry rather than crashing on state.kind below.
  if (isError || !state) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold">
            We couldn't load your membership
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong while fetching your gym and attendance details.
            Please try again.
          </p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (state.kind === "no-gym" || state.kind === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <OnboardingCard
            mode={state.kind === "pending" ? "pending" : "no-gym"}
            application={
              state.kind === "pending" ? state.application : undefined
            }
          />
        </div>
      </div>
    );
  }

  const membershipCardProps =
    state.kind === "active"
      ? { statusLabel: "Active", isPositive: true }
      : {
          statusLabel: attentionConfig[state.kind].badgeLabel,
          isPositive: false,
        };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {state.kind === "active" ? (
          <AttendanceCard
            attendance={state.attendance}
            onScanClick={openScanner}
          />
        ) : (
          <MembershipAttentionCard
            kind={state.kind}
            membership={state.membership}
            details={state.details}
          />
        )}

        <MembershipCard
          membership={state.membership}
          {...membershipCardProps}
        />

        <QuickLinks />

        <TodaySummaryCard
          attendance={state.kind === "active" ? state.attendance : null}
        />
      </div>

      <QrScanDialog
        open={scanOpen}
        mode={scanMode}
        status={scanStatus}
        result={scanResult}
        exceptionMessage={scanException}
        onOpenChange={setScanOpen}
        onDetected={handleDetected}
      />
    </div>
  );
}
