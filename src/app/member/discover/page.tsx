"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Star,
  Users,
  Dumbbell,
  ShieldCheck,
  Clock3,
  ChevronRight,
  Building2,
  Navigation,
  BadgeCheck,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus = "none" | "pending" | "approved" | "rejected";
type DevFilter = "all" | "none" | "pending" | "approved" | "rejected";
type FilterChip = "all" | "nearby" | "verified" | "open";

interface Gym {
  id: string;
  name: string;
  logoText: string;
  logoColor: string;
  rating: number;
  reviewCount: number;
  city: string;
  distance: number;
  description: string;
  priceStartingFrom: number;
  isVerified: boolean;
  isOpen: boolean;
  trainerCount: number;
  memberCount: number;
  amenities: string[];
  applicationStatus: ApplicationStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_GYMS: Gym[] = [
  {
    id: "1",
    name: "IronForge Fitness",
    logoText: "IRONFORGE",
    logoColor: "#7c3aed",
    rating: 4.8,
    reviewCount: 326,
    city: "Downtown, Bangalore",
    distance: 2.3,
    description:
      "Premium fitness facility with state-of-the-art equipment, expert trainers and personalized programs.",
    priceStartingFrom: 1499,
    isVerified: true,
    isOpen: true,
    trainerCount: 12,
    memberCount: 1250,
    amenities: ["Strength", "Cardio", "CrossFit", "Yoga", "Zumba"],
    applicationStatus: "none",
  },
  {
    id: "2",
    name: "Peak Performance Gym",
    logoText: "PEAK",
    logoColor: "#d97706",
    rating: 4.6,
    reviewCount: 218,
    city: "Koramangala, Bangalore",
    distance: 3.6,
    description:
      "Build strength, improve endurance and achieve your fitness goals with our professional support.",
    priceStartingFrom: 1299,
    isVerified: true,
    isOpen: true,
    trainerCount: 10,
    memberCount: 980,
    amenities: ["Strength", "Cardio", "MMA", "Functional", "Steam"],
    applicationStatus: "none",
  },
  {
    id: "3",
    name: "Flex Fitness Studio",
    logoText: "FLEX",
    logoColor: "#16a34a",
    rating: 4.5,
    reviewCount: 156,
    city: "HSR Layout, Bangalore",
    distance: 4.1,
    description:
      "A friendly neighbourhood gym with modern equipment and certified trainers.",
    priceStartingFrom: 999,
    isVerified: true,
    isOpen: false,
    trainerCount: 8,
    memberCount: 650,
    amenities: ["Strength", "Cardio", "Yoga", "Dance", "Nutrition"],
    applicationStatus: "pending",
  },
  {
    id: "4",
    name: "Powerhouse Gym",
    logoText: "POWER",
    logoColor: "#dc2626",
    rating: 4.9,
    reviewCount: 412,
    city: "Indiranagar, Bangalore",
    distance: 1.8,
    description:
      "Elite training facility for serious athletes and fitness enthusiasts.",
    priceStartingFrom: 1699,
    isVerified: true,
    isOpen: true,
    trainerCount: 15,
    memberCount: 2100,
    amenities: ["Strength", "Cardio", "Powerlifting", "CrossFit", "Sauna"],
    applicationStatus: "approved",
  },
  {
    id: "5",
    name: "Form Fitness",
    logoText: "FORM",
    logoColor: "#0891b2",
    rating: 4.3,
    reviewCount: 98,
    city: "Jayanagar, Bangalore",
    distance: 5.2,
    description:
      "Transform your lifestyle with expert guidance, group classes and personalized training.",
    priceStartingFrom: 1199,
    isVerified: true,
    isOpen: true,
    trainerCount: 6,
    memberCount: 420,
    amenities: ["Yoga", "Cardio", "Strength", "Pilates", "Aerobics"],
    applicationStatus: "rejected",
  },
  {
    id: "6",
    name: "CoreZone Fitness",
    logoText: "CORE",
    logoColor: "#be185d",
    rating: 4.2,
    reviewCount: 74,
    city: "Whitefield, Bangalore",
    distance: 7.4,
    description:
      "Functional training and core conditioning in a motivating community environment.",
    priceStartingFrom: 899,
    isVerified: false,
    isOpen: true,
    trainerCount: 5,
    memberCount: 310,
    amenities: ["Functional", "Cardio", "Yoga", "HIIT"],
    applicationStatus: "none",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
  return `${count}+`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GymLogo({ gym }: { gym: Gym }) {
  return (
    <div
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white font-bold text-xs tracking-wider shadow-md"
      style={{ backgroundColor: gym.logoColor }}
    >
      <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 mb-1 opacity-80" />
      <span className="text-[8px] sm:text-[9px] leading-none">
        {gym.logoText}
      </span>
    </div>
  );
}

function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Pending Approval
      </span>
    );
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <BadgeCheck className="w-3 h-3" />
        Member
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Application Declined
      </span>
    );
  return null;
}

function OpenStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        isOpen
          ? "bg-emerald-100 text-emerald-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full inline-block",
          isOpen ? "bg-emerald-500" : "bg-muted-foreground",
        )}
      />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

function ActionSection({
  gym,
  onApply,
}: {
  gym: Gym;
  onApply: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 w-full sm:min-w-[180px] sm:w-auto">
      <div className="flex items-center justify-between sm:block">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Starts from</p>
          <p className="text-xl font-bold text-foreground leading-tight">
            ₹{gym.priceStartingFrom.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </p>
        </div>
        <div className="flex sm:hidden flex-col items-end gap-1.5">
          <OpenStatusBadge isOpen={gym.isOpen} />
          <ApplicationBadge status={gym.applicationStatus} />
        </div>
      </div>

      <div className="hidden sm:block">
        <OpenStatusBadge isOpen={gym.isOpen} />
      </div>
      <div className="hidden sm:block">
        <ApplicationBadge status={gym.applicationStatus} />
      </div>

      {gym.applicationStatus === "none" && (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onApply(gym.id);
          }}
        >
          Apply Now <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {gym.applicationStatus === "pending" && (
        <>
          <Button
            size="sm"
            disabled
            className="w-full mt-1 bg-muted text-muted-foreground cursor-not-allowed"
          >
            Application Pending
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            We&apos;ll notify you once approved.
          </p>
        </>
      )}

      {gym.applicationStatus === "approved" && (
        <>
          <Button
            size="sm"
            disabled
            className="w-full mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
          >
            Already Joined
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            You are a member of this gym.
          </p>
        </>
      )}

      {gym.applicationStatus === "rejected" && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-1 border-primary text-primary hover:bg-primary/10 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onApply(gym.id);
            }}
          >
            Apply Again
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Your previous application was declined.
          </p>
        </>
      )}
    </div>
  );
}

