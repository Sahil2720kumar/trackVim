import React from "react";
import {
  QrCode,
  Smartphone,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function QrAttendanceSection() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs"
          >
            Dual QR Workflows
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Check in without the paperwork.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            TrackVim makes gym attendance fast, tamper-proof, and seamless with dual QR verification modes for members and staff.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flow 1: Gym Entrance QR */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Self Check-In
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                1. Member Scans Gym Entrance QR
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Gym places a static, HMAC-signed QR code at the entrance. The member opens the app and scans it. The server verifies the signature, verifies an active membership, and logs check-in or check-out automatically.
              </p>
            </div>

            {/* Visual Graphic Representation */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Server Signature Verification
                </span>
                <span className="text-[11px] text-muted-foreground">Location ID: #LOC-101</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/40 text-xs space-y-1">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Action: Scan Static Entrance QR</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Status: Checked In • Timestamp: 07:42 AM • Active Plan Validated
                </p>
              </div>
            </div>
          </div>

          {/* Flow 2: Physical/Digital Member Card QR */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Desk Staff Scanner
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                2. Staff Scans Member Card QR
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Members carry a digital or physical membership card with their unique QR. Desk staff or trainers scan the member's card to instantly identify them, check plan status, and record attendance.
              </p>
            </div>

            {/* Visual Graphic Representation */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-indigo-500" />
                  Member Card Scan Result
                </span>
                <span className="text-[11px] text-muted-foreground">Staff Scanner</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/40 text-xs space-y-1">
                <div className="flex justify-between font-medium text-foreground">
                  <span>Member: Rohit Verma</span>
                  <span className="text-primary font-bold">Gold Plan</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Assigned Trainer: Vikram S. • Expiry: 14 Oct 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
