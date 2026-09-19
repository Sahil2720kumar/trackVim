import React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Users,
  CreditCard,
  QrCode,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerSection() {
  const ownerCapabilities = [
    "Manage member roster & profile records",
    "Create & publish custom membership plans",
    "Approve or reject membership applications",
    "Verify payment receipts & transaction references",
    "Track daily check-in / check-out attendance",
    "Invite trainers & assign them to members",
    "Monitor gym revenue & active subscriber metrics",
    "Manage TrackVim platform subscription & billing",
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Building2 className="h-4 w-4" />
              <span>Gym Owner Suite</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Built for gym owners.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Stay on top of members, payments, attendance, trainers,
              memberships, and your gym's day-to-day operations from a single
              dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {ownerCapabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-xl px-7 py-6 text-base font-semibold shadow-md gap-2"
              >
                <Link className="flex items-center gap-2" href="/sign-up">
                  Manage your gym with TrackVim
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Visual: Owner Dashboard Preview Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    GO
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Gym Owner Workspace
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      IronPulse Fitness HQ
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Gym Code: Q8K7PW
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Member Application Queue
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        2 Pending Approval
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-lg"
                  >
                    Review Queue
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Payment Verification
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        3 Unverified Receipts
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="h-7 text-xs rounded-lg">
                    Verify Receipts
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-foreground">
                        TrackVim SaaS Billing
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        112 Active Members • Next Cycle Oct 1
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    ₹2,240 / mo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
