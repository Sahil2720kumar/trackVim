"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  type Member,
  planOptions,
  trainerOptions,
  statusOptions,
} from "@/mock/members";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type MembersTableProps = {
  initialMembers: Member[];
};

export function MembersTable({ initialMembers }: MembersTableProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(
    new Set(),
  );

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [trainerFilter, setTrainerFilter] = useState("All Trainers");

  // Row action menu state (which row's menu is open)
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Add member modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "Silver Plan",
    trainer: "Rahul Sharma",
  });

  const itemsPerPage = 5;

  // Close action menu on outside click (Popover manages its own outside-click)
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

  // Filter and search logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);

      const matchesStatus = !selectedStatus || member.status === selectedStatus;
      const matchesPlan =
        planFilter === "All Plans" || member.plan === planFilter;
      const matchesTrainer =
        trainerFilter === "All Trainers" || member.trainer === trainerFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesTrainer;
    });
  }, [members, searchQuery, selectedStatus, planFilter, trainerFilter]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(
    startIdx,
    startIdx + itemsPerPage,
  );

  const activeFilterCount =
    (planFilter !== "All Plans" ? 1 : 0) +
    (trainerFilter !== "All Trainers" ? 1 : 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-red-100 text-red-700";
      case "Expiring Soon":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const toggleMemberSelection = (id: number) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const toggleAllSelection = () => {
    if (
      paginatedMembers.length > 0 &&
      paginatedMembers.every((m) => selectedMembers.has(m.id))
    ) {
      const newSelected = new Set(selectedMembers);
      paginatedMembers.forEach((m) => newSelected.delete(m.id));
      setSelectedMembers(newSelected);
    } else {
      const newSelected = new Set(selectedMembers);
      paginatedMembers.forEach((m) => newSelected.add(m.id));
      setSelectedMembers(newSelected);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const resetAdvancedFilters = () => {
    setPlanFilter("All Plans");
    setTrainerFilter("All Trainers");
    setCurrentPage(1);
  };

  // Export filtered members to CSV and trigger a download
  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Plan",
      "Trainer",
      "Joined",
      "Expiry",
      "Attendance",
      "Status",
    ];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.email,
      m.phone,
      m.plan,
      m.trainer,
      m.joined,
      m.expiry,
      `${m.attendance}%`,
      m.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "members-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    const initials = newMember.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const planPriceMap: Record<string, string> = {
      "Gold Plan": "₹2,000/month",
      "Silver Plan": "₹1,500/month",
      "Premium Plan": "₹2,500/month",
    };

    const today = new Date();
    const joined = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const expiryDate = new Date(today);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const expiry = expiryDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const daysLeft = Math.round(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const member: Member = {
      id: Math.max(0, ...members.map((m) => m.id)) + 1,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || "—",
      avatar: initials || "NA",
      plan: newMember.plan,
      planPrice: planPriceMap[newMember.plan] || "",
      trainer: newMember.trainer,
      joined,
      expiry,
      daysLeft,
      attendance: 0,
      status: "Pending",
    };

    setMembers((prev) => [member, ...prev]);
    setShowAddModal(false);
    setNewMember({
      name: "",
      email: "",
      phone: "",
      plan: "Silver Plan",
      trainer: "Rahul Sharma",
    });
    setCurrentPage(1);
  };

  const handleDeleteMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setOpenActionMenuId(null);
  };

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
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
                      Plan
                    </label>
                    <select
                      value={planFilter}
                      onChange={(e) => {
                        setPlanFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {planOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Trainer
                    </label>
                    <select
                      value={trainerFilter}
                      onChange={(e) => {
                        setTrainerFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {trainerOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
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

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Member</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status === "All" ? null : status);
                setCurrentPage(1);
              }}
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

      {/* Members Table (desktop/tablet) + Cards (mobile) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedMembers.length > 0 &&
                      paginatedMembers.every((m) => selectedMembers.has(m.id))
                    }
                    onChange={toggleAllSelection}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {member.plan}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.planPrice}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {member.trainer}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{member.joined}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-foreground">
                          {member.expiry}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            member.daysLeft > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {member.daysLeft > 0
                            ? `(${member.daysLeft} days left)`
                            : "(Today)"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-600 rounded-full h-2 transition-all"
                            style={{ width: `${member.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {member.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          member.status,
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId((id) =>
                            id === member.id ? null : member.id,
                          )
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {openActionMenuId === member.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-6 top-10 w-36 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-foreground mb-2">
                        No Members Found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-border">
          {paginatedMembers.length > 0 ? (
            paginatedMembers.map((member) => (
              <div key={member.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="w-4 h-4 rounded border-border cursor-pointer shrink-0"
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.phone}
                      </p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setOpenActionMenuId((id) =>
                          id === member.id ? null : member.id,
                        )
                      }
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {openActionMenuId === member.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 top-10 w-36 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenActionMenuId(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => setOpenActionMenuId(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-foreground truncate">{member.plan}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Trainer</p>
                    <p className="text-foreground truncate">{member.trainer}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-foreground truncate">{member.joined}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Expiry</p>
                    <p className="text-foreground truncate">{member.expiry}</p>
                    <p
                      className={`text-xs font-medium ${
                        member.daysLeft > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {member.daysLeft > 0
                        ? `${member.daysLeft} days left`
                        : "Today"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 rounded-full h-2 transition-all"
                      style={{ width: `${member.attendance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground shrink-0">
                    {member.attendance}%
                  </span>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    member.status,
                  )}`}
                >
                  {member.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">
                No Members Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to{" "}
            {Math.min(startIdx + itemsPerPage, filteredMembers.length)} of{" "}
            {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numbered pages: shown from sm breakpoint up */}
            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Only show first, last, current, and neighbors; collapse the rest
                const isEdge = page === 1 || page === totalPages;
                const isNear = Math.abs(page - safePage) <= 1;
                if (!isEdge && !isNear) {
                  if (page === safePage - 2 || page === safePage + 2) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === safePage
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Compact page indicator on mobile */}
            <span className="sm:hidden text-sm font-medium text-foreground px-2 whitespace-nowrap">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Add member
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
                  Full name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Ananya Rao"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Phone
                </label>
                <input
                  type="text"
                  value={newMember.phone}
                  onChange={(e) =>
                    setNewMember((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+91 90000 00000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Plan
                  </label>
                  <select
                    value={newMember.plan}
                    onChange={(e) =>
                      setNewMember((p) => ({ ...p, plan: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Gold Plan</option>
                    <option>Silver Plan</option>
                    <option>Premium Plan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Trainer
                  </label>
                  <select
                    value={newMember.trainer}
                    onChange={(e) =>
                      setNewMember((p) => ({ ...p, trainer: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Rahul Sharma</option>
                    <option>Priya Mehta</option>
                    <option>Aman Verma</option>
                  </select>
                </div>
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
                onClick={handleAddMember}
                disabled={!newMember.name.trim() || !newMember.email.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add member
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
