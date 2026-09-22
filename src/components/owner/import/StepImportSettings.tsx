// src/components/owner/import/StepImportSettings.tsx
"use client";

import Link from "next/link";
import {
  Info,
  Layers,
  ArrowRight,
  Plus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImportSettingsState,
  PlanMappingState,
} from "@/types/import-members.types";
import { GymPlanForImport } from "@/services/import-members.query";

interface StepImportSettingsProps {
  settings?: ImportSettingsState;
  onSettingsChange?: (key: keyof ImportSettingsState, checked: boolean) => void;
  uniqueImportedPlanNames?: string[];
  availableGymPlans?: GymPlanForImport[];
  planMapping?: PlanMappingState;
  onPlanMappingChange?: (importedPlanName: string, gymPlanId: string) => void;
  entityType?: "member" | "trainer";
  trainerSendInvitations?: boolean;
  onTrainerSendInvitationsChange?: (checked: boolean) => void;
}

export function StepImportSettings({
  settings,
  onSettingsChange,
  uniqueImportedPlanNames = [],
  availableGymPlans = [],
  planMapping = {},
  onPlanMappingChange,
  entityType = "member",
  trainerSendInvitations = true,
  onTrainerSendInvitationsChange,
}: StepImportSettingsProps) {
  if (entityType === "trainer") {
    return (
      <div className="space-y-6">
        {/* Import Settings Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Import settings</CardTitle>
            <CardDescription>
              Configure how TrackVim should handle trainer invitations and existing accounts.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Trainer Invitation Toggle */}
              <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="sendTrainerInvitations"
                  checked={trainerSendInvitations}
                  onCheckedChange={(c) =>
                    onTrainerSendInvitationsChange?.(!!c)
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="sendTrainerInvitations"
                    className="font-semibold text-foreground cursor-pointer"
                  >
                    Send TrackVim invitations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Invite trainers with a valid email address to create or access their TrackVim account.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Banner: Existing trainer accounts are reused */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-sm flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  Existing trainer accounts are reused
                </span>
                If the email belongs to an existing TrackVim trainer account from another gym, TrackVim can link that account to this gym instead of creating another global user account.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Conflict Validation Reference Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Email Conflict Validation Rules</CardTitle>
            <CardDescription>
              TrackVim automatically checks each trainer email against existing records prior to import:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-500/5 dark:border-emerald-900">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">✓ Available</span>
                <span className="text-muted-foreground">This email can be used for this trainer.</span>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-500/5 dark:border-blue-900">
                <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-0.5">🔗 Existing Trainer Account</span>
                <span className="text-muted-foreground">This email belongs to an existing trainer account and can be linked to this gym.</span>
              </div>

              <div className="p-3 rounded-lg border border-rose-200 bg-rose-500/5 dark:border-rose-900">
                <span className="font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">✕ Existing Trainer (Same Gym)</span>
                <span className="text-muted-foreground">A trainer with this email already exists in this gym.</span>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-500/5 dark:border-amber-900">
                <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">⚠ Member / Owner Email</span>
                <span className="text-muted-foreground">This email belongs to a member or owner account and cannot be used for a trainer.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Import Settings Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Import settings</CardTitle>
          <CardDescription>
            Configure how TrackVim should handle memberships, payments, QR
            cards, and accounts during import.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Membership Toggle */}
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
              <Checkbox
                id="createActiveMemberships"
                checked={settings?.createActiveMemberships}
                onCheckedChange={(c) =>
                  onSettingsChange?.("createActiveMemberships", !!c)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="createActiveMemberships"
                  className="font-semibold text-foreground cursor-pointer"
                >
                  Create active memberships
                </Label>
                <p className="text-xs text-muted-foreground">
                  Create a TrackVim membership for each valid member and mark
                  valid current memberships as active.
                </p>
              </div>
            </div>

            {/* Current Payment Toggle */}
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
              <Checkbox
                id="importCurrentPayment"
                checked={settings?.importCurrentPayment}
                onCheckedChange={(c) =>
                  onSettingsChange?.("importCurrentPayment", !!c)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="importCurrentPayment"
                  className="font-semibold text-foreground cursor-pointer"
                >
                  Import current membership payment
                </Label>
                <p className="text-xs text-muted-foreground">
                  Only the payment associated with the imported current
                  membership will be added as Verified. Historical payments will
                  not be imported.
                </p>
              </div>
            </div>

            {/* Membership QR Toggle */}
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
              <Checkbox
                id="generateQrCards"
                checked={settings?.generateQrCards}
                onCheckedChange={(c) =>
                  onSettingsChange?.("generateQrCards", !!c)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="generateQrCards"
                  className="font-semibold text-foreground cursor-pointer"
                >
                  Generate membership QR cards
                </Label>
                <p className="text-xs text-muted-foreground">
                  Create a physical membership QR for members who don't already
                  have one. Stable token is retained across renewals.
                </p>
              </div>
            </div>

            {/* Member Invitation Toggle */}
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
              <Checkbox
                id="sendInvitations"
                checked={settings?.sendInvitations}
                onCheckedChange={(c) =>
                  onSettingsChange?.("sendInvitations", !!c)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="sendInvitations"
                  className="font-semibold text-foreground cursor-pointer"
                >
                  Send TrackVim invitations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Invite members to create their TrackVim account. Members
                  without an account can still be imported with NULL profileId.
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                Existing TrackVim members are not duplicated.
              </span>
              If a matching global member already exists (matching phone/email),
              TrackVim will reuse that existing member and link the membership
              to this gym.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Mapping Card */}
      {uniqueImportedPlanNames.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Membership Plan Mapping
                </CardTitle>
                <CardDescription>
                  Match plan names and duration periods from your imported file
                  with active gym plans in TrackVim.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shrink-0"
              >
                <Link
                  className="flex flex-row justify-center items-center gap-2"
                  href="/owner/plans/new"
                  target="_blank"
                >
                  <Plus className="w-4 h-4" />
                  Create New Plan
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {uniqueImportedPlanNames.map((importedPlan) => {
                const selectedGymPlanId = planMapping[importedPlan] || "";
                const isMapped = !!selectedGymPlanId;

                return (
                  <div
                    key={importedPlan}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      !isMapped ? "bg-amber-500/5" : "hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        CSV
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <span>{importedPlan}</span>
                          {!isMapped && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 text-[10px] gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Unmapped Plan
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>Imported Plan Name</span>
                          {!isMapped && (
                            <Link
                              href="/owner/plans/new"
                              target="_blank"
                              className="text-primary hover:underline flex items-center gap-0.5 font-medium"
                            >
                              + Create new plan for this period
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0" />

                      <Select
                        value={selectedGymPlanId}
                        onValueChange={(val) =>
                          onPlanMappingChange?.(importedPlan, val)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[320px] bg-background border-border">
                          <SelectValue placeholder="Select matching gym plan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGymPlans.map((gymPlan) => (
                            <SelectItem key={gymPlan.id} value={gymPlan.id}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span className="font-medium">
                                  {gymPlan.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ₹{gymPlan.price} (
                                  {gymPlan.membershipDuration ||
                                    `${gymPlan.durationMonths} Mon`}
                                  )
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
