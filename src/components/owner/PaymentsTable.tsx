"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
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
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getInitials } from "@/lib/utils";
import { RecordPaymentDialog } from "@/components/owner/payments/RecordPaymentDialog";
import {
  recordWalkinPaymentAction,
  verifyPaymentAction,
} from "@/actions/owner.action";
import type { PaymentRow } from "@/services/owner.query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  PendingVerification: "Pending Verification",
  Rejected: "Rejected",
  Verified: "Verified",
};

const QUICK_STATUS_TABS = [
  "All",
  "Pending",
  "PendingVerification",
  "Rejected",
  "Verified",
];
const METHOD_OPTIONS = [
  "All Methods",
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Net Banking",
  "Razorpay",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Verified":
      return "bg-green-100 text-green-700";
    case "Pending":
    case "PendingVerification":
      return "bg-yellow-100 text-yellow-700";
    case "Overdue":
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Refunded":
      return "bg-indigo-100 text-indigo-700";
    case "Cancelled":
    case "Partial":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

type PaymentsTableProps = {
  gymId: string;
  initialPayments: PaymentRow[];
};

export function PaymentsTable({ gymId, initialPayments }: PaymentsTableProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isVerifying, startVerifying] = useTransition();
  const [recordDialogPaymentId, setRecordDialogPaymentId] = useState<
    string | null
  >(null);

  // Advanced filter popover state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const itemsPerPage = 5;

  // Plans are gym-specific and change over time — derive the filter's
  // option list from what's actually in this batch of payments rather
  // than a static mock list.
  const planOptions = useMemo(() => {
    const plans = new Set(
      payments.map((p) => p.plan).filter(Boolean) as string[],
    );
    return ["All Plans", ...Array.from(plans).sort()];
  }, [payments]);

  // Filter and search logic (runs before the table ever sees the data)
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (payment.memberName ?? "").toLowerCase().includes(q) ||
        (payment.receiptId ?? "").toLowerCase().includes(q) ||
        (payment.memberPhone ?? "").includes(searchQuery);

      const matchesStatus =
        !selectedStatus || payment.status === selectedStatus;
      const matchesPlan =
        planFilter === "All Plans" || payment.plan === planFilter;
      const matchesMethod =
        methodFilter === "All Methods" || payment.method === methodFilter;
      const matchesDateRange =
        (!dateFrom || (payment.paymentDate ?? "") >= dateFrom) &&
        (!dateTo || (payment.paymentDate ?? "") <= dateTo);

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

  const activeFilterCount =
    (planFilter !== "All Plans" ? 1 : 0) +
    (methodFilter !== "All Methods" ? 1 : 0) +
    (dateFrom && dateTo ? 1 : 0);

  const resetAdvancedFilters = () => {
    setPlanFilter("All Plans");
    setMethodFilter("All Methods");
    setDateFrom("");
    setDateTo("");
    table.setPageIndex(0);
  };

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
      p.receiptId ?? p.id.slice(0, 8),
      p.memberName ?? "—",
      p.memberPhone ?? "—",
      p.plan ?? "—",
      p.amount,
      p.method ?? "—",
      p.paymentDate ?? "—",
      p.dueDate ?? "—",
      STATUS_LABELS[p.status] ?? p.status,
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
    link.setAttribute("download", "payments-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVerify = (id: string) => {
    const previousStatus = payments.find((p) => p.id === id)?.status;
    // optimistic update so the row flips immediately
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Verified" } : p)),
    );
    startVerifying(async () => {
      const result = await verifyPaymentAction({ paymentId: id, gymId });
      if (!result.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: previousStatus ?? p.status } : p,
          ),
        );
        toast.error("Couldn't verify payment — try again");
      }
    });
  };

  const handleRecorded = (id: string, method: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "PendingVerification",
              method: method as PaymentRow["method"],
            }
          : p,
      ),
    );
  };

  const handleDownloadReceipt = () =>
    toast.error("Download receipt is not implemented yet");

  const handleSendReminder = () =>
    toast.error("Send reminder is not implemented yet");

  const handleViewDetails = (paymentId: string) =>
    router.push(`/owner/payments/${paymentId}`);

  // Column definitions for TanStack Table
  const columns = useMemo<ColumnDef<PaymentRow>[]>(
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
        accessorKey: "receiptId",
        header: "Receipt No",
        cell: ({ row }) => (
          <p className="font-medium text-foreground text-sm">
            {row.original.receiptId ?? row.original.id.slice(0, 8)}
          </p>
        ),
      },
      {
        accessorKey: "memberName",
        header: "Member",
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                {getInitials(payment.memberName ?? "?")}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {payment.memberName ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {payment.memberPhone ?? "—"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            {row.original.plan ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <p className="font-medium text-foreground text-sm">
            ₹{row.original.amount.toLocaleString()}
          </p>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">
            {row.original.method ?? "—"}
          </p>
        ),
      },
      {
        accessorKey: "paymentDate",
        header: "Payment Date",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">
            {row.original.paymentDate ?? "—"}
          </p>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Next Due",
        cell: ({ row }) => (
          <p className="text-sm text-foreground">
            {row.original.dueDate ?? "—"}
          </p>
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
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewDetails(payment.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadReceipt}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Receipt
                </DropdownMenuItem>

                {payment.status === "Pending" && (
                  <DropdownMenuItem
                    onClick={() => setRecordDialogPaymentId(payment.id)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Record Payment
                  </DropdownMenuItem>
                )}

                {payment.status === "PendingVerification" && (
                  <DropdownMenuItem
                    onClick={() => handleVerify(payment.id)}
                    disabled={isVerifying}
                    className="text-green-600 focus:text-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verify Payment
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleSendReminder}>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Reminder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVerifying],
  );

  const table = useReactTable({
    data: filteredPayments,
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
                table.setPageIndex(0);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 hover:text-primary" />
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
                      Payment Method
                    </label>
                    <select
                      value={methodFilter}
                      onChange={(e) => {
                        setMethodFilter(e.target.value);
                        table.setPageIndex(0);
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {METHOD_OPTIONS.map((m) => (
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
                          table.setPageIndex(0);
                        }}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          table.setPageIndex(0);
                        }}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
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

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {QUICK_STATUS_TABS.map((status) => (
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
              {status === "All" ? "All" : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table (desktop/tablet) + Cards (mobile) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table — shadcn Table + TanStack Table */}
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
                      <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-foreground mb-2">
                        No Payments Found
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

        {/* Mobile card list — same row data from the table instance */}
        <div className="md:hidden divide-y divide-border">
          {rows.length > 0 ? (
            rows.map((row) => {
              const payment = row.original;
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
                        {getInitials(payment.memberName ?? "?")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {payment.memberName ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {payment.receiptId ?? payment.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleViewDetails}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadReceipt}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Download Receipt
                        </DropdownMenuItem>

                        {payment.status === "Pending" && (
                          <DropdownMenuItem
                            onClick={() => setRecordDialogPaymentId(payment.id)}
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                        )}

                        {payment.status === "PendingVerification" && (
                          <DropdownMenuItem
                            onClick={() => handleVerify(payment.id)}
                            disabled={isVerifying}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verify Payment
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={handleSendReminder}>
                          <Bell className="w-4 h-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-foreground truncate">
                        {payment.plan ?? "—"}
                      </p>
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
                        {payment.paymentDate ?? "—"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-foreground truncate">
                        {payment.dueDate ?? "—"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status,
                    )}`}
                  >
                    {STATUS_LABELS[payment.status] ?? payment.status}
                  </span>
                </div>
              );
            })
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
            {Math.min(startIdx + pageSize, filteredPayments.length)} of{" "}
            {filteredPayments.length} payments
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

      <RecordPaymentDialog
        gymId={gymId}
        paymentId={recordDialogPaymentId}
        amount={payments.find((p) => p.id === recordDialogPaymentId)?.amount}
        open={recordDialogPaymentId !== null}
        onOpenChange={(open) => !open && setRecordDialogPaymentId(null)}
        onRecorded={handleRecorded}
      />
    </>
  );
}
