"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  type Payment,
  downloadTextFile,
  exportCSV,
  receiptText,
  getStatusBadgeClasses,
  monthOptions,
  methodOptions,
  statusOptions,
  PAGE_SIZE,
} from "@/mock/memberPayments";
import { toast } from "sonner";

type MemberPaymentsTableProps = {
  payments: Payment[];
};

export function MemberPaymentsTable({ payments }: MemberPaymentsTableProps) {
  // ---- filter state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Row action menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close filter popover on outside click
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

  // ---- filtering + pagination ----
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.id.toLowerCase().includes(term) ||
        p.collectedBy.toLowerCase().includes(term) ||
        p.date.toLowerCase().includes(term);
      const matchesMethod =
        methodFilter === "All Methods" || p.method === methodFilter;
      const matchesStatus =
        statusFilter === "All Status" || p.status === statusFilter;
      const pMonth = p.date.split(" ").slice(1).join(" ");
      const matchesMonth =
        monthFilter === "All Months" || pMonth === monthFilter;
      return matchesSearch && matchesMethod && matchesStatus && matchesMonth;
    });
  }, [payments, searchTerm, methodFilter, statusFilter, monthFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagePayments = filteredPayments.slice(startIdx, startIdx + PAGE_SIZE);

  const activeFilterCount =
    (methodFilter !== "All Methods" ? 1 : 0) +
    (monthFilter !== "All Months" ? 1 : 0);

  function onResendReceipt(payment: Payment) {
    console.log(payment);
  }

  function resetAdvancedFilters() {
    setMethodFilter("All Methods");
    setMonthFilter("All Months");
    setCurrentPage(1);
  }

  function handleExportPayments() {
    exportCSV(filteredPayments, "payments.csv");
    toast.success("Payments exported as payments.csv");
  }

  function handleDownloadReceipt(p: Payment) {
    downloadTextFile(`${p.id}-receipt.txt`, receiptText(p));
    setOpenMenuId(null);
    toast.success(`Receipt for ${p.id} downloaded`);
  }

  function handleResendReceipt(p: Payment) {
    setOpenMenuId(null);
    onResendReceipt(p);
  }

  return (
    <>
      {/* Search + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search payment..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
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
                        {monthOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
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
              onClick={handleExportPayments}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs — status */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payment History Table */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
          Payment History
        </h2>
        <div className="w-full overflow-x-auto rounded-lg border">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] whitespace-nowrap">
                  Invoice ID
                </TableHead>
                <TableHead className="min-w-[110px] whitespace-nowrap">
                  Date
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap">
                  Amount
                </TableHead>
                <TableHead className="min-w-[150px] whitespace-nowrap">
                  Payment Method
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="min-w-[140px] whitespace-nowrap">
                  Collected By
                </TableHead>
                <TableHead className="min-w-[80px] whitespace-nowrap text-center">
                  Receipt
                </TableHead>
                <TableHead className="min-w-[80px] whitespace-nowrap text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagePayments.length > 0 ? (
                pagePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {payment.id}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.date}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.amount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.method}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={getStatusBadgeClasses(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.collectedBy}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleDownloadReceipt(payment)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        title="Download receipt"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </TableCell>
                    <TableCell className="relative text-right">
                      <button
                        onClick={() =>
                          setOpenMenuId((id) =>
                            id === payment.id ? null : payment.id,
                          )
                        }
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === payment.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border bg-card py-1 text-left shadow-md">
                            <button
                              onClick={() => handleDownloadReceipt(payment)}
                              className="block w-full px-3 py-2 text-sm hover:bg-muted"
                            >
                              Download Receipt
                            </button>
                            <button
                              onClick={() => handleResendReceipt(payment)}
                              className="block w-full px-3 py-2 text-sm hover:bg-muted"
                            >
                              Resend Receipt
                            </button>
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No payment records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {filteredPayments.length === 0
              ? "No records found"
              : `Showing ${startIdx + 1} to ${Math.min(
                  startIdx + PAGE_SIZE,
                  filteredPayments.length,
                )} of ${filteredPayments.length} records`}
          </p>
          <div className="flex items-center justify-center gap-1 sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === safePage ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
