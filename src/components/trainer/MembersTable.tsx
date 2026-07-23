"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Member, MemberStatus } from "@/mock/trainer/members";

// ============================================================================
// Constants
// ============================================================================

const MEMBERSHIP_PLANS = [
  { value: "all", label: "All Plans" },
  { value: "premium", label: "Premium Plan" },
  { value: "gold", label: "Gold Plan" },
  { value: "basic", label: "Basic Plan" },
  { value: "platinum", label: "Platinum Plan" },
] as const;

const STATUS_PILL_OPTIONS: (MemberStatus | "All Status")[] = [
  "All Status",
  "Active",
  "On Leave",
  "Inactive",
];

const ATTENDANCE_OPTIONS = [
  { value: "all", label: "All Attendance" },
  { value: "90+", label: "90% and above" },
  { value: "70-90", label: "70% - 90%" },
  { value: "below-70", label: "Below 70%" },
] as const;

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A - Z)" },
  { value: "name-desc", label: "Name (Z - A)" },
  { value: "attendance-asc", label: "Attendance (Low to High)" },
  { value: "attendance-desc", label: "Attendance (High to Low)" },
] as const;

const STATUS_COLORS: Record<MemberStatus, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-red-50 text-red-700 border-red-200",
  Pause: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const PLAN_BADGE_STYLES: Record<string, string> = {
  "Gold Plan": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "Premium Plan": "bg-violet-100 text-violet-700 hover:bg-violet-100",
  "Basic Plan": "bg-slate-100 text-slate-700 hover:bg-slate-100",
  "Platinum Plan": "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
};

// ============================================================================
// Helper functions
// ============================================================================

const planKeyMatch: Record<string, string> = {
  premium: "Premium Plan",
  gold: "Gold Plan",
  basic: "Basic Plan",
  platinum: "Platinum Plan",
};

const filterMembers = (
  members: Member[],
  filters: {
    plan: string;
    status: MemberStatus | "All Status";
    attendance: string;
    search: string;
  },
): Member[] => {
  return members.filter((member) => {
    if (
      filters.plan !== "all" &&
      member.membershipPlan !== planKeyMatch[filters.plan]
    ) {
      return false;
    }
    if (filters.status !== "All Status" && member.status !== filters.status) {
      return false;
    }
    if (filters.attendance !== "all") {
      if (filters.attendance === "90+" && member.attendance < 90) return false;
      if (
        filters.attendance === "70-90" &&
        (member.attendance < 70 || member.attendance >= 90)
      )
        return false;
      if (filters.attendance === "below-70" && member.attendance >= 70)
        return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        member.name.toLowerCase().includes(q) ||
        member.memberId.toLowerCase().includes(q) ||
        (member.phone ?? "").includes(filters.search);
      if (!matches) return false;
    }
    return true;
  });
};

const sortMembers = (members: Member[], sortBy: string): Member[] => {
  const sorted = [...members];
  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "attendance-asc":
      return sorted.sort((a, b) => a.attendance - b.attendance);
    case "attendance-desc":
      return sorted.sort((a, b) => b.attendance - a.attendance);
    default:
      return sorted;
  }
};

// ============================================================================
// Presentational pieces
// ============================================================================

const MemberAvatar: React.FC<{ member: Member }> = ({ member }) => (
  <div className="flex items-center gap-3">
    <img
      src={member.avatarUrl}
      alt={member.name}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
    />
    <div>
      <p className="text-sm font-medium text-foreground">{member.name}</p>
      <p className="text-xs text-muted-foreground">{member.memberId}</p>
    </div>
  </div>
);

const MembershipBadge: React.FC<{ plan: string }> = ({ plan }) => (
  <Badge
    className={`rounded-full font-medium ${
      PLAN_BADGE_STYLES[plan] ??
      "bg-slate-100 text-slate-700 hover:bg-slate-100"
    }`}
  >
    {plan}
  </Badge>
);

const AttendanceBadge: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="flex flex-col items-center gap-1 w-full max-w-[100px]">
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all ${
          percentage >= 80
            ? "bg-green-500"
            : percentage >= 60
              ? "bg-amber-500"
              : "bg-red-500"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
    <p className="text-sm font-semibold text-foreground">{percentage}%</p>
  </div>
);

const MemberStatusBadge: React.FC<{ status: MemberStatus }> = ({ status }) => (
  <div
    className={`border inline-block rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_COLORS[status]}`}
  >
    {status}
  </div>
);

interface ActionMenuProps {
  member: Member;
  onViewProfile?: (member: Member) => void;
  onSendMessage?: (member: Member) => void;
  onRemoveMember?: (member: Member) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  member,
  onViewProfile,
  onSendMessage,
  onRemoveMember,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              setIsOpen(false);
              onViewProfile?.(member);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onSendMessage?.(member);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Send Message
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onRemoveMember?.(member);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-border"
          >
            <XCircle className="w-4 h-4" />
            Remove Member
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Users className="w-12 h-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2 text-center">
      {description}
    </p>
  </div>
);

interface MobileCardProps {
  member: Member;
  onViewProfile?: (member: Member) => void;
  onSendMessage?: (member: Member) => void;
  onRemoveMember?: (member: Member) => void;
}

