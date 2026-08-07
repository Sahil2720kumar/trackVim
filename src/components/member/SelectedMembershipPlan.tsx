"use client";

import { Crown, CalendarDays, CircleCheckBig } from "lucide-react";
import { SectionCard } from "@/components/GymFormFields";

interface MembershipPlan {
  id: string;
  name: string;
  shortDescription: string;
  durationMonths: number;
  membershipDuration: string;
  price: number;
  joiningFee: number;
  benefits: string[];
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SelectedMembershipPlan({
  plan,
}: {
  plan: MembershipPlan;
}) {
  return (
    <SectionCard
      title="Selected Membership Plan"
      icon={Crown}
      badge={
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1">
          <CircleCheckBig className="w-3 h-3" />
          Selected Plan
        </span>
      }
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{plan.membershipDuration}</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-2">
              {formatINR(plan.price)}
            </p>
            {plan.joiningFee > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                + {formatINR(plan.joiningFee)} one-time joining fee
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 md:border-l md:border-border md:pl-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {plan.shortDescription}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {plan.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-1.5">
                <CircleCheckBig className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
