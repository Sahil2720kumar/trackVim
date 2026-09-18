import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingPreview() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/80 bg-gradient-to-b from-card to-muted/30 p-8 sm:p-12 shadow-xl text-center space-y-8 relative overflow-hidden">
          {/* Ambient Glow Background */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 bg-primary/15 blur-[80px] rounded-full"
            aria-hidden="true"
          />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent SaaS Model</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Simple pricing that grows with your gym.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              TrackVim offers flexible, member-based subscription tiers designed
              around your gym's active size. Pay only for active members with
              zero hidden costs.
            </p>
          </div>

          {/* Key Value Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>1 Month Free Trial</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Explore all gym owner features with a 30-day initial trial
                window.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Per-Active-Member</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Billing adjusts automatically based on verified active member
                counts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>No Long Locks</span>
              </div>
              <p className="text-muted-foreground text-xs">
                No long-term contracts. Pause or upgrade as your gym scales.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-xl px-8 py-6 text-base font-semibold shadow-md gap-2"
            >
              <Link className="flex items-center gap-2" href="/sign-up">
                Get Started Free
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            No complicated setup • No credit card required to register • Cancel
            anytime
          </p>
        </div>
      </div>
    </section>
  );
}
