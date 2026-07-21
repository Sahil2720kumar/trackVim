"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  X,
  Trash2,
  Eye,
  Pencil,
  Calendar,
} from "lucide-react";
import {
  type Trainer,
  specializationOptions,
  statusOptions,
} from "@/mock/trainers";

type TrainersTableProps = {
  initialTrainers: Trainer[];
};

export function TrainersTable({ initialTrainers }: TrainersTableProps) {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrainers, setSelectedTrainers] = useState<Set<number>>(
    new Set(),
  );

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState(
    "All Specializations",
  );
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Row action menu state
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Add trainer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "Strength Training",
  });

  const itemsPerPage = 5;

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

  // Filter and search logic
  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      const matchesSearch =
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.phone.includes(searchQuery);

      const matchesStatus =
        !selectedStatus || trainer.status === selectedStatus;
      const matchesSpecialization =
        specializationFilter === "All Specializations" ||
        trainer.specialization === specializationFilter;

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [trainers, searchQuery, selectedStatus, specializationFilter]);

  // Pagination logic
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Busy":
        return "bg-yellow-100 text-yellow-700";
      case "On Leave":
        return "bg-purple-100 text-purple-700";
      case "Offline":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const toggleTrainerSelection = (id: number) => {
    const newSelected = new Set(selectedTrainers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTrainers(newSelected);
  };

  const toggleAllSelection = () => {
    if (
      paginatedTrainers.length > 0 &&
      paginatedTrainers.every((t) => selectedTrainers.has(t.id))
    ) {
      const newSelected = new Set(selectedTrainers);
      paginatedTrainers.forEach((t) => newSelected.delete(t.id));
      setSelectedTrainers(newSelected);
    } else {
      const newSelected = new Set(selectedTrainers);
      paginatedTrainers.forEach((t) => newSelected.add(t.id));
      setSelectedTrainers(newSelected);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const resetAdvancedFilters = () => {
    setSpecializationFilter("All Specializations");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Specialization",
      "Experience",
      "Members",
      "Today Sessions",
      "Rating",
      "Status",
    ];
    const rows = filteredTrainers.map((t) => [
      t.name,
      t.email,
      t.phone,
      t.specialization,
      `${t.experience} years`,
      t.assignedMembers,
      t.todaySessions,
      t.rating.toFixed(1),
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

  const handleAddTrainer = () => {
    if (!newTrainer.name.trim() || !newTrainer.email.trim()) return;

    const initials = newTrainer.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const trainer: Trainer = {
      id: Math.max(0, ...trainers.map((t) => t.id)) + 1,
      name: newTrainer.name,
      email: newTrainer.email,
      phone: newTrainer.phone || "—",
      avatar: initials || "NA",
      specialization: newTrainer.specialization,
      experience: 0,
      assignedMembers: 0,
      todaySessions: 0,
      rating: 0,
      status: "Active",
    };

    setTrainers((prev) => [trainer, ...prev]);
    setShowAddModal(false);
    setNewTrainer({
      name: "",
      email: "",
      phone: "",
      specialization: "Strength Training",
    });
    setCurrentPage(1);
  };

  const handleDeleteTrainer = (id: number) => {
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
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
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
                <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-64 max-w-[85vw] bg-card border border-border rounded-lg shadow-lg p-4 z-20">
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

            {/* Add Trainer Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Trainer</span>
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

      {/* Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className=" overflow-x-auto">
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
                  Specialization
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Experience
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Members
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Today
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {trainer.avatar}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {trainer.name}
                          </p>

                          <p className="text-xs text-muted-foreground truncate">
                            {trainer.email}
                          </p>

                          <p className="text-xs text-muted-foreground truncate">
                            {trainer.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                        {trainer.specialization}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {trainer.experience} years
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {trainer.assignedMembers}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {trainer.todaySessions}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-500">★</span>

                        <span className="text-sm font-medium text-foreground">
                          {trainer.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          trainer.status,
                        )}`}
                      >
                        {trainer.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId((id) =>
                            id === trainer.id ? null : trainer.id,
                          )
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {openActionMenuId === trainer.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-6 top-10 w-40 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                        >
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                            <Eye className="w-4 h-4" />
                            View Profile
                          </button>

                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left">
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </button>

                          <button
                            onClick={() => handleDeleteTrainer(trainer.id)}
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

      {/* Pagination */}
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

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Add New Trainer
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={newTrainer.name}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, name: e.target.value })
                  }
                  placeholder="Enter trainer name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, email: e.target.value })
                  }
                  placeholder="Enter email"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newTrainer.phone}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Specialization
                </label>
                <select
                  value={newTrainer.specialization}
                  onChange={(e) =>
                    setNewTrainer({
                      ...newTrainer,
                      specialization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {specializationOptions.slice(1).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrainer}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Add Trainer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
