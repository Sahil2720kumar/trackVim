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
  Trash2,
  Eye,
  Pencil,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { TrainerRow } from "@/services/owner.query";
import { useRouter } from "next/navigation";
import { useAllTrainers, useTrainerStats } from "@/hooks/queries/owner.query";
import { deleteTrainerAction } from "@/actions/owner.action";
import { ConfirmDialog, useConfirmDialog } from "../Confirmdialog";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Invited: "bg-blue-100 text-blue-700",
  Inactive: "bg-gray-100 text-gray-700",
  "On Leave": "bg-purple-100 text-purple-700",
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

// ─── Loading skeleton — flat blocks, matches DashboardSkeleton style ───────

function TrainersSkeleton() {
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

function TrainersError({
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
        Couldn't load trainers{message ? `: ${message}` : "."}
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

export function TrainersTable() {
  const router = useRouter();

  const {
    data: trainersResponse,
    isLoading: trainersLoading,
    isError: trainersIsError,
    isFetching: trainersFetching,
    error: trainersError,
    refetch: refetchTrainers,
  } = useAllTrainers();

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsIsError,
    isFetching: statsFetching,
    error: statsError,
    refetch: refetchStats,
  } = useTrainerStats();

  const isLoading = trainersLoading || statsLoading;
  const isError = trainersIsError || statsIsError;
  const isFetching = trainersFetching || statsFetching;

  const refetchAll = () => {
    refetchTrainers();
    refetchStats();
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState(
    "All Specializations",
  );

  const itemsPerPage = 5;

  const trainers: TrainerRow[] = trainersResponse ?? [];

  const stats = statsResponse
    ? statsResponse
    : {
        totalTrainers: 0,
        activeTrainers: 0,
        totalMembers: 0,
        sessionsToday: 0,
      };

  const specializationOptions = useMemo(() => {
    const all = new Set<string>();
    trainers.forEach((t) =>
      (t.specializations ?? []).forEach((s) => all.add(s)),
    );
    return ["All Specializations", ...Array.from(all)];
  }, [trainers]);

  const statusOptions = useMemo(() => {
    const all = new Set<string>();
    trainers.forEach((t) => all.add(t.status));
    return ["All", ...Array.from(all)];
  }, [trainers]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (trainer.full_name ?? "").toLowerCase().includes(q) ||
        (trainer.contact_email ?? "").toLowerCase().includes(q) ||
        (trainer.contact_phone ?? "").includes(searchQuery);

      const matchesStatus =
        !selectedStatus || trainer.status === selectedStatus;
      const matchesSpecialization =
        specializationFilter === "All Specializations" ||
        (trainer.specializations ?? []).includes(specializationFilter);

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [trainers, searchQuery, selectedStatus, specializationFilter]);

  const activeFilterCount =
    specializationFilter !== "All Specializations" ? 1 : 0;

  const resetAdvancedFilters = () => {
    setSpecializationFilter("All Specializations");
    table.setPageIndex(0);
  };

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Specializations",
      "Experience",
      "Members Trained",
      "Rating",
      "Status",
    ];
    const rows = filteredTrainers.map((t) => [
      t.full_name ?? "",
      t.contact_email ?? "",
      t.contact_phone ?? "",
      (t.specializations ?? []).join("; "),
      `${t.experience_years ?? 0} years`,
      t.members_trained ?? 0,
      t.average_rating ?? "0.0",
      t.status,
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
    link.setAttribute("download", "trainers-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteConfirm = useConfirmDialog<TrainerRow>();

  const handleDeleteTrainer = async (trainer: TrainerRow) => {
    const result = await deleteTrainerAction(trainer.id);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to remove trainer.");
    }
    toast.success(
      trainer.full_name
        ? `${trainer.full_name} was removed from the gym.`
        : "Trainer removed successfully.",
    );
    setRowSelection({});
    refetchAll();
  };

  const columns = useMemo<ColumnDef<TrainerRow>[]>(
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
        accessorKey: "full_name",
        header: "Trainer",
        cell: ({ row }) => {
          const trainer = row.original;
          return (
            <div className="flex items-center gap-3">
              {trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name ?? ""}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {getInitials(trainer.full_name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {trainer.full_name}
                </p>
                {trainer.professional_title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {trainer.professional_title}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {trainer.contact_email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "specializations",
        header: "Specializations",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.specializations ?? []).map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "experience_years",
        header: "Experience",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">
            {row.original.experience_years ?? 0} years
          </p>
        ),
      },
      {
        accessorKey: "members_trained",
        header: "Members Trained",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">
            {row.original.members_trained ?? 0}
          </p>
        ),
      },
      {
        accessorKey: "average_rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium text-foreground">
              {Number(row.original.average_rating ?? 0).toFixed(1)}
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
          const trainer = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => router.push(`/owner/trainers/${trainer.id}`)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Pencil className="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Calendar className="w-4 h-4" /> Schedule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteConfirm.request(trainer)}
                  className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
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
    data: filteredTrainers,
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

  if (isLoading) {
    return <TrainersSkeleton />;
  }

  if (isError) {
    const firstError = trainersError ?? statsError;
    return (
      <TrainersError
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
          title="Total Trainers"
          value={stats.totalTrainers}
          subtitle="At this gym"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Users}
          title="Active Trainers"
          value={stats.activeTrainers}
          subtitle="Currently working"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Users}
          title="Members Assigned"
          value={stats.totalMembers}
          subtitle="Active memberships"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Sessions Today"
          value={stats.sessionsToday}
          subtitle="Scheduled today"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trainers..."
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
              <PopoverContent className="w-64" align="start" sideOffset={8}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Advanced filters
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Specialization
                    </label>
                    <select
                      value={specializationFilter}
                      onChange={(e) => {
                        setSpecializationFilter(e.target.value);
                        table.setPageIndex(0);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {specializationOptions.map((s) => (
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

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <Button
              onClick={() => router.push("/owner/trainers/new")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Invite Trainer</span>
            </Button>
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
                  : "bg-background border border-border text-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mt-4 sm:mt-6">
        <div className="overflow-x-auto">
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
                        No Trainers Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTrainers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to{" "}
            {Math.min(startIdx + pageSize, filteredTrainers.length)} of{" "}
            {filteredTrainers.length} trainers
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

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) => !open && deleteConfirm.close()}
        title="Remove this trainer?"
        description={
          deleteConfirm.target
            ? `This will remove ${deleteConfirm.target.full_name ?? "this trainer"} from the gym. This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!deleteConfirm.target) return;
          try {
            await handleDeleteTrainer(deleteConfirm.target);
          } catch (err) {
            console.error(err);
            toast.error(
              err instanceof Error ? err.message : "Something went wrong.",
            );
            throw err;
          }
        }}
        destructive
      />
    </>
  );
}
