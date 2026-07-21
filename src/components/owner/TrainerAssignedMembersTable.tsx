"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  X,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type AssignedMember,
  initialAssignedMembers,
  assignedMemberPlanOptions,
  assignedMemberStatusOptions,
  assignedMemberProgressOptions,
} from "@/mock/trainerAssignedMembers";

type TrainerAssignedMembersTableProps = {
  initialMembers?: AssignedMember[];
};

const ITEMS_PER_PAGE = 10;

const getPlanBadgeColor = (plan: string) => {
  switch (plan) {
    case "Gold Plan":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "Premium Plan":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "Silver Plan":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getProgressColor = (progress: string) => {
  switch (progress) {
    case "Excellent":
      return "bg-emerald-500";
    case "Good":
      return "bg-blue-500";
    case "Average":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};

export function TrainerAssignedMembersTable({
  initialMembers = initialAssignedMembers,
}: TrainerAssignedMembersTableProps) {
  const [members] = useState<AssignedMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setShowFilterPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.plan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !selectedStatus || member.status === selectedStatus;
      const matchesPlan =
        planFilter === "All Plans" || member.plan === planFilter;
      const matchesProgress =
        progressFilter === "All Progress" || member.progress === progressFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesProgress;
    });
  }, [members, searchQuery, selectedStatus, planFilter, progressFilter]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  const activeFilterCount =
    (planFilter !== "All Plans" ? 1 : 0) +
    (progressFilter !== "All Progress" ? 1 : 0);

  const resetAdvancedFilters = () => {
    setPlanFilter("All Plans");
    setProgressFilter("All Progress");
    setCurrentPage(1);
  };

  // Export filtered members to CSV
  const handleExport = () => {
    const headers = [
      "Member Name",
      "Plan",
      "Attendance Rate (%)",
      "Progress",
      "Join Date",
      "Status",
    ];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.plan,
      `${m.attendance}%`,
      m.progress,
      m.joinDate,
      m.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "assigned-members-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {/* Card Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-lg text-foreground">
          Assigned Members
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 sm:w-auto"
        >
          View All Members
        </Button>
      </div>

      {/* Search and Filters Header — mirrors MembersTable layout */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assigned members..."
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
                        {assignedMemberPlanOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Progress
                      </label>
                      <select
                        value={progressFilter}
                        onChange={(e) => {
                          setProgressFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        {assignedMemberProgressOptions.map((pr) => (
                          <option key={pr} value={pr}>
                            {pr}
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
          </div>
        </div>

        {/* Quick Filter Status Pills — matches MembersTable */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {assignedMemberStatusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status === "All Status" ? null : status);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                (status === "All Status" && !selectedStatus) ||
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

      {/* Table Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {member.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanBadgeColor(member.plan)}>
                        {member.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-muted rounded overflow-hidden">
                          <div
                            className={`h-full rounded ${getProgressColor(member.progress)}`}
                            style={{ width: `${member.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {member.attendance}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          member.progress === "Excellent"
                            ? "bg-emerald-100 text-emerald-700"
                            : member.progress === "Good"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {member.progress}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.joinDate}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Sessions</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground text-sm"
                  >
                    No assigned members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {paginatedMembers.length > 0 ? (
            paginatedMembers.map((member) => (
              <div key={member.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {member.joinDate}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Sessions</DropdownMenuItem>
                      <DropdownMenuItem>Message</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge className={getPlanBadgeColor(member.plan)}>
                    {member.plan}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${
                      member.progress === "Excellent"
                        ? "bg-emerald-100 text-emerald-700"
                        : member.progress === "Good"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {member.progress}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    {member.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted-foreground">Attendance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${getProgressColor(member.progress)}`}
                        style={{ width: `${member.attendance}%` }}
                      />
                    </div>
                    <span className="font-medium text-foreground">
                      {member.attendance}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No assigned members found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredMembers.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{" "}
            members
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
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
                      item === safePage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Alias export for flexibility
export const TrainerAssignedMembersTables = TrainerAssignedMembersTable;
