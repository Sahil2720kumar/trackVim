// src/components/owner/import/ImportTrainersWizard.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Settings,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EmailConflictStatus,
  ImportTrainerBatchResult,
  ImportTrainerPayloadItem,
  ImportTrainerSettings,
  ParsedTrainerImportRow,
  TRACKVIM_TRAINER_FIELD_OPTIONS,
  TrainerColumnMappingState,
  TrainerTrackVimFieldKey,
} from "@/types/import-trainers.types";
import {
  autoDetectTrainerColumnMapping,
  downloadFile,
  generateTrainerImportTemplateCsv,
  validateTrainerImportRows,
} from "@/lib/import-trainers-utils";
import { importTrainersBatchAction } from "@/actions/import-trainers.action";
import { useImportTrainerEmailConflicts } from "@/hooks/queries/import-trainers.query";

// Reuse step components from components/owner/import
import { StepUploadFile } from "./StepUploadFile";
import { StepColumnMapping } from "./StepColumnMapping";
import { StepImportSettings } from "./StepImportSettings";
import { StepValidationReview } from "./StepValidationReview";
import { StepConfirmation } from "./StepConfirmation";
import { ImportProgressModal } from "./ImportProgressModal";
import { ImportSuccessScreen } from "./ImportSuccessScreen";
import { ImportReportModal } from "./ImportReportModal";

// Stable id so a new import's outcome toast REPLACES any toast still
// on screen from a previous run, instead of stacking a second one.
// Without this, a leftover "Successfully imported N trainers!" toast
// from an earlier run can still be visible while a later run's
// (correct) error toast is rendered underneath/after it, which reads
// as if the wrong message was shown for the current run.
const TRAINER_IMPORT_TOAST_ID = "trainer-import-result";

interface ImportTrainersWizardProps {
  gymId: string;
}

