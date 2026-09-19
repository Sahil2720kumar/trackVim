"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Users,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSubscriptionPlans } from "@/hooks/queries/public.query";

type BillingModel = "PerMember" | "Flat";

const BILLING_MODELS: { value: BillingModel; label: string }[] = [
  { value: "PerMember", label: "Per Member" },
  { value: "Flat", label: "Flat" },
];

export function PricingPreview() {
  const [selectedModel, setSelectedModel] = useState<BillingModel>("PerMember");

  const {
    data: plans,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePublicSubscriptionPlans();

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    return plans.filter((plan) => plan.billing_model === selectedModel);
  }, [plans, selectedModel]);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl border border-border/80 bg-gradient-to-b from-card to-muted/30 p-6 sm:p-12 shadow-xl text-center space-y-10 relative overflow-hidden">
          {/* Ambient Glow Background */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 bg-primary/15 blur-[90px] rounded-full"
            aria-hidden="true"
          />

          {/* Section Header */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transparent SaaS Pricing</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              Pricing
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Simple, transparent plans for your gym
            </p>
          </div>

          {/* Billing Model Selector Tabs */}
          <div className="flex justify-center">
            <div
              role="tablist"
              aria-label="Billing model selector"
              className="inline-flex items-center p-1.5 rounded-2xl bg-muted/80 border border-border/70 shadow-inner gap-1"
            >
              {BILLING_MODELS.map((model) => {
                const isActive = selectedModel === model.value;
                return (
                  <button
                    key={model.value}
                    role="tab"
                    id={`tab-${model.value}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${model.value}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setSelectedModel(model.value)}
                    className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-background text-foreground shadow-sm border border-border/80"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    {model.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div
            role="tabpanel"
            id={`panel-${selectedModel}`}
            aria-labelledby={`tab-${selectedModel}`}
            className="pt-2"
          >
            {/* Loading Skeleton State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-28 rounded-lg" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-36 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-md" />
                      </div>
                      <div className="space-y-2.5 pt-4 border-t border-border/40">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-5/6 rounded-md" />
                        <Skeleton className="h-4 w-4/6 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl mt-6" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              /* Error State */
              <div className="max-w-md mx-auto p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground text-base">
                    Unable to load pricing plans.
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Please try again or check your network connection.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2 rounded-xl border-destructive/30 hover:bg-destructive/10 text-destructive font-semibold"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                  />
                  <span>Retry</span>
                </Button>
              </div>
            ) : filteredPlans.length === 0 ? (
              /* Empty State */
              <div className="max-w-md mx-auto p-8 sm:p-12 rounded-2xl border border-border/60 bg-card/60 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg">
                  No plans available
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  There are currently no plans available for this billing model.
                </p>
              </div>
            ) : (
              /* Pricing Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {filteredPlans.map((plan) => {
                  const price =
                    selectedModel === "PerMember"
                      ? plan.price_per_member
                      : plan.flat_price;

                  const formattedPrice =
                    price !== null && price !== undefined
                      ? `₹${Number(price).toLocaleString("en-IN")}`
                      : "Custom";

                  const periodLabel =
                    selectedModel === "PerMember"
                      ? "per member / month"
                      : "per month";

                  const featuresList = Array.isArray(plan.features)
                    ? (plan.features as string[])
                    : [];

                  return (
                    <div
                      key={plan.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/40 overflow-hidden"
                    >
                      <div className="space-y-6">
                        {/* Header & Capacity */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {plan.name}
                            </h3>
                            {plan.max_members ? (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>
                                  Up to{" "}
                                  {plan.max_members.toLocaleString("en-IN")}{" "}
                                  members
                                </span>
                              </p>
                            ) : selectedModel === "Flat" ? (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Unlimited members</span>
                              </p>
                            ) : null}
                          </div>

                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                          >
                            {selectedModel === "PerMember"
                              ? "Per Member"
                              : "Flat Tier"}
                          </Badge>
                        </div>

                        {/* Price Display */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                              {formattedPrice}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {periodLabel}
                          </p>
                        </div>

                        {/* Features List */}
                        {featuresList.length > 0 && (
                          <div className="pt-4 border-t border-border/50 space-y-3">
                            <p className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                              Included Features
                            </p>
                            <ul className="space-y-2.5 text-xs text-muted-foreground">
                              {featuresList.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5"
                                >
                                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </div>
                                  <span className="text-foreground/90 font-medium leading-tight">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6 mt-6 border-t border-border/40">
                        <Button
                          asChild
                          size="lg"
                          className="w-full rounded-xl font-semibold shadow-sm gap-2 text-sm"
                        >
                          <Link
                            className="flex flex-row items-center justify-center gap-2"
                            href="/sign-up"
                          >
                            <span>Start 1 Month Free Trial</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Value Points Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left text-xs sm:text-sm pt-4 border-t border-border/50">
            <div className="p-4 rounded-xl bg-card/70 border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>1 Month Free Trial</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Explore all gym owner features with an initial 1 month free
                trial window.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card/70 border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Automated Invoicing</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Billing calculates active members automatically each cycle.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card/70 border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>No Lock-in Contracts</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                No long-term commitments. Upgrade or pause whenever needed.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            No complicated setup • No credit card required to register • Cancel
            anytime
          </p>
        </div>
      </div>
    </section>
  );
}
