"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MemberPayment } from "@/services/member.query";

function getPaymentBadge(status: MemberPayment["status"]) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Failed
        </Badge>
      );
  }
}

import { cn, formatDateStr } from "@/lib/utils";

const paymentColumns: ColumnDef<MemberPayment>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => {
      const value = info.getValue<string | null>();
      return (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {value ? formatDateStr(value) : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => {
      const amount = info.getValue<number | null>();
      return (
        <span className="text-xs font-semibold whitespace-nowrap">
          {amount != null ? `₹${amount.toLocaleString("en-IN")}` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {info.getValue<string | null>() ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: (info) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => getPaymentBadge(info.getValue<MemberPayment["status"]>()),
  },
];

export function PaymentHistoryTable({ data }: { data: MemberPayment[] }) {
  const table = useReactTable({
    data,
    columns: paymentColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-muted-foreground">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[560px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/40">
              {headerGroup.headers.map((header, idx) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "text-xs",
                    idx === 0 && "pl-5",
                    idx === headerGroup.headers.length - 1 && "pr-5",
                  )}
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/20">
              {row.getVisibleCells().map((cell, idx) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    idx === 0 && "pl-5",
                    idx === row.getVisibleCells().length - 1 && "pr-5",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