const MobileCard: React.FC<MobileCardProps> = ({
  member,
  onViewProfile,
  onSendMessage,
  onRemoveMember,
}) => (
  <div className="bg-card border border-border rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <MemberAvatar member={member} />
      <ActionMenu
        member={member}
        onViewProfile={onViewProfile}
        onSendMessage={onSendMessage}
        onRemoveMember={onRemoveMember}
      />
    </div>

    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Membership</p>
          <MembershipBadge plan={member.membershipPlan} />
        </div>
        <MemberStatusBadge status={member.status} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Attendance</p>
        <AttendanceBadge percentage={member.attendance} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Last Session</p>
          <p className="font-medium text-foreground">{member.lastSession}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Next Session</p>
          <p className="font-medium text-foreground">{member.nextSession}</p>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Reusable MembersTable
// ============================================================================

export interface MembersTableProps {
  members: Member[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCreateButton?: boolean;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  showExportButton?: boolean;
  /** Search + filter popover + status pills. */
  showToolbar?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  /** "full" shows phone + plan validity columns; "compact" is a lean widget view (e.g. dashboard). */
  variant?: "full" | "compact";
  /** Link shown next to the title — useful for a dashboard widget. */
  viewAllHref?: string;
  onViewAllClick?: () => void;
  onViewProfile?: (member: Member) => void;
  onSendMessage?: (member: Member) => void;
  onRemoveMember?: (member: Member) => void;
  className?: string;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  title = "Members",
  subtitle,
  showHeader = true,
  showCreateButton = true,
  createButtonLabel = "Record Attendance",
  onCreateClick,
  showExportButton = true,
  showToolbar = true,
  showPagination = true,
  pageSize = 10,
  variant = "full",
  viewAllHref,
  onViewAllClick,
  onViewProfile,
  onSendMessage,
  onRemoveMember,
  className = "",
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "All Status">(
    "All Status",
  );
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const resetFilters = () => {
    setMembershipFilter("all");
    setAttendanceFilter("all");
    setSortBy("name-asc");
  };

  const activeFilterCount =
    (membershipFilter !== "all" ? 1 : 0) +
    (attendanceFilter !== "all" ? 1 : 0) +
    (sortBy !== "name-asc" ? 1 : 0);

  const filteredMembers = useMemo(() => {
    const filtered = filterMembers(members, {
      plan: membershipFilter,
      status: statusFilter,
      attendance: attendanceFilter,
      search: searchValue,
    });
    return sortMembers(filtered, sortBy);
  }, [
    members,
    membershipFilter,
    statusFilter,
    attendanceFilter,
    searchValue,
    sortBy,
  ]);

  const isCompact = variant === "compact";

  const columns = useMemo<ColumnDef<Member>[]>(() => {
    const base: ColumnDef<Member>[] = [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => <MemberAvatar member={row.original} />,
      },
      {
        accessorKey: "membershipPlan",
        header: "Membership",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex flex-col gap-1">
              <MembershipBadge plan={member.membershipPlan} />
              {!isCompact && member.planValidity && (
                <span className="text-xs text-muted-foreground">
                  {member.planValidity}
                </span>
              )}
            </div>
          );
        },
      },
    ];

    if (!isCompact) {
      base.push({
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.phone ?? "-"}
          </span>
        ),
      });
    }

    base.push(
      {
        accessorKey: "attendance",
        header: "Attendance",
        cell: ({ row }) => (
          <AttendanceBadge percentage={row.original.attendance} />
        ),
      },
      {
        accessorKey: "lastSession",
        header: "Last Session",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">
                {member.lastSession}
              </p>
              {member.lastSessionTime && (
                <p className="text-xs text-muted-foreground">
                  {member.lastSessionTime}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "nextSession",
        header: "Next Session",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">
                {member.nextSession}
              </p>
              {member.nextSessionTime && (
                <p className="text-xs text-muted-foreground">
                  {member.nextSessionTime}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ActionMenu
              member={row.original}
              onViewProfile={onViewProfile}
              onSendMessage={onSendMessage}
              onRemoveMember={onRemoveMember}
            />
          </div>
        ),
      },
    );

    return base;
  }, [isCompact, onViewProfile, onSendMessage, onRemoveMember]);

  const table = useReactTable({
    data: filteredMembers,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <a
                href={viewAllHref}
                onClick={onViewAllClick}
                className="text-sm text-primary hover:text-primary/80"
              >
                View All
              </a>
            )}
            {showExportButton && (
              <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            {showCreateButton && (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{createButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar: search + filter popover + status pills */}
      {showToolbar && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative gap-2 px-3 sm:px-4 py-2 h-auto text-sm font-normal"
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
                        Membership Plan
                      </label>
                      <select
                        value={membershipFilter}
                        onChange={(e) => setMembershipFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        {MEMBERSHIP_PLANS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Attendance
                      </label>
                      <select
                        value={attendanceFilter}
                        onChange={(e) => setAttendanceFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        {ATTENDANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
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
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={resetFilters}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Reset filters
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              {showExportButton && !showHeader && (
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {STATUS_PILL_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">
              {filteredMembers.length} members
            </span>
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8">
                    <EmptyState
                      title="No members found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden space-y-3">
        {filteredMembers.length > 0 ? (
          filteredMembers
            .slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize,
            )
            .map((member) => (
              <MobileCard
                key={member.id}
                member={member}
                onViewProfile={onViewProfile}
                onSendMessage={onSendMessage}
                onRemoveMember={onRemoveMember}
              />
            ))
        ) : (
          <EmptyState
            title="No members found"
            description="Try adjusting your search or filter criteria."
          />
        )}
      </div>

      {/* Pagination */}
      {showPagination && filteredMembers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              filteredMembers.length,
            )}{" "}
            of {filteredMembers.length} members
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(table.getPageCount())].map((_, idx) => (
              <button
                key={idx}
                onClick={() => table.setPageIndex(idx)}
                className={`w-8 h-8 rounded-lg border transition-colors ${
                  idx === pagination.pageIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-gray-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((p) => ({
                  ...p,
                  pageSize: Number(e.target.value),
                  pageIndex: 0,
                }))
              }
              className="px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersTable;
