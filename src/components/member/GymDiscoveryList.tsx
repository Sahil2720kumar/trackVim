"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Building2,
  BadgeCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export type GymMembershipStatus =
  | "PaymentPending"
  | "PaymentUploaded"
  | "PaymentRejected"
  | "Active"
  | "Expired"
  | "Cancelled"
  | "Frozen";

export type SelectedPlan = {
  id: string;
  name: string;
  planPrice: number;
  joiningFee: number;
  finalAmount: number;
  durationMonths: number;
};

export type Gym = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  amenities: string[];
  isVerified: boolean;
  memberCount: number;
  trainerCount: number;
  priceStartingFrom: number | null;
  applicationStatus: ApplicationStatus;
  membershipStatus: GymMembershipStatus | null;
  selectedPlan: SelectedPlan | null;
  logoUrl: string | null;
};

type FilterChip = "all" | "verified";
type PriceRangeFilter =
  | "All Prices"
  | "Under ₹1000"
  | "₹1000 - ₹1500"
  | "Above ₹1500";
type SortOption = "Recommended" | "Price: Low to High" | "Most Members";

const priceRangeOptions: PriceRangeFilter[] = [
  "Under ₹1000",
  "₹1000 - ₹1500",
  "Above ₹1500",
];
const sortOptions: SortOption[] = ["Price: Low to High", "Most Members"];

function formatMemberCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const AVATAR_COLORS = [
  "#0F766E",
  "#B45309",
  "#4338CA",
  "#BE123C",
  "#0E7490",
  "#7C2D12",
  "#166534",
];
function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

type GymDiscoveryListProps = {
  initialGyms: Gym[];
};

const ITEMS_PER_PAGE = 4;

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
    label: "Verified",
    value: "verified",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
];

function applyHref(gymId: string, planId?: string | null) {
  return planId
    ? `/member/discover/${gymId}/apply?planId=${planId}`
    : `/member/discover/${gymId}/apply`;
}

function GymLogo({ gym }: { gym: Gym }) {
  if (gym.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={gym.logoUrl}
        alt={gym.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 object-cover"
      />
    );
  }
  return (
    <div
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white font-bold text-xs tracking-wider"
      style={{ backgroundColor: colorForName(gym.name) }}
    >
      <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 mb-1 opacity-80" />
      <span className="text-[10px] sm:text-xs leading-none">
        {initialsForName(gym.name)}
      </span>
    </div>
  );
}

function ApplicationBadge({
  status,
  membershipStatus,
}: {
  status: ApplicationStatus;
  membershipStatus: GymMembershipStatus | null;
}) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Pending Approval
      </span>
    );
  if (status === "approved") {
    if (membershipStatus === "Active")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          <BadgeCheck className="w-3 h-3" />
          Member
        </span>
      );
    if (membershipStatus === "PaymentUploaded")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
          Payment Under Review
        </span>
      );
    if (membershipStatus === "PaymentRejected")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          Payment Declined
        </span>
      );
    if (
      membershipStatus === "Expired" ||
      membershipStatus === "Cancelled" ||
      membershipStatus === "Frozen"
    )
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          {membershipStatus}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        Approved — Payment Pending
      </span>
    );
  }
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Application Declined
      </span>
    );
  return null;
}

function PriceOrPlan({ gym }: { gym: Gym }) {
  if (gym.selectedPlan) {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-0.5">
          {gym.selectedPlan.name}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight">
          ₹{gym.selectedPlan.planPrice.toLocaleString("en-IN")}
          <span className="text-sm font-normal text-muted-foreground">
            /{gym.selectedPlan.durationMonths}mo
          </span>
        </p>
        {gym.selectedPlan.joiningFee > 0 && (
          <p className="text-sm font-normal text-muted-foreground">
            Joining Fee: ₹{gym.selectedPlan.joiningFee.toLocaleString("en-IN")}
          </p>
        )}
      </>
    );
  }
  return (
    <>
      <p className="text-xs text-muted-foreground mb-0.5">Starts from</p>
      <p className="text-xl font-bold text-foreground leading-tight">
        {gym.priceStartingFrom != null ? (
          <>
            ₹{gym.priceStartingFrom.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </>
        ) : (
          <span className="text-sm font-normal text-muted-foreground">
            Contact gym
          </span>
        )}
      </p>
    </>
  );
}

