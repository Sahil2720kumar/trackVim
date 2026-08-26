"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
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
  IndianRupee,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { MemberRow, MemberWithAttendance } from "@/services/owner.query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { daysBetween, formatDateStr } from "@/lib/utils";
import { getInitials } from "@/lib/application-status";
import {
  useMembersWithAttendance,
  useGymMemberStats,
  useTrainersAndPlans,
} from "@/hooks/queries/owner.query";

const statusOptions = ["All", "Active", "Expired", "Expiring Soon", "Pending"];
const memberTypeOptions = ["All Types", "Normal", "WalkIn"] as const;

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

const getMemberTypeColor = (memberType: MemberRow["memberType"]) =>
  memberType === "WalkIn"
    ? "bg-purple-100 text-purple-700"
    : "bg-sky-100 text-sky-700";

// ─── Data transforms (moved from the server page — now run client-side) ───

function resolveStatus(member: MemberWithAttendance): MemberRow["status"] {
  if (!member.membership) return "Pending";

  switch (member.membershipStatus) {
    case "PaymentPending":
    case "PaymentUploaded":
    case "PaymentRejected":
    case "Scheduled":
      return "Pending";
    case "Expired":
      return "Expired";
    case "Active": {
      const daysLeft = daysBetween(member.membership.end_date);
      return daysLeft <= 7 ? "Expiring Soon" : "Active";
    }
    default:
      return "Pending";
  }
}

