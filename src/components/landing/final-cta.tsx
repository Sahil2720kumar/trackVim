import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-full max-w-6xl bg-gradient-to-t from-primary/15 via-purple-500/10 to-transparent blur-[120px] opacity-70 -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 sm:p-14 shadow-2xl space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Start Streamlining Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Run your gym with less complexity.
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Bring your gym's members, memberships, payments, attendance,
            trainers, and workouts into one platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-xl px-8 py-6 text-base font-semibold shadow-md gap-2 group"
            >
              <Link className="flex items-center gap-2" href="/sign-up">
                Get Started
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-xl px-8 py-6 text-base font-semibold"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
