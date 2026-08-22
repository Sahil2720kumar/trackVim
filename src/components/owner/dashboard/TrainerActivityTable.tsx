"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { EntityAvatar } from "@/components/EntityAvatar";
import { StatusBadge } from "@/components/owner/dashboard/badges";
import type { TrainerActivityRow } from "@/services/owner.query";

const columnHelper = createColumnHelper<TrainerActivityRow>();

const columns = [
  columnHelper.accessor("full_name", {
    header: "Trainer",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <EntityAvatar
          name={info.getValue()}
          photoUrl={info.row.original.photo_url}
          size="sm"
        />
        <span className="text-foreground font-medium whitespace-nowrap">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.display({
    id: "load",
    header: "Members / Sessions",
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {row.original.assigned_members}
        {row.original.max_members ? ` / ${row.original.max_members}` : ""}{" "}
        members • {row.original.sessions_today} sessions today
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
];

export function TrainerActivityTable({ data }: { data: TrainerActivityRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No trainers on staff yet."
    />
  );
}
