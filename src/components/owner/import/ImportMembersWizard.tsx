// src/components/owner/import/ImportMembersWizard.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Table as TableIcon,
  Settings,
  CheckSquare,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StepUploadFile } from "./StepUploadFile";
import { StepColumnMapping } from "./StepColumnMapping";
import { StepImportSettings } from "./StepImportSettings";
import { StepValidationReview } from "./StepValidationReview";
import { StepConfirmation } from "./StepConfirmation";
import { ImportProgressModal } from "./ImportProgressModal";
import { ImportSuccessScreen } from "./ImportSuccessScreen";
import { ImportReportModal } from "./ImportReportModal";

import {
  ColumnMappingState,
  ImportBatchPayloadItem,
  ImportBatchResult,
  ImportSettingsState,
  ParsedImportRow,
  PlanMappingState,
  TrackVimFieldKey,
} from "@/types/import-members.types";
import {
  autoDetectColumnMapping,
  validateImportRows,
  calculateMonthsBetween,
  normalizeDate,
} from "@/lib/import-members-utils";
import { importMembersBatchAction } from "@/actions/import-members.action";
import {
  useImportGymPlans,
  useImportExistingPhones,
} from "@/hooks/queries/import-members.query";

interface ImportMembersWizardProps {
  gymId: string;
}

