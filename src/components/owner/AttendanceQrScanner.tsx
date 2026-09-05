"use client";

import { useState, useCallback, useRef, useTransition, useMemo } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Camera,
  RefreshCw,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/application-status";
import {
  scanMembershipQrAction,
  manualCheckInOutAction,
} from "@/actions/owner.action";
import { Membership } from "@/services/owner.query";
import { toast } from "sonner";
import { format } from "date-fns";

type AttendanceScanState =
  | { type: "ready" }
  | { type: "scanning" }
  | {
      type: "member_found";
      member: {
        id?: string;
        fullName: string;
        photoUrl: string | null;
        memberCode: string;
        planName: string;
        status: string;
        checkInTime?: string;
        checkOutTime?: string;
        attendanceStatus?: string;
      };
    }
  | { type: "invalid_qr"; message: string }
  | { type: "expired"; memberName?: string; validUntil?: string }
  | { type: "already_marked"; memberName?: string; timeRecorded?: string }
  | { type: "camera_denied" };

interface AttendanceQrScannerProps {
  gymId: string;
  memberships: Membership[];
}

// Shape returned by the scan_membership_qr Postgres function itself
// (the *inner* payload — one level below scanMembershipQrAction's own
// {success, data} / {success, error} wrapper).
type ScanRpcResult = {
  success: boolean;
  // failure fields
  reason?:
    | "invalid_token"
    | "qr_inactive"
    | "wrong_gym"
    | "membership_not_active";
  membership_status?: string;
  // success fields
  action?: "check_in" | "check_out" | "already_completed";
  member_id?: string;
  full_name?: string;
  photo_url?: string | null;
  member_code?: string;
  plan_name?: string;
  status?: string;
  check_in?: string;
  check_out?: string;
  end_date?: string;
};

const formatTime = (value?: string | null) => {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return format(date, "h:mm a");
};

const formatDay = (value?: string | null) =>
  value ? format(new Date(value), "d MMM yyyy") : "—";

