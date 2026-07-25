"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  MapPin,
  Star,
  Users,
  Dumbbell,
  ShieldCheck,
  Clock3,
  Phone,
  Mail,
  Wifi,
  ChevronRight,
  ChevronLeft,
  Building2,
  BadgeCheck,
  CalendarClock,
  HeartHandshake,
  ParkingCircle,
  Zap,
  Flame,
  Wind,
  Navigation,
  SlidersHorizontal,
  Check,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

interface Trainer {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
}

interface MembershipPlan {
  id: string;
  label: string;
  price: number;
  period: string;
  periodLabel: string;
  savings?: number;
  isPopular?: boolean;
  features: string[];
}

interface GymInfo {
  id: string;
  name: string;
  logoColor: string;
  logoText: string;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string[];
  address: string;
  city: string;
  distance: number;
  startingPrice: number;
  isVerified: boolean;
  isOpen: boolean;
  memberCount: number;
  trainerCount: number;
  yearsStrong: number;
  photos: string[];
  amenities: string[];
  openingHours: { days: string; hours: string }[];
  contactNumber: string;
  email: string;
  facilities: { label: string; available: boolean }[];
  trainers: Trainer[];
  membershipPlans: MembershipPlan[];
  applicationStatus: ApplicationStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const GYM_DATA: GymInfo = {
  id: "1",
  name: "IronForge Fitness",
  logoColor: "#7c3aed",
  logoText: "IRONFORGE",
  rating: 4.8,
  reviewCount: 326,
  description:
    "Premium fitness facility with state-of-the-art equipment, expert trainers and personalized training programs to help you achieve your fitness goals.",
  longDescription: [
    "IronForge Fitness is more than just a gym — it's a community built to transform lives. Our facility is designed to provide the perfect environment for all fitness levels.",
    "We offer a wide range of equipment, group classes, and personalized training programs tailored to your goals.",
    "Our certified trainers are here to support you every step of the way on your fitness journey.",
  ],
  address: "123 Fitness Street, Downtown, Bangalore, Karnataka 560001",
  city: "Downtown, Bangalore",
  distance: 2.3,
  startingPrice: 1499,
  isVerified: true,
  isOpen: true,
  memberCount: 1250,
  trainerCount: 12,
  yearsStrong: 5,
  photos: [
    "/images/gym-1.png",
    "/images/gym-2.png",
    "/images/gym-3.png",
    "/images/gym-4.png",
    "/images/gym-5.png",
  ],
  amenities: [
    "Strength Training",
    "Cardio",
    "Yoga",
    "CrossFit",
    "Zumba",
    "Steam Bath",
    "Locker",
    "Parking",
    "WiFi",
    "Personal Training",
    "Nutrition Support",
  ],
  openingHours: [
    { days: "Mon - Sat", hours: "5:00 AM – 11:00 PM" },
    { days: "Sun", hours: "7:00 AM – 9:00 PM" },
  ],
  contactNumber: "+91 98765 43210",
  email: "hello@ironforgefitnss.com",
  facilities: [
    { label: "Parking", available: true },
    { label: "Locker Facility", available: true },
    { label: "Personal Training", available: true },
    { label: "Nutrition Support", available: true },
    { label: "WiFi", available: true },
    { label: "Steam Bath", available: true },
  ],
  trainers: [
    {
      id: "t1",
      name: "Rahul Sharma",
      avatar: "",
      specialization: "Strength Coach",
      experience: 8,
      rating: 4.9,
      reviewCount: 120,
    },
    {
      id: "t2",
      name: "Neha Iyer",
      avatar: "",
      specialization: "Yoga Instructor",
      experience: 6,
      rating: 4.8,
      reviewCount: 98,
    },
    {
      id: "t3",
      name: "Arjun Mehta",
      avatar: "",
      specialization: "CrossFit Coach",
      experience: 7,
      rating: 4.7,
      reviewCount: 88,
    },
    {
      id: "t4",
      name: "Pooja Nair",
      avatar: "",
      specialization: "Cardio Coach",
      experience: 5,
      rating: 4.8,
      reviewCount: 76,
    },
    {
      id: "t5",
      name: "Vikram Das",
      avatar: "",
      specialization: "Nutrition Coach",
      experience: 9,
      rating: 4.9,
      reviewCount: 64,
    },
  ],
  membershipPlans: [
    {
      id: "monthly",
      label: "Monthly Plan",
      price: 1499,
      period: "month",
      periodLabel: "/month",
      isPopular: false,
      features: [
        "Full gym access",
        "Group classes",
        "Locker facility",
        "Trainer assistance",
      ],
    },
    {
      id: "quarterly",
      label: "Quarterly Plan",
      price: 3999,
      period: "quarter",
      periodLabel: "/quarter",
      savings: 500,
      isPopular: true,
      features: [
        "Full gym access",
        "Group classes",
        "Locker facility",
        "Trainer assistance",
      ],
    },
    {
      id: "annual",
      label: "Annual Plan",
      price: 14999,
      period: "year",
      periodLabel: "/year",
      savings: 2989,
      isPopular: false,
      features: [
        "Full gym access",
        "Group classes",
        "Locker facility",
        "Trainer assistance",
      ],
    },
  ],
  applicationStatus: "none",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
  return `${count}+`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function GymLogo({ gym }: { gym: GymInfo }) {
  return (
    <div
      className="w-24 h-24 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center text-white font-bold shadow-lg"
      style={{ backgroundColor: gym.logoColor }}
    >
      <Dumbbell className="w-7 h-7 mb-1 opacity-80" />
      <span className="text-[10px] tracking-widest leading-none font-bold">
        {gym.logoText}
      </span>
    </div>
  );
}

function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        isOpen
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isOpen ? "bg-emerald-500" : "bg-muted-foreground",
        )}
      />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Application Pending
      </span>
    );
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        <BadgeCheck className="w-3.5 h-3.5" />
        Membership Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Application Declined
      </span>
    );
  return null;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function GallerySection({ photos }: { photos: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Gym Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">No photos available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-bold">Gym Gallery</CardTitle>
        <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline transition-all">
          View All Photos <ChevronRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="pb-5">
        {/* Desktop gallery */}
        <div className="hidden md:grid grid-cols-3 gap-3 h-[360px]">
          {/* Featured large */}
          <div className="col-span-1 row-span-2 relative rounded-xl overflow-hidden cursor-pointer">
            <Image
              src={photos[activeIdx]}
              alt="Featured gym photo"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Thumbnails */}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {photos
              .filter((_, i) => i !== activeIdx)
              .slice(0, 4)
              .map((photo, idx) => {
                const originalIdx = photos.findIndex((p) => p === photo);
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveIdx(originalIdx)}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <Image
                      src={photo}
                      alt={`Gym photo ${idx + 2}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Mobile horizontal scroll */}
        <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-64 h-40 flex-shrink-0 rounded-xl overflow-hidden"
                >
                  <Image
                    src={photo}
                    alt={`Gym photo ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Trainers ─────────────────────────────────────────────────────────────────

function TrainersSection({ trainers }: { trainers: Trainer[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-bold">Meet Our Trainers</CardTitle>
        <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline transition-all">
          View All Trainers <ChevronRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
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
                  className="flex-shrink-0 w-44 bg-muted/40 border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={trainer.avatar} alt={trainer.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {getInitials(trainer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {trainer.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trainer.specialization}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trainer.experience} Years Experience
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">
                      {trainer.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({trainer.reviewCount} Reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Application Section ──────────────────────────────────────────────────────

function ApplicationSection({
  gym,
  onApply,
}: {
  gym: GymInfo;
  onApply: () => void;
}) {
  const { applicationStatus } = gym;

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          {/* Illustration */}
          <div className="flex-shrink-0 w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-14 h-14 text-primary/60" />
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left space-y-2">
            {applicationStatus === "none" && (
              <>
                <h3 className="text-2xl font-bold text-foreground">
                  Ready to Join?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Submit your membership application and start your fitness
                  journey with IronForge Fitness.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Quick Approval
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Expert Trainers
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                    Best Equipment
                  </span>
                </div>
              </>
            )}

            {applicationStatus === "pending" && (
              <>
                <ApplicationStatusBadge status="pending" />
                <h3 className="text-xl font-bold text-foreground pt-1">
                  Application Under Review
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your application is currently under review. We&apos;ll notify
                  you once it&apos;s approved.
                </p>
              </>
            )}

            {applicationStatus === "approved" && (
              <>
                <ApplicationStatusBadge status="approved" />
                <h3 className="text-xl font-bold text-foreground pt-1">
                  You&apos;re a Member!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You&apos;re already a member of this gym. Head to your
                  dashboard to manage your membership.
                </p>
              </>
            )}

            {applicationStatus === "rejected" && (
              <>
                <ApplicationStatusBadge status="rejected" />
                <h3 className="text-xl font-bold text-foreground pt-1">
                  Application Declined
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unfortunately your previous application was declined. You can
                  submit a new request.
                </p>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {applicationStatus === "none" && (
              <>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                  onClick={onApply}
                >
                  Apply for Membership <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  No payment required now
                </p>
              </>
            )}

            {applicationStatus === "pending" && (
              <Button size="lg" disabled className="px-8 opacity-60">
                Application Pending
              </Button>
            )}

            {applicationStatus === "approved" && (
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
              >
                Go to Gym Dashboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {applicationStatus === "rejected" && (
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 font-bold px-8"
                onClick={onApply}
              >
                Apply Again <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GymDetailPage() {
  const [gym, setGym] = useState<GymInfo>(GYM_DATA);
  const [devStatus, setDevStatus] = useState<ApplicationStatus>("none");

  const devButtons: { label: string; value: ApplicationStatus | "none" }[] = [
    { label: "Not Applied", value: "none" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleDevChange = (status: ApplicationStatus) => {
    setDevStatus(status);
    setGym((prev) => ({ ...prev, applicationStatus: status }));
  };

  const handleApply = () => {
    setDevStatus("pending");
    setGym((prev) => ({ ...prev, applicationStatus: "pending" }));
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    "Strength Training": <Dumbbell className="w-3.5 h-3.5" />,
    Cardio: <Flame className="w-3.5 h-3.5" />,
    Yoga: <Wind className="w-3.5 h-3.5" />,
    CrossFit: <Zap className="w-3.5 h-3.5" />,
    Zumba: <HeartHandshake className="w-3.5 h-3.5" />,
    "Steam Bath": <Wind className="w-3.5 h-3.5" />,
    Locker: <Building2 className="w-3.5 h-3.5" />,
    Parking: <ParkingCircle className="w-3.5 h-3.5" />,
    WiFi: <Wifi className="w-3.5 h-3.5" />,
    "Personal Training": <Users className="w-3.5 h-3.5" />,
    "Nutrition Support": <HeartHandshake className="w-3.5 h-3.5" />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* ── Development Controls ──────────────────────── */}
        {/* <div className="flex items-center gap-2 flex-wrap bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Development Controls
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {devButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handleDevChange(btn.value as ApplicationStatus)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 inline-flex items-center gap-1.5",
                  devStatus === btn.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
                )}
              >
                {btn.value === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                {btn.value === "approved" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
                {btn.value === "rejected" && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
                {btn.label}
              </button>
            ))}
          </div>
        </div> */}

        {/* ── Back Link ────────────────────────────────── */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover Gyms
        </Link>

        {/* ── Gym Header ───────────────────────────────── */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: logo + info */}
              <div className="flex gap-5 flex-1">
                <GymLogo gym={gym} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {gym.name}
                    </h1>
                    {gym.isVerified && (
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Rating + location */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-foreground font-bold text-sm">
                        {gym.rating}
                      </span>
                      <span>({gym.reviewCount} Reviews)</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {gym.city}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {gym.distance} km away
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <OpenBadge isOpen={gym.isOpen} />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Zap className="w-3 h-3" />
                      Premium Gym
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {gym.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 mt-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">
                          {formatMemberCount(gym.memberCount)}
                        </p>
                        <p className="text-xs text-muted-foreground">Members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">
                          {gym.trainerCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Trainers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">
                          {gym.yearsStrong}+
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Years Strong
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: pricing card */}
              <div className="md:w-56 flex-shrink-0">
                <div className="border border-border rounded-2xl p-5 space-y-3 bg-background/60">
                  <div>
                    <p className="text-xs text-muted-foreground">Starts from</p>
                    <p className="text-2xl font-bold text-foreground leading-tight">
                      ₹{gym.startingPrice.toLocaleString("en-IN")}
                      <span className="text-sm font-normal text-muted-foreground">
                        /month
                      </span>
                    </p>
                  </div>

                  {gym.applicationStatus === "none" && (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        onClick={handleApply}
                      >
                        Apply for Membership{" "}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 font-semibold"
                      >
                        View Membership Plans
                      </Button>
                    </>
                  )}

                  {gym.applicationStatus === "pending" && (
                    <>
                      <ApplicationStatusBadge status="pending" />
                      <Button disabled className="w-full opacity-60">
                        Application Pending
                      </Button>
                    </>
                  )}

                  {gym.applicationStatus === "approved" && (
                    <>
                      <ApplicationStatusBadge status="approved" />
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        Go to Dashboard{" "}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </>
                  )}

                  {gym.applicationStatus === "rejected" && (
                    <>
                      <ApplicationStatusBadge status="rejected" />
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 font-bold"
                        onClick={handleApply}
                      >
                        Apply Again
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Gallery ──────────────────────────────────── */}
        <GallerySection photos={gym.photos} />

        {/* ── About + Amenities ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* About */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">
                About This Gym
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gym.longDescription.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {gym.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {amenityIcons[amenity] ?? (
                        <Dumbbell className="w-3.5 h-3.5" />
                      )}
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Trainers ─────────────────────────────────── */}
        <TrainersSection trainers={gym.trainers} />

        {/* ── Gym Information ──────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Gym Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              {/* Col 1 */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Address
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {gym.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Phone
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {gym.contactNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Email
                    </p>
                    <p className="text-xs text-muted-foreground">{gym.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock3 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Opening Hours
                    </p>
                    {gym.openingHours.map((oh) => (
                      <p
                        key={oh.days}
                        className="text-xs text-muted-foreground mt-0.5"
                      >
                        {oh.days}: {oh.hours}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 2 + 3: Facilities grid */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                {gym.facilities.map((facility) => (
                  <div key={facility.label} className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      {facility.label === "Parking" && (
                        <ParkingCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      {facility.label === "Locker Facility" && (
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      )}
                      {facility.label === "Personal Training" && (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                      {facility.label === "Nutrition Support" && (
                        <HeartHandshake className="w-4 h-4 text-muted-foreground" />
                      )}
                      {facility.label === "WiFi" && (
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                      )}
                      {facility.label === "Steam Bath" && (
                        <Wind className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {facility.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          facility.available
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {facility.available ? "Available" : "Unavailable"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Membership Plans ─────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Membership Plans
          </h2>
          {gym.membershipPlans.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Membership plans are currently unavailable.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {gym.membershipPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200",
                    plan.isPopular
                      ? "border-primary ring-2 ring-primary/20 shadow-md bg-card"
                      : "border-border bg-card shadow-sm hover:border-primary/30 hover:shadow-md",
                  )}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                        <Star className="w-3 h-3 fill-primary-foreground" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CalendarClock className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {plan.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
                          ₹{plan.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {plan.periodLabel}
                        </span>
                        {plan.savings && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                            Save ₹{plan.savings}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
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
                    className={cn(
                      "w-full font-bold",
                      plan.isPopular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "variant-outline border border-primary text-primary bg-transparent hover:bg-primary/10",
                    )}
                    variant={plan.isPopular ? "default" : "outline"}
                  >
                    Choose Plan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Application Section ──────────────────────── */}
        <ApplicationSection gym={gym} onApply={handleApply} />
      </div>
    </div>
  );
}
