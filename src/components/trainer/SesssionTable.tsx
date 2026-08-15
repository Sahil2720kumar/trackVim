"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type {
  Session,
  SessionStatus,
  SessionType,
} from "@/mock/trainer/sesssions";
import { useRouter } from "next/navigation";
// ============================================================================
// Constants
// ============================================================================

const SESSION_TYPES: SessionType[] = [
  "Personal Training",
  "Group Session",
  "Assessment",
  "Consultation",
];

const STATUS_PILL_OPTIONS: (SessionStatus | "All Status")[] = [
  "All Status",
  "Completed",
  "Upcoming",
  "Cancelled",
  "InProgress",
];

// ============================================================================
// Helpers
// ============================================================================

const getStatusColor = (status: SessionStatus): string => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "Upcoming":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "Cancelled":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "InProgress":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

const getSessionTypeColor = (type: SessionType): string => {
  switch (type) {
    case "Personal Training":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "Group Session":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    case "Assessment":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Consultation":
      return "bg-cyan-100 text-cyan-700 hover:bg-cyan-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => (
  <Badge className={`rounded-full font-medium ${getStatusColor(status)}`}>
    {status}
  </Badge>
);

const TypeBadge: React.FC<{ type: SessionType }> = ({ type }) => (
  <Badge className={`rounded-full font-medium ${getSessionTypeColor(type)}`}>
    {type}
  </Badge>
);

// ============================================================================
// Row actions
// ============================================================================

interface SessionActionsMenuProps {
  session: Session;
  onView?: (session: Session) => void;
  onEdit?: (session: Session) => void;
  onCancel?: (session: Session) => void;
}

const SessionActionsMenu: React.FC<SessionActionsMenuProps> = ({
  session,
  onView,
  onEdit,
  onCancel,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem onClick={() => onView?.(session)}>
        <Eye className="w-4 h-4 mr-2" />
        View
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit?.(session)}>
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-red-600 focus:text-red-600"
        disabled={session.status === "Cancelled"}
        onClick={() => onCancel?.(session)}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancel Session
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ============================================================================
// Empty state
// ============================================================================

const EmptyState: React.FC<{
  onCreateClick?: () => void;
  inline?: boolean;
}> = ({ onCreateClick, inline }) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Sessions Found
      </h3>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        Try adjusting your search or filter criteria.
      </p>
      {!inline && onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      )}
    </div>
  );

  if (inline) return content;
  return (
    <Card className="border-border border-dashed">
      <CardContent>{content}</CardContent>
    </Card>
  );
};

// ============================================================================
// Reusable SesssionTable
// ============================================================================

export interface SesssionTableProps {
  sessions: Session[];
  /** Heading shown above the table. Omit (or set showHeader=false) to embed without a title. */
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  /** "Create New Session" button in the header. */
  showCreateButton?: boolean;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  /** Search + filter popover + status pills + export. */
  showToolbar?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  /** Link shown next to the title instead of (or alongside) the create button — useful for a dashboard widget. */
  viewAllHref?: string;
  onViewAllClick?: () => void;
  // onViewDetails?: (session: Session) => void;
  // onEditSession?: (session: Session) => void;
  // onCancelSession?: (session: Session) => void;
  className?: string;
}

