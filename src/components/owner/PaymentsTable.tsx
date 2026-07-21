"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Receipt,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  FileDown,
  CheckCircle2,
  Bell,
} from "lucide-react";
import {
  type Payment,
  planOptions,
  methodOptions,
  statusOptions,
} from "@/mock/payments";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type PaymentsTableProps = {
  initialPayments: Payment[];
};

export function PaymentsTable({ initialPayments }: PaymentsTableProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Row action menu state (which row's menu is open)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

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
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.phone.includes(searchQuery);

      const matchesStatus =
        !selectedStatus || payment.status === selectedStatus;
      const matchesPlan =
        planFilter === "All Plans" || payment.plan === planFilter;
      const matchesMethod =
        methodFilter === "All Methods" || payment.method === methodFilter;
      const matchesDateRange = (!dateFrom && !dateTo) || true; // date comparison left as a hook point since paymentDate is a display string, not an ISO value

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan &&
        matchesMethod &&
        matchesDateRange
      );
    });
  }, [
    payments,
    searchQuery,
    selectedStatus,
    planFilter,
    methodFilter,
    dateFrom,
    dateTo,
  ]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(
    startIdx,
    startIdx + itemsPerPage,
  );

  const activeFilterCount =
    (planFilter !== "All Plans" ? 1 : 0) +
    (methodFilter !== "All Methods" ? 1 : 0) +
    (dateFrom && dateTo ? 1 : 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      case "Refunded":
        return "bg-indigo-100 text-indigo-700";
      case "Cancelled":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const resetAdvancedFilters = () => {
    setPlanFilter("All Plans");
    setMethodFilter("All Methods");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Export filtered payments to CSV and trigger a download
  const handleExport = () => {
    const headers = [
      "Receipt No",
      "Member",
      "Phone",
      "Plan",
      "Amount",
      "Method",
      "Payment Date",
      "Due Date",
      "Status",
    ];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.member,
      p.phone,
      p.plan,
      p.amount,
      p.method,
      p.paymentDate,
      p.dueDate,
      p.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMarkAsPaid = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paid" } : p)),
    );
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
              placeholder="Search member, receipt number, phone..."
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
              <PopoverContent className="w-72 max-w-[85vw] p-4" align="end">
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
                      Membership Plan
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
                      Payment Method
                    </label>
                    <select
                      value={methodFilter}
                      onChange={(e) => {
                        setMethodFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {methodOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
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

      {/* Payments Table (desktop/tablet) + Cards (mobile) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Receipt No
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Next Due
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
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground text-sm">
                        {payment.id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {payment.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {payment.member}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground text-sm">
                        ₹{payment.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {payment.method}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {payment.paymentDate}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {payment.dueDate}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId((id) =>
                            id === payment.id ? null : payment.id,
                          )
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {openActionMenuId === payment.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-6 top-10 w-44 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <FileDown className="w-4 h-4" />
                            Download Receipt
                          </button>
                          {payment.status !== "Paid" && (
                            <button
                              onClick={() => handleMarkAsPaid(payment.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-green-600"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Paid
                            </button>
                          )}
                          <button
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Bell className="w-4 h-4" />
                            Send Reminder
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
                      <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-foreground mb-2">
                        No Payments Found
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
          {paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment) => (
              <div key={payment.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                      {payment.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {payment.member}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {payment.id}
                      </p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setOpenActionMenuId((id) =>
                          id === payment.id ? null : payment.id,
                        )
                      }
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {openActionMenuId === payment.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 top-10 w-44 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenActionMenuId(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => setOpenActionMenuId(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <FileDown className="w-4 h-4" />
                          Download Receipt
                        </button>
                        {payment.status !== "Paid" && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-green-600"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Paid
                          </button>
                        )}
                        <button
                          onClick={() => setOpenActionMenuId(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Bell className="w-4 h-4" />
                          Send Reminder
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-foreground truncate">{payment.plan}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-foreground truncate">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Payment Date
                    </p>
                    <p className="text-foreground truncate">
                      {payment.paymentDate}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Next Due</p>
                    <p className="text-foreground truncate">
                      {payment.dueDate}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    payment.status,
                  )}`}
                >
                  {payment.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-foreground mb-2">
                No Payments Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to{" "}
            {Math.min(startIdx + itemsPerPage, filteredPayments.length)} of{" "}
            {filteredPayments.length} payments
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
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
    </>
  );
}
