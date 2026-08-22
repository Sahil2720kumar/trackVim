"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { EntityAvatar } from "@/components/EntityAvatar";
import { PlanBadge, StatusBadge } from "@/components/owner/dashboard/badges";
import { formatDateStr } from "@/lib/utils";

export type RecentPaymentRow = {
  id: string;
  member: string;
  memberPhotoUrl: string | null;
  amount: string;
  plan: string;
  status: string;
  date: string | null;
};

const columnHelper = createColumnHelper<RecentPaymentRow>();

const columns = [
  columnHelper.accessor("member", {
    header: "Member",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <EntityAvatar
          name={info.getValue()}
          photoUrl={info.row.original.memberPhotoUrl}
          size="sm"
        />
        <span className="text-foreground font-medium whitespace-nowrap">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <span className="font-semibold text-foreground whitespace-nowrap">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => (
      <span className="hidden sm:inline">
        <PlanBadge plan={info.getValue()} />
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className="text-muted-foreground hidden sm:inline whitespace-nowrap">
          {v ? formatDateStr(v) : "—"}
        </span>
      );
    },
  }),
];

export function RecentPaymentsTable({ data }: { data: RecentPaymentRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No payments recorded yet."
    />
  );
}
