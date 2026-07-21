"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { type Plan } from "@/mock/plans";
import { bigSquareButton } from "@/lib/styles";

type PlansGridProps = {
  initialPlans: Plan[];
};

export function PlansGrid({ initialPlans }: PlansGridProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [durationFilter, setDurationFilter] = useState("All Durations");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Card action menu state (which card's menu is open)
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Add plan modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", price: "" });

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setShowFilterPanel(false);
      }
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

  const matchesDuration = (plan: Plan) => {
    if (durationFilter === "All Durations") return true;
    if (durationFilter === "Monthly")
      return plan.duration.toLowerCase() === "month";
    if (durationFilter === "Quarterly")
      return plan.duration.toLowerCase().includes("3");
    return true;
  };

  const matchesPrice = (plan: Plan) => {
    if (priceFilter === "All Prices") return true;
    if (priceFilter === "Under ₹1000") return plan.price < 1000;
    if (priceFilter === "₹1000 - ₹3000")
      return plan.price >= 1000 && plan.price <= 3000;
    if (priceFilter === "Above ₹3000") return plan.price > 3000;
    return true;
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.name
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
    const headers = ["Name", "Price", "Duration", "Members", "Status"];
    const rows = filteredPlans.map((p) => [
      p.name,
      p.price,
      p.duration,
      p.planDetails.members,
      p.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
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

  const handleDuplicatePlan = (id: number) => {
    const source = plans.find((p) => p.id === id);
    if (!source) return;
    const duplicate: Plan = {
      ...source,
      id: Math.max(0, ...plans.map((p) => p.id)) + 1,
      name: `${source.name} (Copy)`,
      badge: null,
      stats: { revenue: 0, renewals: 0, newMembers: 0 },
      planDetails: { ...source.planDetails, members: 0 },
    };
    setPlans((prev) => [duplicate, ...prev]);
    setOpenActionMenuId(null);
  };

  const handleToggleStatus = (id: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" }
          : p,
      ),
    );
    setOpenActionMenuId(null);
  };

  const handleDeletePlan = (id: number) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setOpenActionMenuId(null);
  };

  const handleAddPlan = () => {
    if (!newPlan.name.trim() || !newPlan.price.trim()) return;

    const plan: Plan = {
      id: Math.max(0, ...plans.map((p) => p.id)) + 1,
      name: newPlan.name,
      badge: null,
      price: Number(newPlan.price) || 0,
      duration: "Month",
      description: "",
      features: [],
      planDetails: {
        duration: "1 Month",
        members: 0,
        joiningFee: 0,
        renewalPeriod: "Monthly",
      },
      stats: { revenue: 0, renewals: 0, newMembers: 0 },
      status: "Active",
    };

    setPlans((prev) => [plan, ...prev]);
    setShowAddModal(false);
    setNewPlan({ name: "", price: "" });
  };

  const getStatusColor = (status: string) =>
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

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
            <div className="relative" ref={filterPanelRef}>
              <button
                onClick={() => setShowFilterPanel((v) => !v)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors relative"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden xs:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilterPanel && (
                <div className="absolute right-0 mt-2 w-64 max-w-[85vw] bg-card border border-border rounded-lg shadow-lg p-4 z-20">
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
                        <option>Monthly</option>
                        <option>Quarterly</option>
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
                        <option>All Prices</option>
                        <option>Under ₹1000</option>
                        <option>₹1000 - ₹3000</option>
                        <option>Above ₹3000</option>
                      </select>
                    </div>

                    <button
                      onClick={resetAdvancedFilters}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}
            </div>

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
              onClick={() => setShowAddModal(true)}
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
          {["All", "Active", "Inactive"].map((status) => (
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
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col bg-card border border-border rounded-lg p-5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      ₹{plan.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / {plan.duration}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    {plan.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        {plan.badge}
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
                          onClick={() => handleDuplicatePlan(plan.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate Plan
                        </button>
                        <button
                          onClick={() => handleToggleStatus(plan.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {plan.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600"
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
                  {plan.description}
                </p>

                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feature) => (
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

                <div className="my-4 border-t border-border" />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {plan.planDetails.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-medium text-foreground">
                      {plan.planDetails.members}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joining Fee</p>
                    <p className="font-medium text-foreground">
                      ₹{plan.planDetails.joiningFee}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renewal</p>
                    <p className="font-medium text-foreground">
                      {plan.planDetails.renewalPeriod}
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-border" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-foreground">
                      ₹{(plan.stats.revenue / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renewals</p>
                    <p className="font-semibold text-foreground">
                      {plan.stats.renewals}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">New Members</p>
                    <p className="font-semibold text-foreground">
                      {plan.stats.newMembers}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className={`${bigSquareButton} flex-1 border border-border hover:bg-muted transition-colors`}
                  >
                    View Details
                  </button>
                  <button
                    className={`${bigSquareButton} flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium`}
                  >
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Add new plan
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Plan name
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Elite Plan"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlan}
                disabled={!newPlan.name.trim() || !newPlan.price.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