function ActionSection({
  gym,
  onApply,
}: {
  gym: Gym;
  onApply: (id: string, planId?: string | null) => void;
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 w-full sm:min-w-[180px] sm:w-auto">
      <div className="flex items-center justify-between sm:block">
        <div>
          <PriceOrPlan gym={gym} />
        </div>
        <div className="flex sm:hidden">
          <ApplicationBadge
            status={gym.applicationStatus}
            membershipStatus={gym.membershipStatus}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <ApplicationBadge
          status={gym.applicationStatus}
          membershipStatus={gym.membershipStatus}
        />
      </div>

      {gym.applicationStatus === "none" && (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onApply(gym.id, null);
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

      {gym.applicationStatus === "approved" &&
        gym.membershipStatus === "Active" && (
          <Button
            size="sm"
            disabled
            className="w-full mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
          >
            Already Joined
          </Button>
        )}

      {gym.applicationStatus === "approved" &&
        (gym.membershipStatus === "PaymentPending" ||
          gym.membershipStatus === "PaymentRejected") && (
          <>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onApply(gym.id, gym.selectedPlan?.id);
              }}
            >
              {gym.membershipStatus === "PaymentRejected"
                ? "Re-upload Payment"
                : "Complete Payment"}
            </Button>
            {gym.membershipStatus === "PaymentRejected" && (
              <p className="text-[11px] text-muted-foreground text-center">
                Your last payment was declined.
              </p>
            )}
          </>
        )}

      {gym.applicationStatus === "approved" &&
        gym.membershipStatus === "PaymentUploaded" && (
          <>
            <Button
              size="sm"
              disabled
              className="w-full mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            >
              Payment Under Review
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              We&apos;ll notify you once verified.
            </p>
          </>
        )}

      {gym.applicationStatus === "approved" &&
        (gym.membershipStatus === "Expired" ||
          gym.membershipStatus === "Cancelled" ||
          gym.membershipStatus === "Frozen") && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-1 border-primary text-primary hover:bg-primary/10 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onApply(gym.id, gym.selectedPlan?.id);
            }}
          >
            Renew Membership
          </Button>
        )}

      {gym.applicationStatus === "rejected" && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-1 border-primary text-primary hover:bg-primary/10 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onApply(gym.id, gym.selectedPlan?.id);
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
  onViewDetails,
}: {
  gym: Gym;
  onApply: (id: string, planId?: string | null) => void;
  onViewDetails: (id: string) => void;
}) {
  return (
    <Link asChild href={`/member/discover/${gym.id}/`}>
      <div
        onClick={() => onViewDetails(gym.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onViewDetails(gym.id);
        }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:border-primary/40 hover:bg-muted/30 transition-colors duration-150 cursor-pointer group"
      >
        <div className="flex gap-4 flex-1 min-w-0">
          <GymLogo gym={gym} />

          <div className="flex-1 min-w-0">
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

            {gym.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                {gym.city}
              </div>
            )}

            {gym.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {gym.description}
              </p>
            )}

            {gym.amenities.length > 0 && (
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
            )}

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

        <div className="hidden sm:flex flex-col justify-between items-end pl-4 border-l border-border">
          <ActionSection gym={gym} onApply={onApply} />
        </div>

        <div className="sm:hidden pt-3 border-t border-border">
          <ActionSection gym={gym} onApply={onApply} />
        </div>
      </div>
    </Link>
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

export function GymDiscoveryList({ initialGyms }: GymDiscoveryListProps) {
  const [gyms, setGyms] = useState<Gym[]>(initialGyms);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [priceFilter, setPriceFilter] =
    useState<PriceRangeFilter>("All Prices");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");

  useEffect(() => {
    setGyms(initialGyms);
  }, [initialGyms]);

  const activeFilterCount =
    (priceFilter !== "All Prices" ? 1 : 0) + (sortBy !== "Recommended" ? 1 : 0);

  const resetAdvancedFilters = () => {
    setPriceFilter("All Prices");
    setSortBy("Recommended");
    setCurrentPage(1);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/member/discover/${id}/`);
  };

  const handleApply = (id: string, planId?: string | null) => {
    router.push(applyHref(id, planId));
  };

  const filteredGyms = useMemo(() => {
    let result = gyms;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.city ?? "").toLowerCase().includes(q),
      );
    }

    if (activeFilter === "verified") {
      result = result.filter((g) => g.isVerified);
    }

    if (priceFilter === "Under ₹1000") {
      result = result.filter(
        (g) => g.priceStartingFrom != null && g.priceStartingFrom < 1000,
      );
    } else if (priceFilter === "₹1000 - ₹1500") {
      result = result.filter(
        (g) =>
          g.priceStartingFrom != null &&
          g.priceStartingFrom >= 1000 &&
          g.priceStartingFrom <= 1500,
      );
    } else if (priceFilter === "Above ₹1500") {
      result = result.filter(
        (g) => g.priceStartingFrom != null && g.priceStartingFrom > 1500,
      );
    }

    if (sortBy === "Price: Low to High") {
      result = [...result].sort(
        (a, b) =>
          (a.priceStartingFrom ?? Infinity) - (b.priceStartingFrom ?? Infinity),
      );
    } else if (sortBy === "Most Members") {
      result = [...result].sort((a, b) => b.memberCount - a.memberCount);
    }

    return result;
  }, [gyms, searchQuery, activeFilter, priceFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGyms.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGyms = filteredGyms.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0 py-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gyms by name or location..."
            className="pl-10 h-10 rounded-xl border-border bg-card text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>

        <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="relative gap-2 px-4 h-12 rounded-xl text-sm font-normal"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                Advanced filters
              </h4>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Price Range
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => {
                    setPriceFilter(e.target.value as PriceRangeFilter);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All Prices">All Prices</option>
                  {priceRangeOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Recommended">Recommended</option>
                  {sortOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetAdvancedFilters}
                className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Reset filters
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
        {filterChips.map((chip) => (
          <button
            key={chip.value}
            onClick={() => {
              setActiveFilter(chip.value);
              setCurrentPage(1);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 flex-shrink-0",
              activeFilter === chip.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
            )}
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-y-3">
        {paginatedGyms.length === 0 ? (
          gyms.length === 0 ? (
            <EmptyState type="no-gyms" />
          ) : (
            <EmptyState
              type="no-results"
              onClear={() => {
                setSearchQuery("");
                setActiveFilter("all");
                resetAdvancedFilters();
              }}
            />
          )
        ) : (
          paginatedGyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIdx + 1}–
              {Math.min(startIdx + ITEMS_PER_PAGE, filteredGyms.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredGyms.length}
            </span>{" "}
            gyms
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item as number)}
                    className={`min-w-[36px] h-9 px-3 border rounded-lg text-sm font-medium transition-colors ${
                      item === currentPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {totalPages <= 1 && filteredGyms.length > 0 && (
        <p className="text-sm text-muted-foreground px-1">
          {filteredGyms.length} gym{filteredGyms.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
