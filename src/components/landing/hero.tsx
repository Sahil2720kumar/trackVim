"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Ambient background glow & subtle grid */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-7xl bg-gradient-to-b from-primary/15 via-accent/5 to-transparent blur-[120px] opacity-70 -z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Trust Statement Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Everything your gym needs. One platform.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Manage your gym. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Grow your business.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              TrackVim brings members, memberships, payments, attendance,
              trainers, and workouts together in one simple gym management
              platform.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-xl px-7 py-6 text-base font-semibold shadow-md gap-2 group"
              >
                <Link
                  className="flex flex-row gap-2 items-center justify-center"
                  href="/sign-up"
                >
                  Get Started
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-7 py-6 text-base font-semibold border-border/80 hover:bg-accent/50"
              >
                <a href="#features">Explore TrackVim</a>
              </Button>
            </div>

            {/* Trust micro-indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Secure & Role-Based</span>
              </div>
              <div className="flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-indigo-500" />
                <span>QR Attendance Included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            {/* Ambient Card Backlight */}
            <div
              className="pointer-events-none absolute -inset-2 bg-gradient-to-tr from-primary/20 via-purple-500/10 to-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-70"
              aria-hidden="true"
            />

            <div className="relative rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-2xl p-5 sm:p-6 space-y-5 overflow-hidden">
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    TV
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      TrackVim Dashboard
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Good morning, Gym Owner
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </Badge>
              </div>

              {/* 4 Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Members</span>
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    128
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Active Plans</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    112
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Today's Scans</span>
                    <QrCode className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    76
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Pending</span>
                    <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ₹24,500
                  </div>
                </div>
              </div>

              {/* Attendance Overview Bar Graphic Mockup */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Today's Attendance Hourly Peak
                  </span>
                  <span className="text-muted-foreground font-normal">
                    Peak: 7:00 PM
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-14 pt-2">
                  {[20, 35, 60, 85, 95, 75, 50, 90, 100, 65, 40].map(
                    (val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-xs transition-all duration-300 relative group"
                        style={{ height: `${val}%` }}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary to-indigo-500 rounded-t-xs"
                          style={{ height: `${val * 0.7}%` }}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Membership Breakdown & Recent Payments Split */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                {/* Left: Membership Distribution */}
                <div className="sm:col-span-5 p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Memberships
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                      <span className="font-semibold text-foreground">112</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Expiring
                      </span>
                      <span className="font-semibold text-foreground">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Pending
                      </span>
                      <span className="font-semibold text-foreground">5</span>
                    </div>
                  </div>
                </div>

                {/* Right: Recent Payments */}
                <div className="sm:col-span-7 p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Recent Payments
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="font-medium text-foreground">
                        Rahul M.
                      </span>
                      <span className="text-muted-foreground">₹1,500</span>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 h-4"
                      >
                        Verified
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-medium text-foreground">
                        Priya S.
                      </span>
                      <span className="text-muted-foreground">₹2,000</span>
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 h-4"
                      >
                        Pending
                      </Badge>
                    </div>
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
