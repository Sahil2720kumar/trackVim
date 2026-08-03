"use client";

import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  X,
  Copy,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { bigSquareButton } from "@/lib/styles";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DURATION_OPTIONS } from "@/constants/plan-options";
import {
  // toggleMembershipPlanStatusAction,
  deleteMembershipPlanAction,
  // duplicateMembershipPlanAction,
} from "@/actions/owner.action";
import { Database } from "@/db/database.types";

// Row type from generated Supabase types, plus the count-aggregate embed
// getMembershipPlans adds via `gym_memberships(count)`.
type MembershipPlan =
  Database["public"]["Tables"]["membership_plans"]["Row"] & {
    gym_memberships: { count: number }[];
  };

type PlansGridProps = {
  initialPlans: MembershipPlan[];
};

const PRICE_FILTERS = [
  "All Prices",
  "Under ₹1000",
  "₹1000 - ₹3000",
  "Above ₹3000",
];

export function PlansGrid({ initialPlans }: PlansGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [durationFilter, setDurationFilter] = useState("All Durations");
  const [priceFilter, setPriceFilter] = useState("All Prices");

  // Card action menu state (which card's menu is open)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Keep local list in sync if the server re-renders this with fresh data
  // (e.g. after revalidatePath from one of the card actions).
  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  // Close action menu on outside click (Popover handles its own outside-click)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setOpenActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchesDuration = (plan: MembershipPlan) =>
    durationFilter === "All Durations" ||
    plan.membership_duration === durationFilter;

  const matchesPrice = (plan: MembershipPlan) => {
    const price = Number(plan.plan_price);
    if (priceFilter === "All Prices") return true;
    if (priceFilter === "Under ₹1000") return price < 1000;
    if (priceFilter === "₹1000 - ₹3000") return price >= 1000 && price <= 3000;
    if (priceFilter === "Above ₹3000") return price > 3000;
    return true;
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.plan_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || plan.status === selectedStatus;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDuration(plan) &&
        matchesPrice(plan)
      );
    });
  }, [plans, searchQuery, selectedStatus, durationFilter, priceFilter]);

  const activeFilterCount =
    (durationFilter !== "All Durations" ? 1 : 0) +
    (priceFilter !== "All Prices" ? 1 : 0);

  const resetAdvancedFilters = () => {
    setDurationFilter("All Durations");
    setPriceFilter("All Prices");
  };

  const handleExport = () => {
    const headers = ["Name", "Price", "Duration", "Active Members", "Status"];
    const rows = filteredPlans.map((p) => [
      p.plan_name,
      p.plan_price,
      p.membership_duration,
      p.gym_memberships?.[0]?.count ?? 0,
      p.status,
    ]);
    const escapeCsv = (value: unknown) => {
      const str = String(value ?? "");
      const guarded = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${guarded.replace(/"/g, '""')}"`;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plans-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // const handleDuplicatePlan = (id: string) => {
  //   setOpenActionMenuId(null);
  //   startTransition(async () => {
  //     const result = await duplicateMembershipPlanAction(id);
  //     if (!result.success) {
  //       toast.error(result.error ?? "Failed to duplicate plan.");
  //       return;
  //     }
  //     toast.success("Plan duplicated as a draft.");
  //     router.refresh();
  //   });
  // };

  // const handleToggleStatus = (plan: MembershipPlan) => {
  //   setOpenActionMenuId(null);
  //   const nextStatus = plan.status === "Active" ? "Hidden" : "Active";
  //   // Optimistic update so the badge flips immediately.
  //   setPlans((prev) =>
  //     prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p)),
  //   );
  //   startTransition(async () => {
  //     const result = await toggleMembershipPlanStatusAction(
  //       plan.id,
  //       nextStatus,
  //     );
  //     if (!result.success) {
  //       toast.error(result.error ?? "Failed to update plan status.");
  //       setPlans((prev) =>
  //         prev.map((p) => (p.id === plan.id ? { ...p, status: plan.status } : p)),
  //       );
  //       return;
  //     }
  //     router.refresh();
  //   });
  // };

  // const handleDeletePlan = (id: string) => {
  //   setOpenActionMenuId(null);
  //   const previous = plans;
  //   setPlans((prev) => prev.filter((p) => p.id !== id));
  //   startTransition(async () => {
  //     const result = await deleteMembershipPlanAction(id);
  //     if (!result.success) {
  //       toast.error(result.error ?? "Failed to delete plan.");
  //       setPlans(previous);
  //       return;
  //     }
  //     toast.success("Plan deleted.");
  //     router.refresh();
  //   });
  // };

  const getStatusColor = (status: string) =>
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Hidden"
        ? "bg-gray-100 text-gray-700"
        : "bg-amber-100 text-amber-700"; // Draft

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search membership plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button + Popover */}
            <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 max-w-[85vw] p-4" align="end">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Advanced filters
                  </h4>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Duration
                    </label>
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>All Durations</option>
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Price
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {PRICE_FILTERS.map((p) => (
                        <option key={p}>{p}</option>
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

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Add Plan Button */}
            <button
              onClick={() => router.push("/owner/plans/new")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">New Plan</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs (Status) */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {["All", "Active", "Draft", "Hidden"].map((status) => (
            <button
              key={status}
              onClick={() =>
                setSelectedStatus(status === "All" ? null : status)
              }
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                (status === "All" && !selectedStatus) ||
                status === selectedStatus
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="my-6 sm:my-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Your Membership Plans
        </h2>
        {filteredPlans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">
              No Plans Found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => {
              const allFeatures = [
                ...(plan.selected_features ?? []),
                ...(plan.custom_features ?? []),
              ];

              return (
                <div
                  key={plan.id}
                  className="flex flex-col bg-card border border-border rounded-lg p-5"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {plan.plan_name}
                      </h3>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        ₹{Number(plan.plan_price).toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / {plan.membership_duration}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      {plan.is_featured && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                          Featured
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setOpenActionMenuId((id) =>
                            id === plan.id ? null : plan.id,
                          )
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {openActionMenuId === plan.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-0 top-10 w-44 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                        >
                          <button
                            disabled={isPending}
                            // onClick={() => handleDuplicatePlan(plan.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left disabled:opacity-50"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate Plan
                          </button>
                          <button
                            disabled={isPending}
                            // onClick={() => handleToggleStatus(plan)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {plan.status === "Active" ? "Hide" : "Activate"}
                          </button>
                          <button
                            disabled={isPending}
                            // onClick={() => handleDeletePlan(plan.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`w-fit px-3 py-1 rounded-full text-xs font-medium mb-3 ${getStatusColor(
                      plan.status,
                    )}`}
                  >
                    {plan.status}
                  </span>

                  <p className="text-sm text-muted-foreground">
                    {plan.short_description}
                  </p>

                  {allFeatures.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Features
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {allFeatures.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-border text-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="my-4 border-t border-border" />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">
                        {plan.duration_months} mo
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-medium text-foreground">
                        {plan.gym_memberships?.[0]?.count ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joining Fee</p>
                      <p className="font-medium text-foreground">
                        ₹{Number(plan.joining_fee ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enrollment</p>
                      <p className="font-medium text-foreground">
                        {plan.enrollment_mode ?? "Open"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2 mt-auto">
                    <Button
                      onClick={() => router.push(`/owner/plans/${plan.id}`)}
                      className={` flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors`}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/owner/plans/${plan.id}/edit`)
                      }
                      className={` flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium`}
                    >
                      Edit Plan
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
