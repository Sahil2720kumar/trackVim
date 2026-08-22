import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

import ProgressBar from "@/components/member/ProgressBar";
import ReviewApplicationStep from "@/components/member/ReviewApplicationStep";
import AwaitingApprovalStep from "@/components/member/AwaitingApprovalStep";
import PaymentPendingStep from "@/components/member/PaymentPendingStep";
import { MembershipApplicationPageDataByPlanId } from "@/services/member.query";
import { createServerClient } from "@/lib/supabase/server";

interface ApplyPageProps {
  params: Promise<{ gymId: string; planId: string }>;
}

const HEADER_COPY = {
  none: {
    title: "Review Membership Application",
    subtitle:
      "Please review your application before sending it to the gym owner.",
  },
  rejected: {
    title: "Review Membership Application",
    subtitle:
      "Please review your application before sending it to the gym owner.",
  },
  pending: {
    title: "Application Submitted",
    subtitle: "The gym owner is reviewing your application.",
  },
  approved: {
    title: "Complete Your Payment",
    subtitle: "One more step to activate your membership.",
  },
} as const;

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { gymId, planId } = await params;

  const supabase = await createServerClient();
  const data = await MembershipApplicationPageDataByPlanId(
    supabase,
    gymId,
    planId,
  );

  if (!data) notFound();

  const { gym, plan, member, existingApplicationStatus, gymMembership } = data;

  const stepNumber =
    existingApplicationStatus === "pending"
      ? 3
      : existingApplicationStatus === "approved"
        ? 4
        : 2; // "none" or "rejected" → still reviewing/reapplying

  const { title, subtitle } =
    HEADER_COPY[existingApplicationStatus] ?? HEADER_COPY.none;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div className="rounded-2xl border border-border bg-card/60 py-4 px-4">
          <ProgressBar step={stepNumber} />
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs font-semibold text-foreground leading-tight">
              Secure &amp; Safe
            </p>
          </div>
        </div>

        {existingApplicationStatus === "pending" && (
          <AwaitingApprovalStep gym={gym} plan={plan} />
        )}

        {existingApplicationStatus === "approved" && (
          <PaymentPendingStep
            gymMembershipId={gymMembership?.id as string}
            gym={gym}
            plan={plan}
          />
        )}

        {(existingApplicationStatus === "none" ||
          existingApplicationStatus === "rejected") && (
          <ReviewApplicationStep
            gym={gym}
            plan={plan}
            member={member}
            gymId={gym.id}
            planId={plan.id}
            rejected={existingApplicationStatus === "rejected"}
          />
        )}
      </div>

      <div className="bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="px-4 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between max-w-[1400px] mx-auto">
          <Link
            href={`/member/discover/${gym.id}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Gym Details
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Your application will be sent to the gym owner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
