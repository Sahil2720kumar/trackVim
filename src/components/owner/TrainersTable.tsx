"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  Pencil,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { TrainerRow } from "@/lib/queries/trainers";
import { useRouter } from "next/navigation";

type TrainersTableProps = {
  initialTrainers: TrainerRow[];
};

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Invited: "bg-blue-100 text-blue-700",
  Inactive: "bg-gray-100 text-gray-700",
  "On Leave": "bg-purple-100 text-purple-700",
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

function getInitials(name: string | null) {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TrainersTable({ initialTrainers }: TrainersTableProps) {
  const [trainers, setTrainers] = useState<TrainerRow[]>(initialTrainers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrainers, setSelectedTrainers] = useState<Set<string>>(
    new Set(),
  );

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState(
    "All Specializations",
  );
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const router = useRouter();
  const itemsPerPage = 5;

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainers.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginatedTrainers = filteredTrainers.slice(
    startIdx,
    startIdx + itemsPerPage,
  );

  const activeFilterCount =
    specializationFilter !== "All Specializations" ? 1 : 0;

  const toggleTrainerSelection = (id: string) => {
    const next = new Set(selectedTrainers);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedTrainers(next);
  };

  const toggleAllSelection = () => {
    const allSelected =
      paginatedTrainers.length > 0 &&
      paginatedTrainers.every((t) => selectedTrainers.has(t.id));
    const next = new Set(selectedTrainers);
    paginatedTrainers.forEach((t) =>
      allSelected ? next.delete(t.id) : next.add(t.id),
    );
    setSelectedTrainers(next);
  };

  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const resetAdvancedFilters = () => {
    setSpecializationFilter("All Specializations");
    setCurrentPage(1);
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
      .map((row) => row.map((val) => `"${val}"`).join(","))
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

  // TODO: wire to a server action (deleteTrainer) — currently local-only
  const handleDeleteTrainer = (id: string) => {
    setTrainers((prev) => prev.filter((t) => t.id !== id));
    setSelectedTrainers((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setOpenActionMenuId(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trainers..."
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
                        setCurrentPage(1);
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

            {/* "Add Trainer" now likely goes through an invite flow (clerkInvitationId, invitedEmail
                on the schema) rather than a raw insert — wire this to that action separately. */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium">
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Invite Trainer</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status === "All" ? null : status);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                selectedStatus === (status === "All" ? null : status)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedTrainers.length > 0 &&
                      paginatedTrainers.every((t) => selectedTrainers.has(t.id))
                    }
                    onChange={toggleAllSelection}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Specializations
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Members Trained
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Rating
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
              {paginatedTrainers.length > 0 ? (
                paginatedTrainers.map((trainer) => (
                  <tr
                    key={trainer.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTrainers.has(trainer.id)}
                        onChange={() => toggleTrainerSelection(trainer.id)}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(trainer.specializations ?? []).map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {trainer.experience_years ?? 0} years
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {trainer.members_trained ?? 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium text-foreground">
                          {Number(trainer.average_rating ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trainer.status)}`}
                      >
                        {trainer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <DropdownMenu
                        open={openActionMenuId === trainer.id}
                        onOpenChange={(open) =>
                          setOpenActionMenuId(open ? trainer.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/owner/trainers/${trainer.id}`)
                            }
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
                            onClick={() => handleDeleteTrainer(trainer.id)}
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-foreground mb-2">
                        No Trainers Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedTrainers.length > 0 ? startIdx + 1 : 0} to{" "}
          {Math.min(startIdx + itemsPerPage, filteredTrainers.length)} of{" "}
          {filteredTrainers.length} trainers
        </p>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum =
              Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pageNum === safePage
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </>
  );
}
