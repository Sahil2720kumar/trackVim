"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { EntityAvatar } from "@/components/EntityAvatar";
import { formatDateStr } from "@/lib/utils";
import { PlanBadge } from "./badges";

export type ExpiringMembershipRow = {
  id: string;
  name: string;
  photoUrl: string | null;
  plan: string;
  expiry: string;
  daysLeft: number;
};

const columnHelper = createColumnHelper<ExpiringMembershipRow>();

const columns = [
  columnHelper.accessor("name", {
    header: "Member",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <EntityAvatar
          name={info.getValue()}
          photoUrl={info.row.original.photoUrl}
          size="sm"
        />
        <span className="text-foreground font-medium whitespace-nowrap">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => <PlanBadge plan={info.getValue()} />,
  }),
  columnHelper.accessor("expiry", {
    header: "Expiry Date",
    cell: (info) => (
      <span className="text-muted-foreground hidden sm:inline whitespace-nowrap">
        {formatDateStr(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("daysLeft", {
    header: "Days Left",
    cell: (info) => (
      <span
        className={`font-semibold whitespace-nowrap ${info.getValue() <= 5 ? "text-red-600" : "text-green-600"}`}
      >
        {info.getValue()} days
      </span>
    ),
  }),
];

export function ExpiringMembershipsTable({
  data,
}: {
  data: ExpiringMembershipRow[];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No memberships expiring in the next 30 days."
    />
  );
}