function GymCard({
  gym,
  onApply,
}: {
  gym: Gym;
  onApply: (id: string) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
      {/* Logo + center details row (always side-by-side, even on mobile) */}
      <div className="flex gap-4 flex-1 min-w-0">
        <GymLogo gym={gym} />

        <div className="flex-1 min-w-0">
          {/* Name + verified */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {gym.name}
            </h3>
            {gym.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2 flex-wrap">
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-foreground font-semibold">
                {gym.rating}
              </span>
              <span className="text-muted-foreground">
                ({gym.reviewCount} Reviews)
              </span>
            </span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {gym.city}
            </span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {gym.distance} km away
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {gym.description}
          </p>

          {/* Amenity chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {gym.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-2.5 py-0.5 rounded-full border border-border text-xs text-foreground bg-muted/50 font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {formatMemberCount(gym.memberCount)} Members
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5" />
              {gym.trainerCount} Trainers
            </span>
          </div>
        </div>
      </div>

      {/* Desktop/tablet actions */}
      <div className="hidden sm:flex flex-col justify-between items-end pl-4 border-l border-border">
        <ActionSection gym={gym} onApply={onApply} />
      </div>

      {/* Mobile actions — now a true full-width block below the row above */}
      <div className="sm:hidden pt-3 border-t border-border">
        <ActionSection gym={gym} onApply={onApply} />
      </div>
    </div>
  );
}

function EmptyState({
  type,
  onClear,
}: {
  type: "no-gyms" | "no-results";
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8 text-muted-foreground" />
      </div>
      {type === "no-gyms" ? (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No gyms available
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            There are currently no gyms available in your area. Please check
            back later.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No gyms found
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-4">
            Try a different search term or clear your filters.
          </p>
          <Button variant="outline" onClick={onClear} size="sm">
            Clear Filters
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [gyms, setGyms] = useState<Gym[]>(INITIAL_GYMS);
  const [devFilter, setDevFilter] = useState<DevFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");

  // Dev controls — simulate different application states
  const applyDevFilter = (filter: DevFilter) => {
    setDevFilter(filter);
    setGyms(
      INITIAL_GYMS.map((g, i) => ({
        ...g,
        applicationStatus:
          filter === "all"
            ? g.applicationStatus
            : filter === "none"
              ? "none"
              : filter === "pending"
                ? (["pending", "none", "pending", "none", "pending", "none"][
                    i
                  ] as ApplicationStatus)
                : filter === "approved"
                  ? "approved"
                  : "rejected",
      })),
    );
  };

  const handleApply = (id: string) => {
    setGyms((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, applicationStatus: "pending" as ApplicationStatus }
          : g,
      ),
    );
  };

  const filteredGyms = useMemo(() => {
    let result = gyms;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) || g.city.toLowerCase().includes(q),
      );
    }

    // Chip filter
    if (activeFilter === "nearby") {
      result = result.filter((g) => g.distance <= 3.5);
    } else if (activeFilter === "verified") {
      result = result.filter((g) => g.isVerified);
    } else if (activeFilter === "open") {
      result = result.filter((g) => g.isOpen);
    }

    return result;
  }, [gyms, searchQuery, activeFilter]);

  const devButtons: { label: string; value: DevFilter }[] = [
    { label: "All", value: "all" },
    { label: "Not Applied", value: "none" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const filterChips: {
    label: string;
    value: FilterChip;
    icon: React.ReactNode;
  }[] = [
    {
      label: "All",
      value: "all",
      icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
    },
    {
      label: "Nearby",
      value: "nearby",
      icon: <Navigation className="w-3.5 h-3.5" />,
    },
    {
      label: "Verified",
      value: "verified",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      label: "Open Now",
      value: "open",
      icon: <Clock3 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* ── Development Controls ─────────────────────── */}
        {/* <div className="flex items-center gap-2 flex-wrap bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Development Controls
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {devButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => applyDevFilter(btn.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                  devFilter === btn.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
                )}
              >
                {btn.label === "Pending" && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    {btn.label}
                  </span>
                )}
                {btn.label === "Approved" && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {btn.label}
                  </span>
                )}
                {btn.label === "Rejected" && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    {btn.label}
                  </span>
                )}
                {btn.label !== "Pending" &&
                  btn.label !== "Approved" &&
                  btn.label !== "Rejected" &&
                  btn.label}
              </button>
            ))}
          </div>
        </div> */}

        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                Discover Gyms
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Find the perfect gym and apply for membership.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm flex-shrink-0 self-start">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">42</span>
            <span className="text-sm text-muted-foreground">Gyms Found</span>
          </div>
        </div>

        {/* ── Search ───────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gyms by name or location..."
            className="pl-10 h-12 rounded-xl border-border bg-card shadow-sm text-sm focus-visible:ring-primary"
          />
        </div>

        {/* ── Filter Chips ─────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 flex-shrink-0",
                activeFilter === chip.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
              )}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>

        {/* ── Gym Cards ────────────────────────────────── */}
        <div className="space-y-3">
          {filteredGyms.length === 0 ? (
            gyms.length === 0 ? (
              <EmptyState type="no-gyms" />
            ) : (
              <EmptyState
                type="no-results"
                onClear={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              />
            )
          ) : (
            filteredGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} onApply={handleApply} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
