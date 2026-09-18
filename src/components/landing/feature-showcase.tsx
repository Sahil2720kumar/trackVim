import React from "react";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeatureShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Split Showcase 1: Real-Time Dashboard & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-Time Visibility</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Everything in view. <br />
              Know what's happening across your gym.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              No more searching through spreadsheets or asking staff for daily updates. TrackVim gives owners instant clarity on member attendance, active subscriptions, pending verification queues, and financial metrics in one place.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Live member attendance feed & check-in counts",
                "Automated membership expiry alerts before plans lapse",
                "Single-click verification for member payment proofs",
                "Multi-branch location management and analytics",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right UI Preview: Dashboard Showcase Card */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  <span className="text-xs font-semibold text-muted-foreground ml-2">
                    TrackVim Command Center
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] py-0">
                  Live Operations
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                  <span className="text-xs text-muted-foreground">Checked-In Right Now</span>
                  <p className="text-2xl font-bold text-foreground">34 Members</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    +12% vs yesterday
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-accent/30 border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground">Unverified Receipts</span>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">3 Pending</p>
                  <span className="text-[10px] text-muted-foreground">Action required</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Active Attendance Log
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-card border border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                        AK
                      </div>
                      <span className="font-medium text-foreground">Amit Kumar</span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">Check-in 08:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-card border border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px]">
                        NS
                      </div>
                      <span className="font-medium text-foreground">Neha Sharma</span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">Check-in 08:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Showcase 2: Application to Payment Workflow (Reversed) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left UI Preview: Payment Pipeline Card */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-semibold text-foreground">
                  Membership Application & Payment Flow
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                  State Machine Guided
                </Badge>
              </div>

              {/* Step Flow Card */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Application Submitted</p>
                      <p className="text-[10px] text-muted-foreground">Plan: Gold Annual (₹12,000)</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Approved</Badge>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Payment Receipt Uploaded</p>
                      <p className="text-[10px] text-muted-foreground">UPI Ref: #994810294</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                    Pending Verification
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Owner Verified Payment</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Membership Activated • QR Unlocked</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Zero Leakage Billing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Seamless applications & verified payment management.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              When a member applies for a membership plan, TrackVim locks in the plan pricing at that exact instant. Payments cannot be fake-verified; every uploaded receipt goes into an owner verification queue before gym features unlock.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Price snapshotting locks plan rates upon approval",
                "Receipt upload with transaction reference verification",
                "Clear rejection flows with reason feedback to members",
                "Complete audit history for every financial transaction",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