function toMemberRow(member: MemberWithAttendance): MemberRow {
  const membership = member.membership;

  return {
    id: member.id,
    name: member.full_name,
    email: member.contact_email ?? "—",
    phone: member.contact_phone ?? "—",
    avatar: getInitials(member.full_name),
    memberType: member.memberType,
    plan: membership?.plan?.plan_name ?? "No Plan",
    planPrice:
      membership?.final_amount != null
        ? `₹${membership.final_amount.toLocaleString("en-IN")}`
        : "—",
    trainer: member.trainer?.full_name ?? "Unassigned",
    joined: membership?.start_date ? formatDateStr(membership.start_date) : "—",
    expiry: membership?.end_date ? formatDateStr(membership.end_date) : "—",
    daysLeft: membership?.end_date ? daysBetween(membership.end_date) : 0,
    attendance: Math.round(member.attendanceRate),
    status: resolveStatus(member),
  };
}

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function MembersTableSkeleton() {
  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
        ))}
      </section>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-[124px] w-full rounded-lg" />
      </div>

      <div className="mt-4 sm:mt-6">
        <Skeleton className="h-[520px] w-full rounded-lg" />
      </div>
    </>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function MembersTableError({
  message,
  onRetry,
  retrying,
}: {
  message: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col items-center text-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Couldn't load members{message ? `: ${message}` : "."}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {retrying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

export function MembersTable() {
  const router = useRouter();

  const {
    data: membersResponse,
    isLoading: membersLoading,
    isError: membersIsError,
    isFetching: membersFetching,
    error: membersError,
    refetch: refetchMembers,
  } = useMembersWithAttendance();

  const {
    data: statsResponse,
    isFetching: statsFetching,
    isError: statsIsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useGymMemberStats();

  const {
    data: trainersPlansResponse,
    isFetching: trainersPlansFetching,
    isError: trainersPlansIsError,
    error: trainersPlansError,
    refetch: refetchTrainersPlans,
  } = useTrainersAndPlans();

  // Members is the core dataset the page can't render without. Stats and
  // trainers/plans degrade gracefully to defaults/empty arrays.
  const isLoading = membersLoading;
  const isError = membersIsError || statsIsError || trainersPlansIsError;
  const isFetching = membersFetching || statsFetching || trainersPlansFetching;

  const refetchAll = () => {
    refetchMembers();
    refetchStats();
    refetchTrainersPlans();
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [trainerFilter, setTrainerFilter] = useState("All Trainers");
  const [memberTypeFilter, setMemberTypeFilter] =
    useState<(typeof memberTypeOptions)[number]>("All Types");

  const itemsPerPage = 5;

  const handleAddMember = () => router.push("/owner/members/new");
  const handleViewMember = (id: string) => router.push(`/owner/members/${id}`);
  const handleEditMember = () =>
    toast.error("Edit function is not implemented yet");
  const handleDeleteMember = () =>
    toast.error("Delete function is not implemented yet");

  const members: MemberRow[] = useMemo(() => {
    if (!membersResponse) return [];
    return membersResponse.map(toMemberRow);
  }, [membersResponse]);

  const stats = statsResponse
    ? statsResponse
    : {
        totalMembers: 0,
        activeMembers: 0,
        expiringSoon: 0,
        pendingPayments: 0,
        pendingAmount: 0,
      };

  const trainers = trainersPlansResponse?.trainers ?? [];
  const plans = trainersPlansResponse?.plans ?? [];

  const trainerOptions = ["All Trainers", ...trainers.map((t) => t.full_name)];
  const planOptions = ["All Plans", ...plans.map((p) => p.plan_name)];

  // Added: was referenced below in the status filter pills but never defined.
  const statusOptions = useMemo(() => {
    const all = new Set<string>();
    members.forEach((m) => all.add(m.status));
    return ["All", ...Array.from(all)];
  }, [members]);

  const activePct =
    stats.totalMembers > 0
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0;

  // Filter and search logic (runs before the table ever sees the data)
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
      const matchesMemberType =
        memberTypeFilter === "All Types" ||
        member.memberType === memberTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan &&
        matchesTrainer &&
        matchesMemberType
      );
    });
  }, [
    members,
    searchQuery,
    selectedStatus,
    planFilter,
    trainerFilter,
    memberTypeFilter,
  ]);

  const activeFilterCount =
    (planFilter !== "All Plans" ? 1 : 0) +
    (trainerFilter !== "All Trainers" ? 1 : 0) +
    (memberTypeFilter !== "All Types" ? 1 : 0);

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Member Type",
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
      m.memberType,
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

  const columns = useMemo<ColumnDef<MemberRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => {
          const member = row.original;
          return (
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
          );
        },
      },
      {
        accessorKey: "memberType",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getMemberTypeColor(
              row.original.memberType,
            )}`}
          >
            {row.original.memberType}
          </span>
        ),
      },
      {
        accessorKey: "plan",
        header: "Membership",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground text-sm">
              {row.original.plan}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.planPrice}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "trainer",
        header: "Trainer",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">{row.original.trainer}</p>
        ),
      },
      {
        accessorKey: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">{row.original.joined}</p>
        ),
      },
      {
        accessorKey: "expiry",
        header: "Expiry",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div>
              <p className="text-sm text-foreground">{member.expiry}</p>
              <p
                className={`text-xs font-medium ${
                  member.daysLeft > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {member.daysLeft > 0
                  ? `(${member.daysLeft} days left)`
                  : "(Today)"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "attendance",
        header: "Attendance",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 min-w-[60px]">
              <div
                className="bg-green-600 rounded-full h-2 transition-all"
                style={{ width: `${row.original.attendance}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              {row.original.attendance}%
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              row.original.status,
            )}`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => handleViewMember(member.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditMember}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteMember}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  const table = useReactTable({
    data: filteredMembers,
    columns,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: itemsPerPage } },
  });

  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.getState().pagination;
  const startIdx = pageIndex * pageSize;
  const totalPages = table.getPageCount();
  const safePage = pageIndex + 1;

  const resetAdvancedFilters = () => {
    setPlanFilter("All Plans");
    setTrainerFilter("All Trainers");
    setMemberTypeFilter("All Types");
    table.setPageIndex(0);
  };

  if (isLoading) {
    return <MembersTableSkeleton />;
  }

  if (isError) {
    const firstError = membersError ?? statsErrorObj ?? trainersPlansError;
    return (
      <MembersTableError
        message={firstError instanceof Error ? firstError.message : null}
        onRetry={refetchAll}
        retrying={isFetching}
      />
    );
  }

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Members"
          value={stats.totalMembers}
          subtitle="All-time roster"
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Users}
          title="Active Members"
          value={stats.activeMembers}
          subtitle={`${activePct}% of total members`}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Expiring Soon"
          value={stats.expiringSoon}
          subtitle="Within 7 days"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          icon={IndianRupee}
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle={`₹${stats.pendingAmount.toLocaleString("en-IN")}`}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                table.setPageIndex(0);
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
                        table.setPageIndex(0);
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
                        table.setPageIndex(0);
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

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Member Type
                    </label>
                    <select
                      value={memberTypeFilter}
                      onChange={(e) => {
                        setMemberTypeFilter(
                          e.target.value as (typeof memberTypeOptions)[number],
                        );
                        table.setPageIndex(0);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {memberTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetAdvancedFilters}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Member</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status === "All" ? null : status);
                table.setPageIndex(0);
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
      <div className="bg-card border border-border rounded-lg overflow-hidden mt-4 sm:mt-6">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 hover:bg-muted/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-foreground mb-2">
                        No Members Found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {rows.length > 0 ? (
            rows.map((row) => {
              const member = row.original;
              return (
                <div key={row.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="shrink-0"
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => handleViewMember(member.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleEditMember}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDeleteMember}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${getMemberTypeColor(
                          member.memberType,
                        )}`}
                      >
                        {member.memberType}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-foreground truncate">{member.plan}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Trainer</p>
                      <p className="text-foreground truncate">
                        {member.trainer}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-foreground truncate">
                        {member.joined}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Expiry</p>
                      <p className="text-foreground truncate">
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
              );
            })
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

      {filteredMembers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to{" "}
            {Math.min(startIdx + pageSize, filteredMembers.length)} of{" "}
            {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
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
                    onClick={() => table.setPageIndex(page - 1)}
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

            <span className="sm:hidden text-sm font-medium text-foreground px-2 whitespace-nowrap">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
