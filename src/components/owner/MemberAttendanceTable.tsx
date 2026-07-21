"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type AttendanceRecord,
  attendanceStatusOptions,
  attendanceMonthOptions,
  attendanceYearOptions,
} from "@/mock/membersAttendance";

type MemberAttendanceTableProps = {
  initialRecords: AttendanceRecord[];
};

const ITEMS_PER_PAGE = 10;

function getStatusBadge(status: string) {
  switch (status) {
    case "Present":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
          <CheckCircle className="w-3 h-3" />
          Present
        </Badge>
      );
    case "Absent":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1">
          <XCircle className="w-3 h-3" />
          Absent
        </Badge>
      );
    case "Late":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1">
          <Clock className="w-3 h-3" />
          Late
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function MemberAttendanceTable({
  initialRecords,
}: MemberAttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filter popover
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [yearFilter, setYearFilter] = useState("All Years");
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

  const filteredRecords = useMemo(() => {
    return initialRecords.filter((record) => {
      const matchesSearch =
        record.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.checkIn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !selectedStatus || record.status === selectedStatus;

      const matchesMonth =
        monthFilter === "All Months" ||
        record.date.toLowerCase().includes(monthFilter.toLowerCase().slice(0, 3));

      const matchesYear =
        yearFilter === "All Years" || record.date.includes(yearFilter);

      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });
  }, [initialRecords, searchQuery, selectedStatus, monthFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const activeFilterCount =
    (monthFilter !== "All Months" ? 1 : 0) +
    (yearFilter !== "All Years" ? 1 : 0);

  const resetAdvancedFilters = () => {
    setMonthFilter("All Months");
    setYearFilter("All Years");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ["Date", "Check In", "Check Out", "Duration", "Status", "Notes"];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.checkIn,
      r.checkOut,
      r.duration,
      r.status,
      r.notes,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters — mirrors MembersTable layout */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search attendance..."
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
                        Month
                      </label>
                      <select
                        value={monthFilter}
                        onChange={(e) => {
                          setMonthFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="All Months">All Months</option>
                        {attendanceMonthOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Year
                      </label>
                      <select
                        value={yearFilter}
                        onChange={(e) => {
                          setYearFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="All Years">All Years</option>
                        {attendanceYearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
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

        {/* Quick Status Filter Pills — same pattern as MembersTable */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {attendanceStatusOptions.map((status) => (
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

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sm text-foreground">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {record.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {record.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {record.duration}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                      {record.notes}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground text-sm"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {paginatedRecords.length > 0 ? (
            paginatedRecords.map((record) => (
              <div key={record.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {record.date}
                    </p>
                    {record.notes !== "—" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Check In</p>
                    <p>{record.checkIn}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Check Out</p>
                    <p>{record.checkOut}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-0.5">Duration</p>
                    <p>{record.duration}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No attendance records found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredRecords.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredRecords.length}
            </span>{" "}
            records
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

      {/* Record count when single page */}
      {totalPages <= 1 && filteredRecords.length > 0 && (
        <p className="text-sm text-muted-foreground px-1">
          {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