export function ImportTrainersWizard({ gymId }: ImportTrainersWizardProps) {
  // Wizard active step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);

  // Step 2: Column mapping state
  const [columnMapping, setColumnMapping] = useState<TrainerColumnMappingState>(
    {},
  );

  // Step 3: Import settings state
  const [settings, setSettings] = useState<ImportTrainerSettings>({
    sendInvitations: true,
  });

  // Submission & Progress modal state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progressOpen, setProgressOpen] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<
    "validating" | "processed" | "records" | "invitations" | "complete"
  >("validating");

  // Success result & Report modal state
  const [importResult, setImportResult] =
    useState<ImportTrainerBatchResult | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Step 1: File upload handler
  const handleFileLoaded = (
    file: File,
    headers: string[],
    rows: Record<string, string>[],
  ) => {
    setSelectedFile(file);
    setFileHeaders(headers);
    setRawRows(rows);

    // Auto-detect column mapping
    const detected = autoDetectTrainerColumnMapping(headers);
    setColumnMapping(detected);
  };

  const handleResetFile = () => {
    // Clear any toast left over from a previous import run so it can't
    // still be visible once the user starts a fresh attempt.
    toast.dismiss(TRAINER_IMPORT_TOAST_ID);

    setSelectedFile(null);
    setFileHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setCurrentStep(1);
    setImportResult(null);
  };

  // Step 2: Mapping change handler
  const handleMappingChange = (
    fileColumn: string,
    fieldKey: TrainerTrackVimFieldKey,
  ) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fileColumn]: fieldKey,
    }));
  };

  // Extract trainer emails from raw rows based on column mapping
  const trainerEmails = useMemo(() => {
    const emailCol = Object.entries(columnMapping).find(
      ([_, field]) => field === "contactEmail",
    )?.[0];
    if (!emailCol) return [];
    const emails = new Set<string>();
    rawRows.forEach((r) => {
      const email = r[emailCol]?.trim().toLowerCase();
      if (email && email.includes("@")) {
        emails.add(email);
      }
    });
    return Array.from(emails);
  }, [rawRows, columnMapping]);

  // Query hook for fetching trainer email conflict map
  const { data: emailConflictMap = {} } = useImportTrainerEmailConflicts(
    gymId,
    trainerEmails,
  );

  // Client-side row validation
  const { parsedRows, stats } = useMemo(() => {
    if (!rawRows.length) {
      return {
        parsedRows: [],
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
    return validateTrainerImportRows(rawRows, columnMapping, emailConflictMap);
  }, [rawRows, columnMapping, emailConflictMap]);

  // Valid rows ready for final import
  const validRowsToImport = useMemo(() => {
    return parsedRows.filter(
      (r) => r.severity === "ready" || r.severity === "warning",
    );
  }, [parsedRows]);

  // Handle final submission to batch server action
  const handleExecuteImport = async () => {
    if (validRowsToImport.length === 0) {
      toast.error("No valid trainer rows to import.");
      return;
    }

    // Clear any toast left over from a previous import run (e.g. an
    // earlier "Successfully imported N trainers!") before starting a
    // new one, so it can't still be on screen when this run finishes.
    toast.dismiss(TRAINER_IMPORT_TOAST_ID);

    setIsSubmitting(true);
    setProgressOpen(true);
    setProcessedCount(0);
    setProgressStage("validating");

    try {
      // Stage 1: Validating
      await new Promise((res) => setTimeout(res, 400));
      setProgressStage("processed");
      setProcessedCount(Math.round(validRowsToImport.length * 0.25));

      // Build payload items
      const payloadItems: ImportTrainerPayloadItem[] = validRowsToImport.map(
        (row) => ({
          rowNumber: row.rowNumber,
          fullName: row.mappedData.fullName || "Trainer",
          contactEmail: row.mappedData.contactEmail || null,
          contactPhone: row.mappedData.contactPhone || null,
          employeeId: row.mappedData.employeeId || null,
          joiningDate: row.mappedData.joiningDate || null,
          professionalTitle: row.mappedData.professionalTitle || null,
          experienceYears: row.mappedData.experienceYears || null,
          qualification: row.mappedData.qualification || null,
          certification: row.mappedData.certification || null,
          salary: row.mappedData.salary || null,
          employmentType: row.mappedData.employmentType || null,
          specializations: row.mappedData.specializations || [],
          workingDays: row.mappedData.workingDays || [],
          sessionTypes: row.mappedData.sessionTypes || [],
          startTime: row.mappedData.startTime || null,
          endTime: row.mappedData.endTime || null,
          maxMembers: row.mappedData.maxMembers || null,
          maxSessionsPerDay: row.mappedData.maxSessionsPerDay || null,
          additionalNotes: row.mappedData.additionalNotes || null,
          photoUrl: row.mappedData.photoUrl || null,
        }),
      );

      // Stage 2: Records creation
      setProgressStage("records");
      setProcessedCount(Math.round(validRowsToImport.length * 0.5));

      const actionResult = await importTrainersBatchAction(
        gymId,
        payloadItems,
        settings,
      );

      // Stage 3: Invitations & completion
      if (settings.sendInvitations) {
        setProgressStage("invitations");
        setProcessedCount(Math.round(validRowsToImport.length * 0.85));
        await new Promise((res) => setTimeout(res, 400));
      }

      setProgressStage("complete");
      setProcessedCount(validRowsToImport.length);
      await new Promise((res) => setTimeout(res, 300));

      if (!actionResult.success) {
        toast.error(actionResult.error || "Failed to import trainers.", {
          id: TRAINER_IMPORT_TOAST_ID,
        });
        setProgressOpen(false);
        setIsSubmitting(false);
        return;
      }

      setImportResult(actionResult.data);
      const importedCount = actionResult.data.successfulRows.length;
      const skippedOrErrorCount =
        actionResult.data.skippedCount + actionResult.data.errorRows.length;

      if (importedCount > 0) {
        if (skippedOrErrorCount > 0) {
          toast.warning(
            `Imported ${importedCount} trainers. ${skippedOrErrorCount} rows were skipped or had issues.`,
            { id: TRAINER_IMPORT_TOAST_ID },
          );
        } else {
          toast.success(`Successfully imported ${importedCount} trainers!`, {
            id: TRAINER_IMPORT_TOAST_ID,
          });
        }
      } else {
        toast.error(
          `0 trainers imported. All ${skippedOrErrorCount} rows were skipped or encountered errors.`,
          { id: TRAINER_IMPORT_TOAST_ID },
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during trainer import.", {
        id: TRAINER_IMPORT_TOAST_ID,
      });
    } finally {
      setIsSubmitting(false);
      setProgressOpen(false);
    }
  };

  // Next step navigation with validation checks
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!selectedFile || rawRows.length === 0) {
        toast.error("Please upload a valid CSV or Excel file first.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Check missing required fields
      const mappedFieldKeys = Object.values(columnMapping).filter(
        (k) => k !== "ignore",
      );
      const missing = TRACKVIM_TRAINER_FIELD_OPTIONS.filter(
        (f) => f.required && !mappedFieldKeys.includes(f.key),
      );
      if (missing.length > 0) {
        toast.error(
          `Please map required field: ${missing.map((m) => m.label).join(", ")}`,
        );
        return;
      }

      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (validRowsToImport.length === 0) {
        toast.error(
          "No valid trainer rows available to import. Please review errors.",
        );
        return;
      }
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Step indicator steps
  const stepsList = [
    { number: 1, label: "Upload File", icon: FileSpreadsheet },
    { number: 2, label: "Column Mapping", icon: CheckCircle2 },
    { number: 3, label: "Import Settings", icon: Settings },
    { number: 4, label: "Review Import", icon: AlertTriangle },
    { number: 5, label: "Confirmation", icon: ShieldCheck },
  ];

  // If import completed successfully, show success screen
  if (importResult) {
    return (
      <>
        <ImportSuccessScreen
          entityType="trainer"
          trainerResult={importResult}
          onViewReport={() => setReportModalOpen(true)}
          onReset={handleResetFile}
        />

        <ImportReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          entityType="trainer"
          trainerResult={importResult}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wizard Steps Stepper Header */}
      <Card className="border-border shadow-xs bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {stepsList.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : isCurrent
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold whitespace-nowrap hidden md:inline ${
                      isCurrent
                        ? "text-foreground"
                        : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < stepsList.length - 1 && (
                  <div className="w-6 sm:w-12 h-[2px] bg-border mx-3 sm:mx-4 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <div className="min-w-0">
        {currentStep === 1 && (
          <StepUploadFile
            title="Upload trainer data"
            description="Upload a CSV or Excel file containing your existing trainers."
            templateFilename="TrackVim_Trainer_Import_Template.csv"
            onDownloadTemplate={() => {
              const csvContent = generateTrainerImportTemplateCsv();
              downloadFile("TrackVim_Trainer_Import_Template.csv", csvContent);
            }}
            onFileLoaded={handleFileLoaded}
            selectedFile={selectedFile}
            rowCount={rawRows.length}
            onResetFile={handleResetFile}
          />
        )}

        {currentStep === 2 && (
          <StepColumnMapping
            title="Map your columns"
            description="Match your file columns with TrackVim trainer fields."
            fieldOptions={TRACKVIM_TRAINER_FIELD_OPTIONS}
            mandatoryFieldsLabel="Full Name *"
            optionalFieldsLabel="Email, Phone, Employee ID, Joining Date, Title, Experience, Qualification, Certification, Salary, Employment Type, Specializations, Working Days, Session Types, Work Hours, Photo URL, Notes"
            autoDetectFn={autoDetectTrainerColumnMapping}
            headers={fileHeaders}
            mapping={columnMapping}
            onMappingChange={handleMappingChange}
            sampleRows={rawRows}
          />
        )}

        {currentStep === 3 && (
          <StepImportSettings
            entityType="trainer"
            trainerSendInvitations={settings.sendInvitations}
            onTrainerSendInvitationsChange={(checked) =>
              setSettings({ sendInvitations: checked })
            }
          />
        )}

        {currentStep === 4 && (
          <StepValidationReview
            entityType="trainer"
            parsedTrainerRows={parsedRows}
            trainerStats={stats}
          />
        )}

        {currentStep === 5 && (
          <StepConfirmation
            entityType="trainer"
            validRowCount={validRowsToImport.length}
            newTrainerCount={
              validRowsToImport.filter((r) => !r.existingGlobalTrainerMatch)
                .length
            }
            linkedTrainerCount={
              validRowsToImport.filter((r) => r.existingGlobalTrainerMatch)
                .length
            }
            invitationCount={
              settings.sendInvitations
                ? validRowsToImport.filter(
                    (r) =>
                      !r.existingGlobalTrainerMatch &&
                      r.mappedData.contactEmail,
                  ).length
                : 0
            }
            onConfirmImport={handleExecuteImport}
            onBack={handlePrevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Wizard Footer Controls (Steps 1 to 4) */}
      {currentStep < 5 && (
        <Card className="border-border shadow-xs bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="w-full sm:w-auto gap-2 border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFile}
                className="text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}

            <Button
              onClick={handleNextStep}
              disabled={!selectedFile || rawRows.length === 0 || isSubmitting}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Progress Modal */}
      <ImportProgressModal
        isOpen={progressOpen}
        processedCount={processedCount}
        totalCount={validRowsToImport.length}
        entityType="trainer"
        trainerCurrentStage={progressStage}
      />
    </div>
  );
}
