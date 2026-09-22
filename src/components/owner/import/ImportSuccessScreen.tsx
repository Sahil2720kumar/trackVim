// src/components/owner/import/ImportSuccessScreen.tsx
"use client";

import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  CreditCard,
  QrCode,
  FileText,
  RotateCcw,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImportBatchResult } from "@/types/import-members.types";

import { ImportTrainerBatchResult } from "@/types/import-trainers.types";

interface ImportSuccessScreenProps {
  result?: ImportBatchResult;
  onViewReport: () => void;
  onReset: () => void;
  entityType?: "member" | "trainer";
  trainerResult?: ImportTrainerBatchResult;
}

export function ImportSuccessScreen({
  result,
  onViewReport,
  onReset,
  entityType = "member",
  trainerResult,
}: ImportSuccessScreenProps) {
  if (entityType === "trainer" && trainerResult) {
    const importedCount = trainerResult.successfulRows.length;
    const skippedOrErrorCount = trainerResult.skippedCount + trainerResult.errorRows.length;

    const isAllFailed = importedCount === 0;
    const isPartial = importedCount > 0 && skippedOrErrorCount > 0;
    const isAllSuccess = importedCount > 0 && skippedOrErrorCount === 0;

    return (
      <Card className="border-border shadow-lg bg-card max-w-3xl mx-auto">
        <CardContent className="p-8 sm:p-12 text-center space-y-8">
          {/* Status Icon */}
          {isAllSuccess && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-4 border-emerald-500/20 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          {isPartial && (
            <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-4 border-amber-500/20 animate-in zoom-in-95 duration-300">
              <AlertTriangle className="w-10 h-10" />
            </div>
          )}

          {isAllFailed && (
            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border-4 border-rose-500/20 animate-in zoom-in-95 duration-300">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isAllSuccess && "Import completed"}
              {isPartial && "Import completed with warnings"}
              {isAllFailed && "No trainers imported"}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {isAllSuccess &&
                "Your trainers are now available in TrackVim."}
              {isPartial &&
                `${importedCount} trainers were imported successfully, but ${skippedOrErrorCount} rows were skipped or had issues.`}
              {isAllFailed &&
                `No trainer records were created. All ${skippedOrErrorCount} rows were skipped or encountered errors.`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Imported
              </div>
              <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                {importedCount.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground font-medium">
                New Trainers
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {trainerResult.trainersCreated.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground font-medium">
                Existing Accounts Linked
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {trainerResult.existingProfilesLinked.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Skipped / Errors
              </div>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">
                {skippedOrErrorCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {importedCount > 0 && (
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-6">
                <Link
                  className="flex flex-row items-center justify-center gap-2"
                  href="/owner/trainers"
                >
                  <Users className="w-4 h-4" />
                  View Trainers
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}

            <Button
              variant={isAllFailed ? "default" : "outline"}
              size="lg"
              onClick={onViewReport}
              className="w-full sm:w-auto gap-2 border-border"
            >
              <FileText className="w-4 h-4" />
              View Import Report
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={onReset}
              className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Import Another File
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;
  const importedCount = result.successfulRows.length;
  const skippedOrErrorCount = result.skippedCount + result.errorRows.length;

  const isAllFailed = importedCount === 0;
  const isPartial = importedCount > 0 && skippedOrErrorCount > 0;
  const isAllSuccess = importedCount > 0 && skippedOrErrorCount === 0;

  return (
    <Card className="border-border shadow-lg bg-card max-w-3xl mx-auto">
      <CardContent className="p-8 sm:p-12 text-center space-y-8">
        {/* Status Icon */}
        {isAllSuccess && (
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-4 border-emerald-500/20 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        )}

        {isPartial && (
          <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-4 border-amber-500/20 animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-10 h-10" />
          </div>
        )}

        {isAllFailed && (
          <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border-4 border-rose-500/20 animate-in zoom-in-95 duration-300">
            <XCircle className="w-10 h-10" />
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isAllSuccess && "Import completed"}
            {isPartial && "Import completed with warnings"}
            {isAllFailed && "No members imported"}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {isAllSuccess &&
              "Your existing members are now available in TrackVim. Memberships, payments, and QR cards have been created."}
            {isPartial &&
              `${importedCount} members were imported successfully, but ${skippedOrErrorCount} rows were skipped or had issues.`}
            {isAllFailed &&
              `No member records were created. All ${skippedOrErrorCount} rows were skipped or encountered errors.`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Imported
            </div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
              {importedCount.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground font-medium">
              Memberships
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {result.membershipsCreated.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground font-medium">
              Payments
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {result.paymentsImported.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground font-medium">
              QR Cards
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {result.qrCardsCreated.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 col-span-2 sm:col-span-1">
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Skipped / Errors
            </div>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">
              {skippedOrErrorCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Informational Box for Failed / Skipped Rows */}
        {skippedOrErrorCount > 0 && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-left space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="w-4 h-4 text-primary shrink-0" />
              Why were rows skipped or errored?
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
              {result.skippedCount > 0 && (
                <li>
                  <span className="font-medium text-foreground">
                    {result.skippedCount} rows skipped:
                  </span>{" "}
                  Members already have an active membership in this gym.
                </li>
              )}
              {result.errorRows.length > 0 && (
                <li>
                  <span className="font-medium text-foreground">
                    {result.errorRows.length} rows errored:
                  </span>{" "}
                  Validation or database constraint issues.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {importedCount > 0 && (
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-6">
              <Link
                className="flex flex-row items-center justify-center gap-2"
                href="/owner/members"
              >
                <Users className="w-4 h-4" />
                View Members
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}

          <Button
            variant={isAllFailed ? "default" : "outline"}
            size="lg"
            onClick={onViewReport}
            className="w-full sm:w-auto gap-2 border-border"
          >
            <FileText className="w-4 h-4" />
            View Import Report
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onReset}
            className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Import Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