export function ImportMembersWizard({ gymId }: ImportMembersWizardProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);

  // Column Mapping state
  const [mapping, setMapping] = useState<ColumnMappingState>({});

  // Import Settings state
  const [settings, setSettings] = useState<ImportSettingsState>({
    createActiveMemberships: true,
    importCurrentPayment: false,
    generateQrCards: true,
    sendInvitations: false,
  });

  const [planMapping, setPlanMapping] = useState<PlanMappingState>({});

  // Execution states
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [importResult, setImportResult] = useState<ImportBatchResult | null>(
    null,
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Queries using our React Query hooks
  const { data: availableGymPlans = [] } = useImportGymPlans(gymId);
  const { data: existingPhoneData } = useImportExistingPhones(gymId);

  const existingGymPhones = useMemo(
    () => existingPhoneData?.gymPhones || new Set<string>(),
    [existingPhoneData],
  );
  const existingGlobalPhones = useMemo(
    () => existingPhoneData?.globalPhones || new Set<string>(),
    [existingPhoneData],
  );

  // Handle File Load
  const handleFileLoaded = (
    file: File,
    headers: string[],
    rows: Record<string, string>[],
  ) => {
    setSelectedFile(file);
    setFileHeaders(headers);
    setRawRows(rows);

    // Auto-detect column mappings
    const autoMap = autoDetectColumnMapping(headers);
    setMapping(autoMap);

    // Extract distinct plan names from raw rows and auto-map
    const planCol = Object.entries(autoMap).find(
      ([_, f]) => f === "planName",
    )?.[0];
    const startCol = Object.entries(autoMap).find(
      ([_, f]) => f === "startDate",
    )?.[0];
    const endCol = Object.entries(autoMap).find(
      ([_, f]) => f === "endDate",
    )?.[0];

    if (planCol) {
      const distinctPlans = Array.from(
        new Set(rows.map((r) => r[planCol]?.trim()).filter(Boolean)),
      );

      const initialPlanMapping: PlanMappingState = {};
      distinctPlans.forEach((importedName) => {
        const sampleRow = rows.find((r) => r[planCol]?.trim() === importedName);
        let rowPeriodMonths = 0;
        if (sampleRow && startCol && endCol) {
          const s = normalizeDate(sampleRow[startCol]);
          const e = normalizeDate(sampleRow[endCol]);
          if (s && e) {
            rowPeriodMonths = calculateMonthsBetween(s, e);
          }
        }

        const clean = importedName.toLowerCase();

        // 1. Check if gym plan matches BOTH period AND name
        let match = availableGymPlans.find(
          (gp) =>
            rowPeriodMonths > 0 &&
            gp.durationMonths === rowPeriodMonths &&
            (gp.name.toLowerCase() === clean ||
              clean.includes(gp.name.toLowerCase())),
        );

        // 2. Check if gym plan matches date range period
        if (!match && rowPeriodMonths > 0) {
          match = availableGymPlans.find(
            (gp) => gp.durationMonths === rowPeriodMonths,
          );
        }

        // 3. Check if gym plan matches exact name AND duration
        if (!match) {
          match = availableGymPlans.find(
            (gp) =>
              gp.name.toLowerCase() === clean &&
              (rowPeriodMonths === 0 || gp.durationMonths === rowPeriodMonths),
          );
        }

        if (match) {
          initialPlanMapping[importedName] = match.id;
        } else {
          initialPlanMapping[importedName] = ""; // Do NOT auto-assign a mismatched period plan!
        }
      });
      setPlanMapping(initialPlanMapping);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setFileHeaders([]);
    setRawRows([]);
    setMapping({});
    setCurrentStep(1);
    setImportResult(null);
  };

  // Distinct imported plan names derived from mapped planName column
  const uniqueImportedPlanNames = useMemo(() => {
    const planCol = Object.entries(mapping).find(
      ([_, f]) => f === "planName",
    )?.[0];
    if (!planCol) return [];
    return Array.from(
      new Set(rawRows.map((r) => r[planCol]?.trim()).filter(Boolean)),
    );
  }, [mapping, rawRows]);

  // Handle Plan Mapping Change
  const handlePlanMappingChange = (
    importedPlanName: string,
    gymPlanId: string,
  ) => {
    setPlanMapping((prev) => ({
      ...prev,
      [importedPlanName]: gymPlanId,
    }));
  };

  // Validation execution & summary stats
  const { parsedRows, stats } = useMemo(() => {
    if (rawRows.length === 0) {
      return {
        parsedRows: [] as ParsedImportRow[],
        stats: {
          totalRows: 0,
          readyRows: 0,
          warningRows: 0,
          errorRows: 0,
          duplicateRows: 0,
          existingGlobalMatches: 0,
        },
      };
    }

    return validateImportRows(
      rawRows,
      mapping,
      availableGymPlans,
      planMapping,
      existingGymPhones,
      existingGlobalPhones,
    );
  }, [
    rawRows,
    mapping,
    availableGymPlans,
    planMapping,
    existingGymPhones,
    existingGlobalPhones,
  ]);

  // Valid rows ready for import (ready or warning)
  const validRowsToImport = useMemo(() => {
    return parsedRows.filter(
      (r) => r.severity === "ready" || r.severity === "warning",
    );
  }, [parsedRows]);

  const validPaymentCount = useMemo(() => {
    return validRowsToImport.filter(
      (r) => r.mappedData.paymentAmount && r.mappedData.paymentAmount > 0,
    ).length;
  }, [validRowsToImport]);

  // Execute Import Batch
  const handleExecuteImport = async () => {
    if (validRowsToImport.length === 0) {
      toast.error("No valid rows ready to import.");
      return;
    }

    setIsProcessingBatch(true);
    setProcessedCount(0);

    const payloadItems: ImportBatchPayloadItem[] = validRowsToImport.map(
      (row) => {
        const importedPlanName = row.mappedData.planName || "";
        const selectedPlanId =
          planMapping[importedPlanName] || availableGymPlans[0]?.id || "";

        return {
          rowNumber: row.rowNumber,
          fullName: row.mappedData.fullName!,
          contactPhone: row.mappedData.contactPhone || null,
          contactEmail: row.mappedData.contactEmail || null,
          dateOfBirth: row.mappedData.dateOfBirth || null,
          gender: row.mappedData.gender || null,
          address: row.mappedData.address || null,
          planId: selectedPlanId,
          startDate: row.mappedData.startDate!,
          endDate: row.mappedData.endDate!,
          paymentAmount: row.mappedData.paymentAmount || null,
          paymentDate: row.mappedData.paymentDate || null,
          paymentMethod: row.mappedData.paymentMethod || null,
          notes: row.mappedData.notes || null,
          photoUrl: row.mappedData.photoUrl || null,
        };
      },
    );

    // Simulate batch progress counter for smooth UI response
    const interval = setInterval(() => {
      setProcessedCount((prev) => {
        if (prev < payloadItems.length) {
          return Math.min(
            payloadItems.length,
            prev + Math.ceil(payloadItems.length / 10),
          );
        }
        return prev;
      });
    }, 250);

    const res = await importMembersBatchAction(gymId, payloadItems, settings);
    clearInterval(interval);
    setProcessedCount(payloadItems.length);
    setIsProcessingBatch(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    setImportResult(res.data);
    if (res.data.membershipsCreated > 0) {
      if (res.data.skippedCount > 0 || res.data.errorRows.length > 0) {
        toast.warning(
          `Imported ${res.data.membershipsCreated} members. ${res.data.skippedCount + res.data.errorRows.length} rows were skipped or had issues.`,
        );
      } else {
        toast.success(
          `Successfully imported ${res.data.membershipsCreated} member records!`,
        );
      }
    } else {
      toast.error(
        `0 members imported. All ${res.data.skippedCount + res.data.errorRows.length} rows were skipped or encountered errors.`,
      );
    }
  };

  const stepsMeta = [
    { number: 1, label: "Upload File", icon: Upload },
    { number: 2, label: "Column Mapping", icon: TableIcon },
    { number: 3, label: "Settings & Plans", icon: Settings },
    { number: 4, label: "Review & Validate", icon: CheckSquare },
    { number: 5, label: "Confirmation", icon: ShieldCheck },
  ];

  // If import completed, render success screen!
  if (importResult) {
    return (
      <div className="py-6 space-y-6">
        <ImportSuccessScreen
          result={importResult}
          onViewReport={() => setIsReportModalOpen(true)}
          onReset={handleResetFile}
        />
        <ImportReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          result={importResult}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Wizard Stepper Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
          {stepsMeta.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-muted-foreground font-normal"
                  }`}
                  onClick={() => {
                    if (isCompleted || (step.number === 2 && selectedFile)) {
                      setCurrentStep(step.number);
                    }
                  }}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : isCurrent
                          ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span className="text-xs sm:text-sm hidden md:inline">
                    {step.label}
                  </span>
                </div>

                {idx < stepsMeta.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 sm:mx-4 transition-colors ${
                      isCompleted ? "bg-emerald-500/50" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Render */}
      <div className="max-w-4xl mx-auto space-y-6">
        {currentStep === 1 && (
          <StepUploadFile
            onFileLoaded={handleFileLoaded}
            selectedFile={selectedFile}
            rowCount={rawRows.length}
            onResetFile={handleResetFile}
          />
        )}

        {currentStep === 2 && (
          <StepColumnMapping
            headers={fileHeaders}
            mapping={mapping}
            onMappingChange={(col, field) =>
              setMapping((prev) => ({ ...prev, [col]: field }))
            }
            sampleRows={rawRows}
          />
        )}

        {currentStep === 3 && (
          <StepImportSettings
            settings={settings}
            onSettingsChange={(key, val) =>
              setSettings((prev) => ({ ...prev, [key]: val }))
            }
            uniqueImportedPlanNames={uniqueImportedPlanNames}
            availableGymPlans={availableGymPlans}
            planMapping={planMapping}
            onPlanMappingChange={handlePlanMappingChange}
          />
        )}

        {currentStep === 4 && (
          <StepValidationReview
            parsedRows={parsedRows}
            stats={stats}
            onGoToPlanMapping={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepConfirmation
            stats={stats}
            settings={settings}
            validRowCount={validRowsToImport.length}
            paymentCount={validPaymentCount}
            onConfirmImport={handleExecuteImport}
            onBack={() => setCurrentStep(4)}
            isSubmitting={isProcessingBatch}
          />
        )}

        {/* Wizard Footer Navigation */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 1) setCurrentStep(currentStep - 1);
                else router.push("/owner/members");
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? "Back to Members" : "Previous Step"}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 1 && !selectedFile) {
                  toast.error("Please upload a file to proceed.");
                  return;
                }
                if (currentStep === 2) {
                  const mapped = Object.values(mapping);
                  const missingRequired = [
                    "fullName",
                    "planName",
                    "startDate",
                    "endDate",
                  ].filter((req) => !mapped.includes(req as TrackVimFieldKey));
                  if (missingRequired.length > 0) {
                    toast.error(
                      `Please map required fields: ${missingRequired.join(", ")}`,
                    );
                    return;
                  }
                }
                setCurrentStep(currentStep + 1);
              }}
              disabled={currentStep === 1 && !selectedFile}
              className="gap-2 px-6"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Live Import Progress Modal */}
      <ImportProgressModal
        isOpen={isProcessingBatch}
        processedCount={processedCount}
        totalCount={validRowsToImport.length}
        currentStage={
          processedCount === 0
            ? "validating"
            : processedCount < validRowsToImport.length / 3
              ? "members"
              : processedCount < (validRowsToImport.length * 2) / 3
                ? "memberships"
                : "payments"
        }
      />
    </div>
  );
}
