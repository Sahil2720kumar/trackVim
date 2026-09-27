"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Clock3,
  Home,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RotateCcw,
  Timer,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/member/scan/BrandMark";
import {
  processPublicAttendance,
  type AttendanceReason,
  type AttendanceResult,
} from "@/actions/processPublicAttendance.action";

type PublicAttendanceClientProps = {
  token?: string;
  isSignedIn: boolean;
  userDisplayName?: string | null;
  initialGymName?: string;
  initialTokenValid: boolean;
};

type ResultConfig = {
  title: string;
  subtitle?: string;
  description: string;
  icon: typeof CircleCheck;
  tone: "success" | "info" | "warning" | "error";
};

function playConfirmationBeep() {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = "sine";
    // Pleasant two-tone chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore audio playback failure gracefully
  }
}

function resultConfigFor(result: AttendanceResult): ResultConfig {
  if (result.success) {
    switch (result.action) {
      case "checked_in":
        return {
          title: "Attendance Marked",
          subtitle: "You're checked in!",
          description: `Welcome to ${result.gymName}. Your attendance has been recorded.`,
          icon: CircleCheck,
          tone: "success",
        };
      case "checked_out":
        return {
          title: "Attendance Marked",
          subtitle: "You're checked out!",
          description: `Thank you for visiting ${result.gymName}. Your attendance has been completed for today.`,
          icon: CircleCheck,
          tone: "success",
        };
      case "already_done":
        return {
          title: "Attendance Already Completed",
          description:
            "Your attendance for today has already been completed.",
          icon: Info,
          tone: "info",
        };
    }
  }

  switch (result.reason) {
    case "INVALID_QR":
      return {
        title: "QR Code Invalid",
        description: "This attendance QR code is invalid or inactive.",
        icon: QrCode,
        tone: "error",
      };
    case "NOT_A_MEMBER":
    case "NO_ACTIVE_MEMBERSHIP":
      return {
        title: "Member Not Found",
        description:
          "We couldn't verify your membership with the information provided. Please check your email or phone number and try again.",
        icon: CircleAlert,
        tone: "error",
      };
    case "PAYMENT_PENDING":
      return {
        title: "Payment Verification Pending",
        description:
          "Your payment is still being verified. You can't mark attendance until your membership is active.",
        icon: Clock3,
        tone: "warning",
      };
    case "PAYMENT_REJECTED":
      return {
        title: "Payment Rejected",
        description:
          "Your last payment was rejected. Please contact the gym or re-upload your payment receipt.",
        icon: CircleAlert,
        tone: "error",
      };
    case "MEMBERSHIP_CANCELLED":
      return {
        title: "Membership Cancelled",
        description: "Your membership at this gym has been cancelled.",
        icon: CircleAlert,
        tone: "error",
      };
    case "MEMBERSHIP_FROZEN":
      return {
        title: "Membership Frozen",
        description:
          "Your membership is currently frozen. Please contact the gym for assistance.",
        icon: CircleAlert,
        tone: "warning",
      };
    case "MEMBERSHIP_EXPIRED":
      return {
        title: "Membership Expired",
        description:
          "Your membership at this gym has expired. Please contact the gym to renew it.",
        icon: CircleAlert,
        tone: "warning",
      };
    case "MEMBERSHIP_NOT_STARTED":
      return {
        title: "Membership Not Started",
        description: "Your membership at this gym hasn't started yet.",
        icon: CircleAlert,
        tone: "warning",
      };
    default:
      return {
        title: "Something Went Wrong",
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

function AttendanceDetails({
  result,
}: {
  result: Extract<AttendanceResult, { success: true }>;
}) {
  if (result.action === "checked_in") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:p-4 text-emerald-900">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-card text-emerald-600 shadow-sm">
            <MapPin className="size-4" />
          </div>
          <span className="text-sm font-semibold">{result.gymName}</span>
        </div>
        <div className="flex items-center gap-2.5 text-emerald-800">
          <Clock3 className="size-4" />
          <span className="text-sm font-medium">Check-in</span>
          <strong className="ml-auto text-lg font-bold">
            {formatTime(result.checkIn)}
          </strong>
        </div>
        <p className="mt-2 pl-[26px] text-xs text-emerald-700/80">
          {formatFullDate(result.checkIn)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3.5 sm:p-4">
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

export function PublicAttendanceClient({
  token,
  isSignedIn,
  userDisplayName,
  initialGymName,
  initialTokenValid,
}: PublicAttendanceClientProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedIdentifier, setHasSavedIdentifier] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);

  // Token-scoped localStorage loading & reset handling
  useEffect(() => {
    setResult(null);
    setGeneralError(null);
    setEmailError(null);
    setPhoneError(null);

    if (!token || isSignedIn) return;

    try {
      const storageKey = `trackvim:attendance:${token}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email || parsed.phone) setHasSavedIdentifier(true);
      } else {
        setEmail("");
        setPhone("");
        setHasSavedIdentifier(false);
      }
    } catch {
      // Gracefully ignore localStorage failure (private browsing/disabled)
    }
  }, [token, isSignedIn]);

  function handleClearSavedDetails() {
    if (!token) return;
    try {
      localStorage.removeItem(`trackvim:attendance:${token}`);
    } catch {}
    setEmail("");
    setPhone("");
    setHasSavedIdentifier(false);
    toast.info("Saved details cleared");
  }

  function validateForm(): boolean {
    setEmailError(null);
    setPhoneError(null);
    setGeneralError(null);

    if (isSignedIn) return true;

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail && !cleanPhone) {
      setGeneralError("Please enter your email or phone number.");
      return false;
    }

    let isValid = true;
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 7) {
      setPhoneError("Please enter a valid phone number.");
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const res = await processPublicAttendance(
        token,
        isSignedIn ? undefined : email.trim(),
        isSignedIn ? undefined : phone.trim(),
      );

      setResult(res);

      if (res.success) {
        // Play audio chime for check-in / check-out / already_done
        playConfirmationBeep();

        // Save email/phone to token-scoped localStorage ONLY on success
        if (!isSignedIn && token) {
          try {
            const storageKey = `trackvim:attendance:${token}`;
            const payload: { email?: string; phone?: string } = {};
            if (email.trim()) payload.email = email.trim();
            if (phone.trim()) payload.phone = phone.trim();
            localStorage.setItem(storageKey, JSON.stringify(payload));
            setHasSavedIdentifier(true);
          } catch {
            // Ignore storage errors
          }
        }
      }
    } catch (err) {
      console.error("[PublicAttendanceClient] submit error", err);
      setResult({
        success: false,
        reason: "UNKNOWN",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // 1. Missing Token State
  if (!token) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <BrandMark />
          <Card className="w-full rounded-3xl border-border/80 bg-card shadow-xl shadow-primary/5">
            <CardContent className="flex flex-col items-center px-5 py-7 sm:px-8 sm:py-9 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <QrCode className="size-8" />
              </div>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Attendance QR Required
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Please scan the TrackVim attendance QR code at the gym entrance to mark your attendance.
              </p>
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

  // 2. Invalid Token State
  if (!initialTokenValid) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <BrandMark />
          <Card className="w-full rounded-3xl border-border/80 bg-card shadow-xl shadow-primary/5">
            <CardContent className="flex flex-col items-center px-5 py-7 sm:px-8 sm:py-9 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                <QrCode className="size-8" />
              </div>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                QR Code Invalid
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                This attendance QR code is invalid or inactive. Please ask gym staff for assistance.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-6 h-10 w-full rounded-xl text-sm font-semibold"
              >
                <RotateCcw className="size-4 mr-2" />
                Try Again
              </Button>
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

  // 3. Result View (Success or Failure)
  if (result) {
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
              {config.subtitle && (
                <p className="mt-1 text-center text-base font-semibold text-emerald-600">
                  {config.subtitle}
                </p>
              )}
              <p className="mt-2 max-w-md text-center text-sm leading-6 text-muted-foreground">
                {config.description}
              </p>

              {result.success && (
                <div className="mt-6 w-full">
                  <AttendanceDetails result={result} />
                </div>
              )}

              {!result.success && (
                <div className="mt-6 flex w-full items-center gap-2.5 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
                  <Info className="size-4 shrink-0 text-brand" />
                  <span>
                    Your information is kept secure. Contact gym staff if you need assistance.
                  </span>
                </div>
              )}

              <div className="mt-6 flex w-full flex-col gap-2.5">
                {result.success ? (
                  <>
                    <Button
                      onClick={() => setResult(null)}
                      size="lg"
                      className="h-11 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand/90"
                    >
                      <RotateCcw className="size-4 mr-2" />
                      Scan Again
                    </Button>
                    {isSignedIn && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-10 w-full rounded-xl text-sm font-semibold"
                      >
                        <Link href="/member/home">
                          <Home className="size-4 mr-2" />
                          Go to Home
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={() => setResult(null)}
                    size="lg"
                    className="h-11 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand/90"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Try Again
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

  // 4. Main Attendance Form View
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <BrandMark />

        <Card className="w-full rounded-3xl border-border/80 bg-card shadow-xl shadow-primary/5">
          <CardContent className="flex flex-col px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col items-center text-center">
              {initialGymName && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                  <MapPin className="size-3.5" />
                  {initialGymName}
                </div>
              )}

              <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">
                Mark Your Attendance
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                {isSignedIn
                  ? "Confirm your attendance using your signed-in account."
                  : "Enter your email or phone number to check in or check out."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              {/* Signed-In Flow */}
              {isSignedIn ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <UserCheck className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      You're signed in as
                    </span>
                    <strong className="text-sm font-semibold truncate text-foreground">
                      {userDisplayName || "TrackVim Member"}
                    </strong>
                  </div>
                </div>
              ) : (
                /* Signed-Out Flow */
                <div className="flex flex-col gap-4">
                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(null);
                          setGeneralError(null);
                        }}
                        className={cn(
                          "h-11 pl-10 rounded-xl text-sm transition-colors",
                          emailError && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs font-medium text-destructive">{emailError}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative my-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/80" />
                    </div>
                    <span className="relative bg-card px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      OR
                    </span>
                  </div>

                  {/* Phone Field */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError(null);
                          setGeneralError(null);
                        }}
                        className={cn(
                          "h-11 pl-10 rounded-xl text-sm transition-colors",
                          phoneError && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs font-medium text-destructive">{phoneError}</p>
                    )}
                  </div>

                  {hasSavedIdentifier && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>Remembered for this gym code</span>
                      <button
                        type="button"
                        onClick={handleClearSavedDetails}
                        className="text-brand hover:underline font-medium focus:outline-none"
                      >
                        Clear saved details
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* General Error Banner */}
              {generalError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  <CircleAlert className="size-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Primary Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Marking attendance...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Mark Attendance
                  </>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {isSignedIn
                ? "Your attendance will be recorded for this gym."
                : "Your information is only used to verify your gym membership."}
            </p>
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
