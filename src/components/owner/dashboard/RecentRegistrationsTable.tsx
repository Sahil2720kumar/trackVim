"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { EntityAvatar } from "@/components/EntityAvatar";
import { PlanBadge } from "@/components/owner/dashboard/badges";
import { formatDateStr } from "@/lib/utils";

export type RecentRegistrationRow = {
  id: string;
  name: string;
  photoUrl: string | null;
  joined: string;
  plan: string;
};

const columnHelper = createColumnHelper<RecentRegistrationRow>();

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
  columnHelper.accessor("joined", {
    header: "Joined On",
    cell: (info) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDateStr(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => <PlanBadge plan={info.getValue()} />,
  }),
];

export function RecentRegistrationsTable({
  data,
}: {
  data: RecentRegistrationRow[];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No recent registrations."
    />
  );
}
