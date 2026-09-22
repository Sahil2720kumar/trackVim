// src/components/owner/import/ImportReportModal.tsx
"use client";

import { useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ImportBatchResult } from "@/types/import-members.types";
import { downloadFile } from "@/lib/import-members-utils";

import { ImportTrainerBatchResult } from "@/types/import-trainers.types";

interface ImportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: ImportBatchResult | null;
  entityType?: "member" | "trainer";
  trainerResult?: ImportTrainerBatchResult | null;
}

export function ImportReportModal({
  isOpen,
  onClose,
  result,
  entityType = "member",
  trainerResult,
}: ImportReportModalProps) {
  const [activeTab, setActiveTab] = useState<
    "successful" | "skipped" | "errors"
  >("successful");

  if (entityType === "trainer") {
    if (!trainerResult) return null;

    const handleDownloadTrainerCsvReport = () => {
      const lines: string[] = [
        "Type,Row Number,Trainer Name,Email,Status/Details,Suggested Action",
      ];

      trainerResult.successfulRows.forEach((r) => {
        lines.push(
          `Successful,${r.rowNumber},"${r.fullName.replace(/"/g, '""')}","${(r.contactEmail || "").replace(/"/g, '""')}","Trainer Code: ${r.trainerCode}${r.hasExistingProfile ? " (Linked Profile)" : ""}",None`,
        );
      });

      trainerResult.skippedRows.forEach((r: any) => {
        lines.push(
          `Skipped,${r.rowNumber || ""},"${(r.fullName || "").replace(/"/g, '""')}","${(r.contactEmail || "").replace(/"/g, '""')}","${(r.reason || "Skipped").replace(/"/g, '""')}",Review trainer records`,
        );
      });

      trainerResult.errorRows.forEach((r) => {
        lines.push(
          `Error,${r.rowNumber},"${r.fullName.replace(/"/g, '""')}","","${r.error.replace(/"/g, '""')}","${(r.suggestedAction || "").replace(/"/g, '""')}"`,
        );
      });

      downloadFile("TrackVim_Trainer_Import_Report.csv", lines.join("\n"));
    };

    return (
      <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 gap-4">
          <DialogHeader className="pr-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <DialogTitle className="text-xl font-bold">
                  Trainer Import Report
                </DialogTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTrainerCsvReport}
                className="gap-2 border-border shrink-0 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                Export Report CSV
              </Button>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed audit log of imported trainers, linked accounts, and error row feedback.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="flex-1 flex flex-col min-h-0 w-full"
          >
            <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="bg-muted p-1 inline-flex whitespace-nowrap">
                <TabsTrigger value="successful" className="text-xs">
                  Successfully Imported ({trainerResult.successfulRows.length})
                </TabsTrigger>
                <TabsTrigger
                  value="skipped"
                  className="text-xs text-amber-600 dark:text-amber-400"
                >
                  Skipped ({trainerResult.skippedRows.length})
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="text-xs text-rose-600 dark:text-rose-400"
                >
                  Errors ({trainerResult.errorRows.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4 flex-1 overflow-auto border border-border rounded-xl">
              {activeTab === "successful" && (
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[80px]">Row</TableHead>
                      <TableHead>Trainer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trainer Code</TableHead>
                      <TableHead>Account Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainerResult.successfulRows.map((r) => (
                      <TableRow key={r.rowNumber}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{r.rowNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {r.fullName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.contactEmail || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-foreground">
                          {r.trainerCode}
                        </TableCell>
                        <TableCell>
                          {r.hasExistingProfile ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 border-blue-200"
                            >
                              Linked Account
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200"
                            >
                              New Record
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === "skipped" && (
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[80px]">Row</TableHead>
                      <TableHead>Trainer Name</TableHead>
                      <TableHead>Reason for Skipping</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainerResult.skippedRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-6 text-muted-foreground text-sm"
                        >
                          No trainer rows were skipped.
                        </TableCell>
                      </TableRow>
                    ) : (
                      trainerResult.skippedRows.map((r: any, idx) => (
                        <TableRow key={r.rowNumber || idx}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{r.rowNumber || idx + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground text-sm">
                            {r.fullName || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-amber-700 dark:text-amber-300">
                            {r.reason || "Skipped during import"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === "errors" && (
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[80px]">Row</TableHead>
                      <TableHead>Trainer Name</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Suggested Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainerResult.errorRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-muted-foreground text-sm"
                        >
                          No error rows found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      trainerResult.errorRows.map((r) => (
                        <TableRow key={r.rowNumber} className="bg-rose-500/5">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{r.rowNumber}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground text-sm">
                            {r.fullName}
                          </TableCell>
                          <TableCell className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                            {r.error}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.suggestedAction}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  if (!result) return null;

  const handleDownloadCsvReport = () => {
    const lines: string[] = [
      "Type,Row Number,Member Name,Status/Details,Suggested Action",
    ];

    result.successfulRows.forEach((r) => {
      lines.push(
        `Successful,${r.rowNumber},"${r.fullName.replace(/"/g, '""')}",Imported membership ID: ${r.membershipId},None`,
      );
    });

    result.skippedRows.forEach((r) => {
      lines.push(
        `Skipped,${r.rowNumber},"${r.fullName.replace(/"/g, '""')}","${r.reason.replace(/"/g, '""')}",Review active gym membership`,
      );
    });

    result.errorRows.forEach((r) => {
      lines.push(
        `Error,${r.rowNumber},"${r.fullName.replace(/"/g, '""')}","${r.error.replace(/"/g, '""')}","${r.suggestedAction.replace(/"/g, '""')}"`,
      );
    });

    downloadFile("TrackVim_Import_Report.csv", lines.join("\n"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 gap-4">
        <DialogHeader className="pr-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <DialogTitle className="text-xl font-bold">
                Import Report
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsvReport}
              className="gap-2 border-border shrink-0 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              Export Report CSV
            </Button>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Detailed audit log of imported members, skipped duplicates, and
            error row feedback.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v: any) => setActiveTab(v)}
          className="flex-1 flex flex-col min-h-0 w-full"
        >
          <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="bg-muted p-1 inline-flex whitespace-nowrap">
              <TabsTrigger value="successful" className="text-xs">
                Successfully Imported ({result.successfulRows.length})
              </TabsTrigger>
              <TabsTrigger
                value="skipped"
                className="text-xs text-amber-600 dark:text-amber-400"
              >
                Skipped ({result.skippedRows.length})
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="text-xs text-rose-600 dark:text-rose-400"
              >
                Errors ({result.errorRows.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4 flex-1 overflow-auto border border-border rounded-xl">
            {activeTab === "successful" && (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Membership ID</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>QR Token</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.successfulRows.map((r) => (
                    <TableRow key={r.rowNumber}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{r.rowNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {r.fullName}
                        {r.isExistingGlobal && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 border-blue-200"
                          >
                            Linked Global Member
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.membershipId}
                      </TableCell>
                      <TableCell className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {r.paymentId ? "Verified" : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.qrToken ? r.qrToken.slice(0, 8) + "..." : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "skipped" && (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Reason for Skipping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.skippedRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-6 text-muted-foreground text-sm"
                      >
                        No rows were skipped.
                      </TableCell>
                    </TableRow>
                  ) : (
                    result.skippedRows.map((r) => (
                      <TableRow key={r.rowNumber}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{r.rowNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {r.fullName}
                        </TableCell>
                        <TableCell className="text-xs text-amber-700 dark:text-amber-300">
                          {r.reason}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "errors" && (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Error Message</TableHead>
                    <TableHead>Suggested Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errorRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground text-sm"
                      >
                        No error rows found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    result.errorRows.map((r) => (
                      <TableRow key={r.rowNumber} className="bg-rose-500/5">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{r.rowNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {r.fullName}
                        </TableCell>
                        <TableCell className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                          {r.error}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.suggestedAction}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
