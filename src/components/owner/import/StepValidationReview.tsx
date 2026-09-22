// src/components/owner/import/StepValidationReview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Layers,
  IndianRupee,
  Calendar,
  Info,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ImportSummaryStats, ParsedImportRow } from "@/types/import-members.types";

import {
  ParsedTrainerImportRow,
  TrainerImportSummaryStats,
} from "@/types/import-trainers.types";

interface StepValidationReviewProps {
  parsedRows?: ParsedImportRow[];
  stats?: ImportSummaryStats;
  onGoToPlanMapping?: () => void;
  entityType?: "member" | "trainer";
  parsedTrainerRows?: ParsedTrainerImportRow[];
  trainerStats?: TrainerImportSummaryStats;
}

export function StepValidationReview({
  parsedRows = [],
  stats,
  onGoToPlanMapping,
  entityType = "member",
  parsedTrainerRows = [],
  trainerStats,
}: StepValidationReviewProps) {
  const [activeTab, setActiveTab] = useState<
    "all" | "ready" | "warnings" | "errors" | "duplicates"
  >("all");

  if (entityType === "trainer") {
    const effectiveStats: TrainerImportSummaryStats = trainerStats || {
      totalRows: parsedTrainerRows.length,
      readyRows: parsedTrainerRows.filter((r) => r.severity === "ready").length,
      warningRows: parsedTrainerRows.filter((r) => r.severity === "warning").length,
      errorRows: parsedTrainerRows.filter((r) => r.severity === "error").length,
      duplicateRows: parsedTrainerRows.filter((r) =>
        r.issues.some((i) => i.code === "DUPLICATE_EMAIL_IN_IMPORT" || i.code === "TRAINER_ALREADY_EXISTS_IN_GYM"),
      ).length,
      existingGlobalMatches: parsedTrainerRows.filter((r) => r.existingGlobalTrainerMatch).length,
    };

    const filteredTrainerRows = parsedTrainerRows.filter((row) => {
      if (activeTab === "ready") return row.severity === "ready";
      if (activeTab === "warnings") return row.severity === "warning";
      if (activeTab === "errors") return row.severity === "error";
      if (activeTab === "duplicates")
        return row.issues.some(
          (i) =>
            i.code === "DUPLICATE_EMAIL_IN_IMPORT" ||
            i.code === "TRAINER_ALREADY_EXISTS_IN_GYM",
        );
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {effectiveStats.totalRows.toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-500/5 shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready to Import</p>
                <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  {effectiveStats.readyRows.toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-900 bg-amber-500/5 shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Warnings / Info</p>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                  {effectiveStats.warningRows.toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-200 dark:border-rose-900 bg-rose-500/5 shadow-2xs">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Errors</p>
                <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
                  {effectiveStats.errorRows.toLocaleString()}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Table Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Review trainer import data</CardTitle>
                <CardDescription>
                  Verify trainer rows, check email availability, and review warnings before importing.
                </CardDescription>
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList className="bg-muted p-1">
                  <TabsTrigger value="all" className="text-xs">
                    All ({effectiveStats.totalRows})
                  </TabsTrigger>
                  <TabsTrigger value="ready" className="text-xs text-emerald-600 dark:text-emerald-400">
                    Ready ({effectiveStats.readyRows})
                  </TabsTrigger>
                  <TabsTrigger value="warnings" className="text-xs text-amber-600 dark:text-amber-400">
                    Warnings ({effectiveStats.warningRows})
                  </TabsTrigger>
                  <TabsTrigger value="errors" className="text-xs text-rose-600 dark:text-rose-400">
                    Errors ({effectiveStats.errorRows})
                  </TabsTrigger>
                  <TabsTrigger value="duplicates" className="text-xs">
                    Duplicates ({effectiveStats.duplicateRows})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead className="w-[28%]">Trainer</TableHead>
                    <TableHead className="w-[28%]">Email</TableHead>
                    <TableHead className="w-[18%]">Employment</TableHead>
                    <TableHead className="w-[26%]">Status & Remarks</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTrainerRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        No trainer rows found matching current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrainerRows.map((row) => {
                      const isError = row.severity === "error";
                      const isWarning = row.severity === "warning";
                      const isReady = row.severity === "ready";

                      return (
                        <TableRow
                          key={row.rowNumber}
                          className={`hover:bg-muted/30 ${
                            isError ? "bg-rose-500/5" : isWarning ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                            #{row.rowNumber}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-foreground text-sm">
                              {row.mappedData.fullName || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {row.mappedData.professionalTitle || row.mappedData.contactPhone || "—"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-foreground text-sm truncate max-w-[200px]">
                              {row.mappedData.contactEmail || "—"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-medium text-foreground">
                              {row.mappedData.employmentType || "—"}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              {isReady && (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 border-none gap-1 text-[11px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Ready
                                </Badge>
                              )}

                              {row.issues.map((issue, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs flex items-start gap-1.5 p-1.5 rounded-md ${
                                    issue.code === "EXISTING_TRAINER_ACCOUNT"
                                      ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                                      : "bg-rose-500/10 text-rose-800 dark:text-rose-300"
                                  }`}
                                >
                                  {issue.code === "EXISTING_TRAINER_ACCOUNT" ? (
                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                                  )}
                                  <div>
                                    <span className="font-semibold">{issue.message}</span>
                                    {issue.suggestedAction && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {issue.suggestedAction}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredRows = parsedRows.filter((row) => {
    if (activeTab === "ready") return row.severity === "ready";
    if (activeTab === "warnings") return row.severity === "warning";
    if (activeTab === "errors") return row.severity === "error";
    if (activeTab === "duplicates")
      return row.issues.some((i) => i.code === "DUPLICATE_PHONE_IN_GYM");
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {stats.totalRows.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-500/5 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready to Import</p>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {stats.readyRows.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-amber-500/5 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Warnings / Info</p>
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                {stats.warningRows.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 dark:border-rose-900 bg-rose-500/5 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Errors</p>
              <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
                {stats.errorRows.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Table Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Review import data</CardTitle>
              <CardDescription>
                Verify rows, human-readable validation messages, and existing member links.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="bg-muted p-1">
                <TabsTrigger value="all" className="text-xs">
                  All ({stats.totalRows})
                </TabsTrigger>
                <TabsTrigger value="ready" className="text-xs text-emerald-600 dark:text-emerald-400">
                  Ready ({stats.readyRows})
                </TabsTrigger>
                <TabsTrigger value="warnings" className="text-xs text-amber-600 dark:text-amber-400">
                  Warnings ({stats.warningRows})
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs text-rose-600 dark:text-rose-400">
                  Errors ({stats.errorRows})
                </TabsTrigger>
                <TabsTrigger value="duplicates" className="text-xs">
                  Duplicates ({stats.duplicateRows})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border border-border rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">Row</TableHead>
                  <TableHead className="w-[25%]">Member</TableHead>
                  <TableHead className="w-[20%]">Membership</TableHead>
                  <TableHead className="w-[15%]">Payment</TableHead>
                  <TableHead className="w-[35%]">Status & Remarks</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No rows found matching current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const isError = row.severity === "error";
                    const isWarning = row.severity === "warning";
                    const isReady = row.severity === "ready";

                    return (
                      <TableRow
                        key={row.rowNumber}
                        className={`hover:bg-muted/30 ${
                          isError ? "bg-rose-500/5" : isWarning ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                          #{row.rowNumber}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-foreground text-sm">
                            {row.mappedData.fullName || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {row.mappedData.contactPhone || row.mappedData.contactEmail || "No contact info"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-foreground text-sm">
                            {row.mappedData.planName || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {row.mappedData.startDate || "—"} to {row.mappedData.endDate || "—"}
                          </div>
                        </TableCell>

                        <TableCell>
                          {row.mappedData.paymentAmount != null ? (
                            <div className="font-medium text-foreground text-sm">
                              ₹{row.mappedData.paymentAmount.toLocaleString("en-IN")}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {isReady && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 border-none gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                              </Badge>
                            )}

                            {row.issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className={`text-xs flex items-start gap-1.5 p-1.5 rounded-md ${
                                  issue.code === "EXISTING_GLOBAL_MEMBER"
                                    ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                                    : issue.code === "UNKNOWN_PLAN" || issue.code === "INVALID_DATE" || issue.code === "END_BEFORE_START" || issue.code === "DUPLICATE_PHONE_IN_GYM"
                                    ? "bg-rose-500/10 text-rose-800 dark:text-rose-300"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {issue.code === "EXISTING_GLOBAL_MEMBER" ? (
                                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                                )}
                                <div>
                                  <span className="font-semibold">{issue.message}</span>
                                  {issue.code === "UNKNOWN_PLAN" && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {onGoToPlanMapping && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-xs text-primary underline"
                                          onClick={onGoToPlanMapping}
                                        >
                                          Map Plan
                                        </Button>
                                      )}
                                      <Link
                                        href="/owner/plans/new"
                                        target="_blank"
                                        className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                                      >
                                        + Create New Plan ↗
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
