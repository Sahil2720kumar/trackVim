// src/components/owner/import/StepConfirmation.tsx
"use client";

import {
  CheckCircle2,
  Users,
  CreditCard,
  QrCode,
  Mail,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImportSettingsState, ImportSummaryStats } from "@/types/import-members.types";

interface StepConfirmationProps {
  stats?: ImportSummaryStats;
  settings?: ImportSettingsState;
  validRowCount: number;
  paymentCount?: number;
  onConfirmImport: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  entityType?: "member" | "trainer";
  newTrainerCount?: number;
  linkedTrainerCount?: number;
  invitationCount?: number;
}

export function StepConfirmation({
  stats,
  settings,
  validRowCount,
  paymentCount = 0,
  onConfirmImport,
  onBack,
  isSubmitting,
  entityType = "member",
  newTrainerCount = 0,
  linkedTrainerCount = 0,
  invitationCount = 0,
}: StepConfirmationProps) {
  if (entityType === "trainer") {
    return (
      <div className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Ready to import
            </CardTitle>
            <CardDescription>
              Please review the final summary of trainer records TrackVim will create or link before proceeding.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Total Trainers
                </div>
                <div className="text-xl font-bold text-foreground">
                  {validRowCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  New Trainer Records
                </div>
                <div className="text-xl font-bold text-foreground">
                  {newTrainerCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Existing Accounts Linked
                </div>
                <div className="text-xl font-bold text-foreground">
                  {linkedTrainerCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  Invitations
                </div>
                <div className="text-xl font-bold text-foreground">
                  {invitationCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* What TrackVim Will Do Info Box */}
            <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-3">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                What TrackVim will do
              </h4>

              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Create trainer records for valid rows.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Reuse existing global trainer accounts when available.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Prevent trainer/member/owner email conflicts.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Keep each trainer record specific to this gym.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Send invitations only where applicable.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Skip invalid rows.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Provide an import report after completion.
                </li>
              </ul>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={onConfirmImport}
                disabled={isSubmitting || validRowCount === 0}
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {validRowCount.toLocaleString()} Trainers
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Ready to import
          </CardTitle>
          <CardDescription>
            Please review the final summary of records TrackVim will create or update before proceeding.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="p-3 rounded-lg bg-muted/40">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Users className="w-3.5 h-3.5 text-primary" />
                Members
              </div>
              <div className="text-xl font-bold text-foreground">
                {validRowCount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Memberships
              </div>
              <div className="text-xl font-bold text-foreground">
                {validRowCount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Payments
              </div>
              <div className="text-xl font-bold text-foreground">
                {settings?.importCurrentPayment ? paymentCount.toLocaleString() : "0"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <QrCode className="w-3.5 h-3.5 text-purple-600" />
                QR Cards
              </div>
              <div className="text-xl font-bold text-foreground">
                {settings?.generateQrCards ? validRowCount.toLocaleString() : "0"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                Invitations
              </div>
              <div className="text-xl font-bold text-foreground">
                {settings?.sendInvitations ? validRowCount.toLocaleString() : "0"}
              </div>
            </div>
          </div>

          {/* What TrackVim Will Do Info Box */}
          <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-3">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              What TrackVim will do
            </h4>

            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Create or reuse member records without creating duplicate profiles.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Create the current membership with source = Imported and applicationId = NULL.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Mark imported current memberships as Active when valid.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Mark imported payment records as Verified with source = Imported.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Generate or reuse physical membership QR cards per member in this gym.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Skip historical payment records to maintain strict ledger integrity.
              </li>
            </ul>
          </div>

          {/* Warning Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                This import should only contain your current member data.
              </span>
              TrackVim will not create historical payments from this import.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={onConfirmImport}
              disabled={isSubmitting || validRowCount === 0}
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {validRowCount.toLocaleString()} Members
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
