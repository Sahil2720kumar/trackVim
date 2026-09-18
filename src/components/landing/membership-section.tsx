import React from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RefreshCw,
  Receipt,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MembershipSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/20 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CreditCard className="h-4 w-4" />
              <span>Full Lifecycle Management</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Memberships and payments, without the spreadsheet chaos.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Track every stage of the membership journey — from initial draft plan rates and application approvals to receipt verification, scheduled upcoming renewals, and auto-expirations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/60">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Locked Plan Rates
                </h4>
                <p className="text-xs text-muted-foreground">
                  Price snapshotting upon approval ensures future plan price updates never alter active member terms.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/60">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Scheduled Renewals
                </h4>
                <p className="text-xs text-muted-foreground">
                  Members can queue up future memberships seamlessly without losing current active duration.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/60">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-amber-500" />
                  Receipt Verification
                </h4>
                <p className="text-xs text-muted-foreground">
                  Payment screenshots and transaction IDs are submitted directly to the owner for approval.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/60">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Auto Expirations
                </h4>
                <p className="text-xs text-muted-foreground">
                  Daily cron automatically shifts overdue memberships to Expired, keeping access tight.
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual UI Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm font-bold text-foreground">
                  Active Gym Membership Snapshot
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                  Active
                </Badge>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Plan Name</span>
                    <span className="font-bold text-foreground text-sm">Monthly Standard</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Membership Status</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Start Date</span>
                    <span className="font-medium text-foreground">12 Sep 2026</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">End Date</span>
                    <span className="font-medium text-foreground">11 Oct 2026</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Payment Amount</span>
                    <span className="font-bold text-foreground text-sm">₹1,500</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[11px]">Payment Status</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                      Verified by Owner
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
