"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AssignedMember } from "@/services/owner.query";
import { formatDateStr, getInitials } from "@/lib/utils";

type TrainerAssignedMembersTableProps = {
  initialMembers: AssignedMember[];
};

const ITEMS_PER_PAGE = 10;

const getProgressBadgeColor = (label: AssignedMember["progressLabel"]) => {
  switch (label) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-700";
    case "Good":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const getMembershipStatusColor = (status: string | null) => {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700 border-0";
    case "Frozen":
      return "bg-sky-100 text-sky-700 border-0";
    case "Expired":
    case "Cancelled":
      return "bg-rose-100 text-rose-700 border-0";
    default:
      return "bg-muted text-muted-foreground border-0";
  }
};

export function TrainerAssignedMembersTable({
  initialMembers,
}: TrainerAssignedMembersTableProps) {
  const [members] = useState<AssignedMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        (member.full_name ?? "").toLowerCase().includes(q) ||
        (member.contact_email ?? "").toLowerCase().includes(q) ||
        (member.plan ?? "").toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  const handleExport = () => {
    const headers = [
      "Member Name",
      "Email",
      "Phone",
      "Plan",
      "Membership Status",
      "Attendance Rate (%)",
      "Progress",
      "Assigned On",
      "Notes",
    ];
    const rows = filteredMembers.map((m) => [
      m.full_name ?? "",
      m.contact_email ?? "",
      m.contact_phone ?? "",
      m.plan ?? "",
      m.membershipStatus ?? "",
      `${m.attendanceRate}%`,
      m.progressLabel,
      formatDate(m.assignedAt),
      m.notes ?? "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "assigned-members-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-lg text-foreground">
          Assigned Members
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 sm:w-auto"
        >
          View All Members
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assigned members..."
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
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full min-w-[860px]">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Assigned On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <TableRow
                    key={member.assignmentId}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={member.photo_url ?? undefined} />
                          <AvatarFallback>
                            {getInitials(member.full_name ?? "—")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {member.full_name ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.plan ? (
                        <Badge variant="secondary">{member.plan}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No active plan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-32">
                        <Progress
                          value={member.attendanceRate}
                          className="h-1.5"
                        />
                        <span className="text-sm font-medium text-foreground shrink-0">
                          {member.attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getProgressBadgeColor(member.progressLabel)}
                      >
                        {member.progressLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateStr(member.assignedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getMembershipStatusColor(
                          member.membershipStatus,
                        )}
                      >
                        {member.membershipStatus ?? "No membership"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Sessions</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground text-sm"
                  >
                    No assigned members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {paginatedMembers.length > 0 ? (
            paginatedMembers.map((member) => (
              <div key={member.assignmentId} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={member.photo_url ?? undefined} />
                      <AvatarFallback>
                        {getInitials(member.full_name ?? "—")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {member.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned {formatDateStr(member.assignedAt)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Sessions</DropdownMenuItem>
                      <DropdownMenuItem>Message</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {member.plan && (
                    <Badge variant="secondary">{member.plan}</Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className={getProgressBadgeColor(member.progressLabel)}
                  >
                    {member.progressLabel}
                  </Badge>
                  <Badge
                    className={getMembershipStatusColor(
                      member.membershipStatus,
                    )}
                  >
                    {member.membershipStatus ?? "No membership"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs gap-3">
                  <span className="text-muted-foreground shrink-0">
                    Attendance
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Progress value={member.attendanceRate} className="h-1.5" />
                    <span className="font-medium text-foreground shrink-0">
                      {member.attendanceRate}%
                    </span>
                  </div>
                </div>

                {(member.contact_email || member.contact_phone) && (
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
                    {member.contact_email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {member.contact_email}
                      </span>
                    )}
                    {member.contact_phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {member.contact_phone}
                      </span>
                    )}
                  </div>
                )}

                {member.notes && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                    {member.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No assigned members found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination — unchanged from before */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIdx + 1}–
              {Math.min(startIdx + ITEMS_PER_PAGE, filteredMembers.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{" "}
            members
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
    </Card>
  );
}