export function AttendanceQrScanner({
  gymId,
  memberships,
}: AttendanceQrScannerProps) {
  const [state, setState] = useState<AttendanceScanState>({ type: "ready" });
  const [isPending, startTransition] = useTransition();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isProcessingRef = useRef(false);

  // Filter members for manual search modal
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;
    const q = searchQuery.toLowerCase();
    return memberships.filter((m) => {
      const member = m.members;
      if (!member) return false;
      return (
        member.full_name?.toLowerCase().includes(q) ||
        member.member_code?.toLowerCase().includes(q) ||
        member.contact_phone?.toLowerCase().includes(q) ||
        member.contact_email?.toLowerCase().includes(q)
      );
    });
  }, [memberships, searchQuery]);

  const resetToScan = useCallback(() => {
    isProcessingRef.current = false;
    setState({ type: "ready" });
  }, []);

  // Handle QR detection
  const handleQrScan = useCallback(
    (detected: Array<{ rawValue: string }> | string) => {
      let rawToken = "";
      if (typeof detected === "string") {
        rawToken = detected;
      } else if (Array.isArray(detected) && detected.length > 0) {
        rawToken = detected[0]?.rawValue || "";
      }

      if (!rawToken || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setState({ type: "scanning" });

      startTransition(async () => {
        try {
          const res = await scanMembershipQrAction(rawToken, gymId);

          // Top-level failure = the Supabase RPC call itself errored
          // (network/db exception), not a business-logic rejection.
          if (!res.success) {
            setState({
              type: "invalid_qr",
              message:
                res.error || "Failed to verify QR code. Please try again.",
            });
            return;
          }

          const data = res.data as ScanRpcResult | null;

          if (!data) {
            setState({
              type: "invalid_qr",
              message: "Invalid or unrecognized QR code",
            });
            return;
          }

          // Business-logic rejection returned by scan_membership_qr itself
          if (!data.success) {
            switch (data.reason) {
              case "membership_not_active":
                setState({
                  type: "expired",
                  memberName: data.full_name,
                  validUntil: formatDay(data.end_date),
                });
                return;

              case "wrong_gym":
                setState({
                  type: "invalid_qr",
                  message: "This membership card belongs to a different gym.",
                });
                return;

              case "qr_inactive":
                setState({
                  type: "invalid_qr",
                  message: "This membership card has been deactivated.",
                });
                return;

              case "invalid_token":
              default:
                setState({
                  type: "invalid_qr",
                  message: "This QR code could not be verified.",
                });
                return;
            }
          }

          // Business-logic success — branch on the actual action taken
          const member = {
            id: data.member_id,
            fullName: data.full_name || "Member",
            photoUrl: data.photo_url || null,
            memberCode: data.member_code || "—",
            planName: data.plan_name || "Membership Plan",
            status: data.status || "Active",
          };

          if (data.action === "already_completed") {
            setState({
              type: "already_marked",
              memberName: member.fullName,
              timeRecorded: formatTime(data.check_out ?? data.check_in),
            });
            return;
          }

          if (data.action === "check_out") {
            setState({
              type: "member_found",
              member: {
                ...member,
                checkInTime: formatTime(data.check_out),
                attendanceStatus: "Checked Out",
              },
            });
            toast.success(`${member.fullName} checked out`);
            return;
          }

          // action === "check_in"
          setState({
            type: "member_found",
            member: {
              ...member,
              checkInTime: formatTime(data.check_in),
              attendanceStatus: "Checked In",
            },
          });
          toast.success(`${member.fullName} checked in`);
        } catch {
          setState({
            type: "invalid_qr",
            message: "Failed to verify QR code. Please try again.",
          });
        }
      });
    },
    [gymId],
  );

  // Handle Manual Attendance Check-In/Out
  const handleManualCheckIn = async (membership: Membership) => {
    const member = membership.members;
    if (!member) return;

    isProcessingRef.current = true;
    setState({ type: "scanning" });
    setSearchOpen(false);

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await manualCheckInOutAction({
        memberId: member.id,
        attendanceDate: today,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to mark manual attendance");
        setState({
          type: "invalid_qr",
          message: res.error || "Could not record attendance manually.",
        });
        return;
      }

      const action = res.data?.action as
        | "checked_in"
        | "checked_out"
        | "already_done";

      if (action === "already_done") {
        setState({
          type: "already_marked",
          memberName: member.full_name ?? undefined,
          timeRecorded: formatTime(res.data?.checkOut ?? res.data?.checkIn),
        });
        toast.success(`${member.full_name} already checked out for today`);
        return;
      }

      const isCheckOut = action === "checked_out";

      setState({
        type: "member_found",
        member: {
          id: member.id,
          fullName: member.full_name || "Member",
          photoUrl: member.photo_url || null,
          memberCode: member.member_code || "—",
          planName: membership.membership_plans?.plan_name || "Active Plan",
          status: membership.status || "Active",
          checkInTime: formatTime(
            isCheckOut ? res.data?.checkOut : res.data?.checkIn,
          ),
          attendanceStatus: isCheckOut ? "Checked Out" : "Checked In",
        },
      });

      toast.success(
        isCheckOut
          ? `${member.full_name} checked out`
          : `${member.full_name} checked in`,
      );
    } catch {
      toast.error("Error marking manual attendance");
      resetToScan();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header section */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan Membership Card</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          TrackVim Attendance
        </h1>
        <p className="text-xs text-muted-foreground">
          Point the camera at a member&apos;s physical QR card to punch in
        </p>
      </div>

      {/* Main Card Viewport */}
      <div className="relative bg-card rounded-3xl border border-border shadow-xl overflow-hidden p-4 sm:p-5 transition-all">
        {/* STATE 1 & 2: Ready to Scan or Processing */}
        {(state.type === "ready" || state.type === "scanning") && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
              {/* QR Camera Scanner */}
              <div className="absolute inset-0">
                <Scanner
                  onScan={handleQrScan}
                  onError={() => setState({ type: "camera_denied" })}
                  components={{ finder: false }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  }}
                />
              </div>

              {/* Viewport Overlay & Target Frame */}
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center">
                  {/* Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                  {/* Animated Scan Line */}
                  <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#6366f1] animate-bounce duration-1000 mt-2" />
                  </div>

                  {/* Center Target Indicator */}
                  <QrCode className="w-12 h-12 text-white/30" />
                </div>
              </div>

              {/* Processing Overlay */}
              {(state.type === "scanning" || isPending) && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-3 z-20">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <Sparkles className="w-5 h-5 text-primary absolute inset-0 m-auto" />
                  </div>
                  <p className="text-sm font-medium tracking-wide">
                    Verifying Membership Card...
                  </p>
                </div>
              )}
            </div>

            <p className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>Point the camera at the member&apos;s QR code</span>
            </p>
          </div>
        )}

        {/* STATE 3: Member Found / Attendance Marked */}
        {state.type === "member_found" && (
          <div className="py-4 px-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 border-2 border-emerald-500 shadow-md flex items-center justify-center">
                  {state.member.photoUrl ? (
                    <Image
                      src={state.member.photoUrl}
                      alt={state.member.fullName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {getInitials(state.member.fullName)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg ring-4 ring-card">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xl font-bold text-foreground">
                  {state.member.fullName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  ID:{" "}
                  <span className="font-mono">{state.member.memberCode}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
                >
                  {state.member.status}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {state.member.planName}
                </Badge>
              </div>
            </div>

            {/* Attendance Punch Box */}
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {state.member.attendanceStatus || "Attendance Marked"}
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {state.member.checkInTime}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Recorded for Today
              </p>
            </div>

            <Button
              onClick={resetToScan}
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md gap-2"
            >
              <span>Scan Next Member</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STATE 4: Invalid QR Code */}
        {state.type === "invalid_qr" && (
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Invalid Membership QR Code
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {state.message ||
                  "This QR code could not be verified or is not registered with your gym."}
              </p>
            </div>

            <Button
              onClick={resetToScan}
              variant="outline"
              size="lg"
              className="w-full h-11 rounded-xl font-medium gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </div>
        )}

        {/* STATE 5: Expired Membership */}
        {state.type === "expired" && (
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Membership Expired
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {state.memberName
                  ? `${state.memberName}'s membership expired on ${state.validUntil || "record"}.`
                  : "This member's subscription has expired and requires renewal."}
              </p>
            </div>

            <Button
              onClick={resetToScan}
              size="lg"
              className="w-full h-11 rounded-xl font-medium gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Another Card</span>
            </Button>
          </div>
        )}

        {/* STATE 6: Already Marked */}
        {state.type === "already_marked" && (
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-500/5">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Attendance Already Marked
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {state.memberName
                  ? `${state.memberName} has already checked in and out today at ${state.timeRecorded || "check-in"}.`
                  : `Attendance was already recorded today at ${state.timeRecorded || "check-in"}.`}
              </p>
            </div>

            <Button
              onClick={resetToScan}
              variant="outline"
              size="lg"
              className="w-full h-11 rounded-xl font-medium gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Another Card</span>
            </Button>
          </div>
        )}

        {/* STATE 7: Camera Permission Denied */}
        {state.type === "camera_denied" && (
          <div className="py-8 px-4 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Camera Access Required
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Please allow camera access in your browser permissions to scan
                membership QR cards.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={resetToScan}
                size="lg"
                className="w-full h-11 rounded-xl font-medium gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Allow Camera Access</span>
              </Button>
              <Button
                onClick={() => setSearchOpen(true)}
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Search member manually
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Manual Search Divider & Action */}
      <div className="space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-xs font-semibold text-muted-foreground tracking-widest uppercase">
            OR
          </span>
        </div>

        <Button
          onClick={() => setSearchOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-12 rounded-2xl border-border bg-card hover:bg-accent font-medium shadow-sm gap-2.5 text-foreground"
        >
          <Search className="w-4 h-4 text-primary" />
          <span>Search member</span>
        </Button>
      </div>

      {/* Subtle Info Footer */}
      <p className="text-center text-[11px] text-muted-foreground/80 px-4">
        Scan a TrackVim membership card to mark today&apos;s attendance.
      </p>

      {/* Manual Member Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>Search Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Search by member name, ID code, email, or phone to mark attendance
              manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/50">
              {filteredMemberships.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No active members found matching &quot;{searchQuery}&quot;.
                </p>
              ) : (
                filteredMemberships.map((m) => {
                  const member = m.members;
                  if (!member) return null;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent/60 transition-colors group cursor-pointer"
                      onClick={() => handleManualCheckIn(m)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {member.photo_url ? (
                            <Image
                              src={member.photo_url}
                              alt={member.full_name || ""}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(member.full_name || "Member")
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {member.full_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            ID: {member.member_code || "—"} •{" "}
                            {m.membership_plans?.plan_name}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0"
                      >
                        Punch In
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
