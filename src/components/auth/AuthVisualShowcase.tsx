"use client";

import React, { useState } from "react";
import {
  QrCode,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Dumbbell,
  Users,
  CreditCard,
  Check,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePublicHomepageStats } from "@/hooks/queries/public.query";

type RoleTab = "owner" | "trainer" | "member";

export function AuthVisualShowcase() {
  const [activeTab, setActiveTab] = useState<RoleTab>("owner");
  const { data: stats, isLoading } = usePublicHomepageStats();

  const todayScans = stats?.today_scans ?? 842;
  const scanChangePercent = stats?.scan_change_percent ?? 18;
  const activeMemberships = stats?.active_memberships ?? 1248;
  const attendanceRate = stats?.attendance_rate ?? 99.4;

  const tabHighlights: Record<
    RoleTab,
    {
      title: string;
      badge: string;
      items: string[];
      mockup: {
        title: string;
        subtitle: string;
        tag: string;
        tagColor: string;
        detail: string;
      };
    }
  > = {
    owner: {
      title: "Gym Owner Suite",
      badge: "Full Control",
      items: [
        "Automated member application approvals & queues",
        "Entrance QR code generation & signature security",
        "Payment verification for UPI & cash receipts",
        "Real-time revenue tracking & SaaS subscription billing",
      ],
      mockup: {
        title: "Owner Operations Queue",
        subtitle: "IronPulse HQ • Code: Q8K7PW",
        tag: "2 Pending Reviews",
        tagColor:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        detail: "₹4,500 Payment verification uploaded",
      },
    },
    trainer: {
      title: "Trainer Hub",
      badge: "Smart Workouts",
      items: [
        "Create & manage reusable workout templates",
        "Comprehensive exercise library with sets & reps",
        "Assign custom sessions directly to members",
        "Track client progress and attendance history",
      ],
      mockup: {
        title: "Session Planner",
        subtitle: "Push Day Strength • 5 Exercises",
        tag: "14 Clients",
        tagColor: "bg-primary/10 text-primary border-primary/30",
        detail: "Bench Press (4x8) • Incline DB (3x10)",
      },
    },
    member: {
      title: "Member Experience",
      badge: "Seamless Access",
      items: [
        "Instant QR scan check-in at gym entrance",
        "Multi-gym access switcher for active memberships",
        "Track plan status, expiration & payment history",
        "Access assigned workouts & trainer schedules",
      ],
      mockup: {
        title: "Member Entrance Scanner",
        subtitle: "Rahul Sharma • Gold Tier",
        tag: "Checked In",
        tagColor:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        detail: "07:14 AM • Main Gate Verified",
      },
    },
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-8 lg:p-10 pt-12 lg:pt-14 selection:bg-primary/20">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-accent/15 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6 w-full my-auto">
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/40 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold text-accent-foreground border border-accent/60">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>All-in-One Gym OS</span>
          </div>
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm text-xs border-border/70 text-muted-foreground gap-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Engine
          </Badge>
        </div>

        {/* Hero Title & Description */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Empower Your Gym. <br />
            <span className="bg-gradient-to-r from-primary via-primary/85 to-accent-foreground bg-clip-text text-transparent">
              Effortless Precision.
            </span>
          </h1>

          <p className="mt-3 max-w-md text-sm lg:text-base text-muted-foreground leading-relaxed">
            From instant QR entrance tracking to automated member management,
            trainer scheduling, and SaaS subscription billing—everything your
            fitness hub needs in one sleek platform.
          </p>
        </div>

        {/* Real-time Key Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xs transition-all duration-300 hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <QrCode className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Today&apos;s Scans
              </p>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {isLoading && !stats ? (
                    <span className="animate-pulse">Loading…</span>
                  ) : (
                    `${todayScans.toLocaleString("en-IN")} Verified`
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold flex items-center ${
                    scanChangePercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {scanChangePercent >= 0
                    ? `+${scanChangePercent}%`
                    : `${scanChangePercent}%`}
                  {scanChangePercent >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 ml-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 ml-0.5" />
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xs transition-all duration-300 hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                This Month
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Active Memberships
              </p>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {isLoading && !stats ? (
                    <span className="animate-pulse">Loading…</span>
                  ) : (
                    `${activeMemberships.toLocaleString("en-IN")} Active`
                  )}
                </span>
                <span className="text-[10px] font-semibold text-primary flex items-center">
                  {attendanceRate}% Rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Role Features Showcase */}
        <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Tailored Solutions
              </span>
            </div>
            {/* Role Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50">
              {(["owner", "trainer", "member"] as RoleTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                {activeTab === "owner" && (
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                )}
                {activeTab === "trainer" && (
                  <Dumbbell className="h-3.5 w-3.5 text-primary" />
                )}
                {activeTab === "member" && (
                  <Users className="h-3.5 w-3.5 text-primary" />
                )}
                {tabHighlights[activeTab].title}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-2 h-4 border-primary/30 bg-primary/5 text-primary font-medium"
              >
                {tabHighlights[activeTab].badge}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {tabHighlights[activeTab].items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-muted-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Interactive Mockup Snippet */}
            <div className="mt-2.5 p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-foreground text-[11px] truncate">
                  {tabHighlights[activeTab].mockup.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {tabHighlights[activeTab].mockup.subtitle}
                </p>
                <p className="text-[10px] font-mono text-primary/90 mt-0.5 truncate">
                  {tabHighlights[activeTab].mockup.detail}
                </p>
              </div>
              <Badge
                className={`shrink-0 text-[10px] py-0.5 px-2 h-5 font-semibold ${tabHighlights[activeTab].mockup.tagColor}`}
              >
                {tabHighlights[activeTab].mockup.tag}
              </Badge>
            </div>
          </div>
        </div>

        {/* Live Engine Activity Snippet */}
        <div className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              Live Platform Operations
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Automated RPCs
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-background/60 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                <QrCode className="h-3 w-3" /> Scan
              </div>
              <p className="font-bold text-foreground text-[11px] mt-1">
                Instant QR
              </p>
              <p className="text-[9px] text-muted-foreground">Checked In</p>
            </div>

            <div className="p-2 rounded-xl bg-background/60 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[10px]">
                <CreditCard className="h-3 w-3" /> Verify
              </div>
              <p className="font-bold text-foreground text-[11px] mt-1">
                Payment Queue
              </p>
              <p className="text-[9px] text-muted-foreground">Receipt Log</p>
            </div>

            <div className="p-2 rounded-xl bg-background/60 border border-border/50 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-primary font-medium text-[10px]">
                <Sparkles className="h-3 w-3" /> Billing
              </div>
              <p className="font-bold text-foreground text-[11px] mt-1">
                Auto Invoicing
              </p>
              <p className="text-[9px] text-muted-foreground">Monthly SaaS</p>
            </div>
          </div>
        </div>

        {/* Security & Uptime Trust Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 rounded-xl bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-foreground border border-border/60 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Bank-Grade Encryption</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-foreground border border-border/60 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>99.9% Service Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

