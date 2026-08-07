"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  MapPin,
  Star,
  Dumbbell,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  BadgeCheck,
  CalendarClock,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Json } from "@/db/database.types";
import { useRouter } from "next/navigation";
import { DisplayStatus } from "@/types";
import {
  STATUS_CONFIG,
  DETAIL_TIMELINE_STEPS,
  getDetailTimelineState,
} from "@/lib/application-status";

type GymDetail = {
  id: string;
  name: string;
  gym_description: string | null;
  logo_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  amenities: Json;
  is_verified: boolean;
  trainers: {
    id: string;
    full_name: string | null;
    photo_url: string | null;
    professional_title: string | null;
    experience_years: number | null;
    average_rating: number | null;
    total_reviews: number | null;
  }[];
  membership_plans: {
    id: string;
    plan_name: string;
    plan_price: number;
    membership_duration: string;
    selected_features: Json;
    is_featured: boolean | null;
  }[];
  gym_photos: { id: string; photo_url: string; is_cover: boolean }[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

// ─── Status badge (reuses the app-wide STATUS_CONFIG) ──────────────────────

function MembershipStatusBadge({ status }: { status: DisplayStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
        config.badgeClass,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}

// ─── gym_membership timeline (compact horizontal version of DETAIL_TIMELINE_STEPS) ──

function GymMembershipTimeline({ status }: { status: DisplayStatus }) {
  const { completed, active, rejected } = getDetailTimelineState(status);

  return (
    <div className="flex items-center gap-0 mt-4">
      {DETAIL_TIMELINE_STEPS.map((step, i) => {
        const isCompleted = completed.includes(step.key);
        const isActive = active === step.key;
        const isRejected = rejected.includes(step.key);
        const isLast = i === DETAIL_TIMELINE_STEPS.length - 1;

        return (
          <div
            key={step.key}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  isRejected
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/15 text-primary ring-2 ring-primary/40"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {isRejected ? (
                  <X className="w-3.5 h-3.5" />
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight max-w-[54px]",
                  isCompleted || isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 rounded-full transition-colors mb-4",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function MembershipCTA({
  status,
  onApply,
  onDashboard,
}: {
  status: DisplayStatus | "none";
  onApply: () => void;
  onDashboard: () => void;
}) {
  switch (status) {
    case "none":
      return (
        <Button className="w-full font-bold" onClick={onApply}>
          Apply for Membership
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      );
    case "Pending":
      return (
        <Button disabled className="w-full opacity-60">
          Application Pending
        </Button>
      );
    case "Rejected":
      return (
        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={onApply}
        >
          Apply Again
        </Button>
      );
    case "Approved":
    case "PaymentPending":
      return (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          onClick={onApply}
        >
          Complete Payment
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      );
    case "PaymentUploaded":
      return (
        <Button disabled className="w-full opacity-60">
          Payment Under Verification
        </Button>
      );
    case "PaymentRejected":
      return (
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          onClick={onApply}
        >
          Reupload Payment
        </Button>
      );
    case "Active":
      return (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          onClick={onDashboard}
        >
          Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      );
    case "Frozen":
      return (
        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={onDashboard}
        >
          View Frozen Membership
        </Button>
      );
    case "Expired":
      return (
        <Button className="w-full font-bold" onClick={onApply}>
          Renew Membership
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      );
    case "Cancelled":
      return (
        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={onApply}
        >
          Rejoin Gym
        </Button>
      );
    default:
      return null;
  }
}

// ─── Gallery / Trainers (unchanged) ─────────────────────────────────────────

function GallerySection({
  photos,
  gymName,
}: {
  photos: GymDetail["gym_photos"];
  gymName: string;
}) {
  if (photos.length === 0) {
    return (
      <section className="rounded-2xl border border-border/60 p-6">
        <h2 className="text-lg font-bold mb-4">Gym Gallery</h2>
        <div className="h-48 flex items-center justify-center bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground">
            No photos available yet
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border/60 p-6 overflow-hidden">
      <h2 className="text-lg font-bold mb-4">Gym Gallery</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative w-56 h-56 flex-shrink-0 rounded-xl overflow-hidden bg-muted"
            >
              <Image
                src={photo.photo_url}
                alt={`${gymName} photo`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

function TrainersSection({ trainers }: { trainers: GymDetail["trainers"] }) {
  return (
    <section className="rounded-2xl border border-border/60 p-6">
      <h2 className="text-lg font-bold mb-4">Meet Our Trainers</h2>
      {trainers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Trainer information will be available soon.
        </p>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-3">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="flex-shrink-0 w-44 bg-muted/40 rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:bg-muted/70 transition-colors duration-200"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={trainer.photo_url ?? undefined}
                    alt={trainer.full_name ?? ""}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {getInitials(trainer.full_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold leading-tight">
                    {trainer.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {trainer.professional_title ?? "Trainer"}
                  </p>
                  {trainer.experience_years != null && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trainer.experience_years} Years Experience
                    </p>
                  )}
                </div>
                {trainer.average_rating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">
                      {trainer.average_rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({trainer.total_reviews ?? 0})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function GymDetailView({
  gym,
  initialDisplayStatus,
  initialPlanId,
  initialMembershipPlanDetails,
}: {
  gym: GymDetail;
  initialDisplayStatus: DisplayStatus | "none";
  initialPlanId: string | null;
  initialMembershipPlanDetails?: {
    id: string;
    plan_name: string;
    plan_price: number;
    duration_months: number;
    membership_duration: string;
    selected_features: Json;
    custom_features: Json;
  } | null;
}) {
  const [status] = useState<DisplayStatus | "none">(initialDisplayStatus);
  const router = useRouter();

  const cheapestGymMembershipPlan = gym.membership_plans.length
    ? gym.membership_plans.find(
        (p) =>
          Number(p.plan_price) ===
          Math.min(...gym.membership_plans.map((p) => Number(p.plan_price))),
      )
    : null;

  const targetPlanId = initialPlanId ?? cheapestGymMembershipPlan?.id ?? null;

  const handleApply = (planId?: string) => {
    const id = planId ?? targetPlanId;
    if (!id) return;
    router.push(`/member/discover/${gym.id}/apply/${id}`);
  };

  const handleDashboard = () => {
    router.push("/member/dashboard");
  };

  const address = [gym.address_line1, gym.address_line2, gym.city, gym.state]
    .filter(Boolean)
    .join(", ");

  const hasBlockingMembership = status === "Active" || status === "Frozen";

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <section className="rounded-2xl border border-border/60 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex gap-5 flex-1">
              <div className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden relative bg-muted">
                {gym.logo_url ? (
                  <Image
                    src={gym.logo_url}
                    alt={gym.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                    {getInitials(gym.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold">{gym.name}</h1>
                  {gym.is_verified && (
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  {status !== "none" && (
                    <MembershipStatusBadge status={status} />
                  )}
                </div>

                {(gym.city || gym.state) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    {[gym.city, gym.state].filter(Boolean).join(", ")}
                  </div>
                )}

                {gym.gym_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {gym.gym_description}
                  </p>
                )}

                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">
                        {gym.trainers.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Trainers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing + status + timeline block */}
            <div className="md:w-72 flex-shrink-0">
              <div className="rounded-2xl bg-muted/40 p-5 space-y-3">
                {initialMembershipPlanDetails ? (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Selected Plan
                    </p>
                    <p className="text-lg font-semibold">
                      {initialMembershipPlanDetails.plan_name}
                    </p>
                    <p className="text-2xl font-bold">
                      ₹
                      {Number(
                        initialMembershipPlanDetails.plan_price,
                      ).toLocaleString("en-IN")}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{initialMembershipPlanDetails.duration_months} month
                      </span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground">Starts from</p>
                    <p className="text-2xl font-bold">
                      {cheapestGymMembershipPlan ? (
                        <>
                          ₹
                          {Number(
                            cheapestGymMembershipPlan.plan_price,
                          ).toLocaleString("en-IN")}
                          <span className="text-sm font-normal text-muted-foreground">
                            /month
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-normal text-muted-foreground">
                          No plans yet
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {status !== "none" && <GymMembershipTimeline status={status} />}

                <MembershipCTA
                  status={status}
                  onApply={() => handleApply()}
                  onDashboard={handleDashboard}
                />
              </div>
            </div>
          </div>
        </section>

        <GallerySection photos={gym.gym_photos} gymName={gym.name} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {gym.amenities && gym.amenities.length > 0 && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="text-lg font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {gym.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border/60 p-6">
            <h2 className="text-lg font-bold mb-4">Contact & Location</h2>
            <div className="space-y-4">
              {address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {address}
                  </p>
                </div>
              )}
              {gym.contact_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gym.contact_phone}
                  </p>
                </div>
              )}
              {gym.contact_email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gym.contact_email}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <TrainersSection trainers={gym.trainers} />

        {/* Membership Plans */}
        <div>
          <h2 className="text-xl font-bold mb-4">Membership Plans</h2>
          {gym.membership_plans.length === 0 ? (
            <div className="rounded-2xl border border-border/60 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Membership plans are currently unavailable.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {gym.membership_plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-200",
                    plan.is_featured
                      ? "bg-primary/5 ring-1 ring-primary/30"
                      : "border border-border/60 hover:border-primary/30",
                  )}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 fill-primary-foreground" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{plan.plan_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">
                          ₹{Number(plan.plan_price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {plan.membership_duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <ul className="space-y-2 flex-1">
                    {(plan.selected_features ?? []).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full font-bold"
                    variant={plan.is_featured ? "default" : "outline"}
                    onClick={() => handleApply(plan.id)}
                    disabled={hasBlockingMembership}
                  >
                    Choose Plan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
