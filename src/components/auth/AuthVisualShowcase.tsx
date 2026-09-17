"use client";

import React from "react";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";
import {
  Dumbbell,
  QrCode,
  Users,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function AuthVisualShowcase() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-8 lg:p-12">
      {/* Background Glows & Ambient Mesh */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px] opacity-70"
        aria-hidden="true"
      />
      {/* <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/15 blur-[120px] opacity-60"
        aria-hidden="true"
      /> */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[140px]"
        aria-hidden="true"
      />

      {/* Top Header / Branding */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 p-2 shadow-lg shadow-primary/10 ring-1 ring-white/10 transition-transform duration-300 hover:scale-105">
            <TrackVimIcon size={32} className="h-full w-full" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground font-sans">
              TrackVim
            </span>
            <span className="ml-2 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
              v2.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-md px-3 py-1.5 border border-border/60 text-xs font-medium text-muted-foreground shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Smart Fitness OS</span>
        </div>
      </div>

      {/* Middle Hero Section */}
      <div className="relative z-10 my-auto py-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/40 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold text-accent-foreground border border-accent/60 mb-4">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>Streamlined Gym Operations</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Empower Your Gym. <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent">
            Effortless Precision.
          </span>
        </h1>

        <p className="mt-4 max-w-md text-sm lg:text-base text-muted-foreground leading-relaxed">
          From instant QR attendance tracking to automated member management and
          trainer scheduling—everything your fitness hub needs in one sleek
          platform.
        </p>

        {/* Dynamic Preview Cards Showcase */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card 1: Live QR Check-in */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Today&apos;s Scans
              </p>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  842 Verified
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  +18% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Members */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                This Month
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Active Memberships
              </p>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-bold text-foreground">
                  1,248 Active
                </span>
                <span className="text-[11px] font-semibold text-primary flex items-center">
                  99.4% Rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground border border-border/60 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Bank-Grade Encryption</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground border border-border/60 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>99.9% Service Uptime</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Quote */}
      <div className="relative  pt-4  flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} TrackVim Inc.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Privacy
          </span>
          <span>•</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Terms
          </span>
        </div>
      </div>
    </div>
  );
}
