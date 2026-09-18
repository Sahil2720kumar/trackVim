import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { OwnerSection } from "@/components/landing/owner-section";
import { TrainerSection } from "@/components/landing/trainer-section";
import { MemberSection } from "@/components/landing/member-section";
import { QrAttendanceSection } from "@/components/landing/qr-attendance-section";
import { MembershipSection } from "@/components/landing/membership-section";
import { WorkoutSection } from "@/components/landing/workout-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "TrackVim — Gym Management Software",
  description:
    "TrackVim brings members, memberships, payments, attendance, trainers, and workouts together in one simple gym management platform.",
};

export default function RootPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <FeaturesSection />
      <FeatureShowcase />
      <OwnerSection />
      <TrainerSection />
      <MemberSection />
      <QrAttendanceSection />
      <MembershipSection />
      <WorkoutSection />
      <HowItWorks />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </>
  );
}