export const SesssionTable: React.FC<SesssionTableProps> = ({
  sessions,
  title = "Sessions",
  subtitle,
  showHeader = true,
  showCreateButton = true,
  createButtonLabel = "Create New Session",
  onCreateClick,
  showToolbar = true,
  showPagination = true,
  pageSize = 5,
  viewAllHref,
  onViewAllClick,
  // onViewDetails,
  // onEditSession,
  // onCancelSession,
  className = "",
}) => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [typeFilters, setTypeFilters] = useState<SessionType[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    SessionStatus | "All Status"
  >("All Status");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const handleViewSession = (session: Session) =>
    router.push(`/trainer/sessions/${session.id}`);
  const handleEditSession = (session: Session) =>
    router.push(`/trainer/sessions/${session.id}/edit`);
  const handleCancelSession = (session: Session) =>
    console.log("cancel session", session.id);

  const toggleTypeFilter = (type: SessionType) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const resetFilters = () => setTypeFilters([]);
  const activeFilterCount = typeFilters.length;

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const q = searchValue.toLowerCase();
      const matchesSearch =
        session.name.toLowerCase().includes(q) ||
        session.member.name.toLowerCase().includes(q) ||
        session.category.toLowerCase().includes(q) ||
        session.type.toLowerCase().includes(q);

      const matchesType =
        typeFilters.length === 0 || typeFilters.includes(session.type);

      const matchesStatus =
        statusFilter === "All Status" || session.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sessions, searchValue, typeFilters, statusFilter]);

  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Session",
        cell: ({ row }) => {
          const session = row.original;
          const Icon = session.icon;
          return (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${session.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.category}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "member",
        header: "Member",
        cell: ({ row }) => {
          const member = row.original.member;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.photo_url} />
                <AvatarFallback className="text-xs font-medium">
                  {member.initials ?? member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{member.name}</span>
            </div>
          );
        },
      },
      // {
      //   accessorKey: "type",
      //   header: "Type",
      //   cell: ({ row }) => <TypeBadge type={row.original.type} />,
      // },
      {
        id: "dateTime",
        header: "Date & Time",
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div className="text-sm text-foreground">
              <p className="font-medium">{session.date}</p>
              <p className="text-xs text-muted-foreground">{session.time}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.duration}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <SessionActionsMenu
              session={row.original}
              onView={handleViewSession}
              onEdit={handleEditSession}
              onCancel={handleCancelSession}
            />
          </div>
        ),
      },
    ],
    [handleViewSession, handleEditSession, handleCancelSession],
  );

  const table = useReactTable({
    data: filteredSessions,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <a
                href={viewAllHref}
                onClick={onViewAllClick}
                className="text-sm text-primary hover:text-primary/80"
              >
                View All
              </a>
            )}
            {showCreateButton && (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{createButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toolbar: search + filter + export + status pills */}
      {showToolbar && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions by name, member, or workout type..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="pl-9 pr-9 bg-background"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative gap-2 px-3 sm:px-4 py-2 h-auto text-sm font-normal"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden xs:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Advanced filters
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Session Type
                      </label>
                      <div className="space-y-2">
                        {SESSION_TYPES.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={typeFilters.includes(type)}
                              onChange={() => toggleTypeFilter(type)}
                            />
                            <span className="text-sm text-foreground">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <button
                      onClick={resetFilters}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Reset filters
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {STATUS_PILL_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">
              {filteredSessions.length} sessions
            </span>
          </p>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-5 align-middle"
                      >
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
                  <TableCell colSpan={columns.length} className="px-4 py-8">
                    <EmptyState onCreateClick={onCreateClick} inline />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mb-6">
        {filteredSessions.length > 0 ? (
          filteredSessions
            .slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize,
            )
            .map((session) => {
              const Icon = session.icon;
              return (
                <Card key={session.id} className="border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${session.iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {session.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={session.status} />
                        <SessionActionsMenu
                          session={session}
                          onView={handleViewSession}
                          onEdit={handleEditSession}
                          onCancel={handleCancelSession}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={session.member.photo_url} />
                          <AvatarFallback className="text-xs">
                            {session.member.initials ??
                              session.member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-foreground">
                          {session.member.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <TypeBadge type={session.type} />
                      </div>
                      <p className="text-muted-foreground">
                        {session.date} • {session.time}
                      </p>
                      <p className="text-muted-foreground">
                        Duration: {session.duration}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        ) : (
          <EmptyState onCreateClick={onCreateClick} />
        )}
      </div>

      {/* Pagination */}
      {showPagination && filteredSessions.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              filteredSessions.length,
            )}{" "}
            of {filteredSessions.length} sessions
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(table.getPageCount())].map((_, idx) => (
              <button
                key={idx}
                onClick={() => table.setPageIndex(idx)}
                className={`w-8 h-8 rounded-lg border transition-colors ${
                  idx === pagination.pageIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-gray-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((p) => ({
                  ...p,
                  pageSize: Number(e.target.value),
                  pageIndex: 0,
                }))
              }
              className="px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SesssionTable;
