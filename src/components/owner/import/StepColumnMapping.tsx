// src/components/owner/import/StepColumnMapping.tsx
"use client";

import { Check, HelpCircle, AlertTriangle, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ColumnMappingState,
  TRACKVIM_FIELD_OPTIONS,
  TrackVimFieldKey,
} from "@/types/import-members.types";
import { autoDetectColumnMapping } from "@/lib/import-members-utils";

export interface FieldOptionItem {
  key: string;
  label: string;
  required?: boolean;
}

interface StepColumnMappingProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (fileColumn: string, fieldKey: any) => void;
  sampleRows: Record<string, string>[];
  title?: string;
  description?: string;
  fieldOptions?: FieldOptionItem[];
  mandatoryFieldsLabel?: string;
  optionalFieldsLabel?: string;
  autoDetectFn?: (headers: string[]) => Record<string, string>;
}

/**
 * Helper to check if sample data format matches expected field type.
 */
function checkSampleFormat(
  sampleVal: string,
  fieldKey: string,
): { isMismatch: boolean; message?: string } {
  if (
    !sampleVal ||
    sampleVal === "—" ||
    fieldKey === "ignore" ||
    fieldKey === "notes" ||
    fieldKey === "additionalNotes" ||
    fieldKey === "address" ||
    fieldKey === "fullName"
  ) {
    return { isMismatch: false };
  }

  const clean = sampleVal.trim();

  if (fieldKey === "paymentAmount" || fieldKey === "salary" || fieldKey === "experienceYears") {
    const hasDigits = /[0-9]/.test(clean);
    if (!hasDigits) {
      return { isMismatch: true, message: "Expected numeric value" };
    }
  }

  if (
    fieldKey === "startDate" ||
    fieldKey === "endDate" ||
    fieldKey === "dateOfBirth" ||
    fieldKey === "paymentDate" ||
    fieldKey === "joiningDate"
  ) {
    const hasDigits = /[0-9]/.test(clean);
    const parsed = new Date(clean);
    const isValidDate = hasDigits && !isNaN(parsed.getTime());
    const isDmy = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(clean);

    if (!isValidDate && !isDmy) {
      return { isMismatch: true, message: "Sample data doesn't look like a valid date" };
    }
  }

  if (fieldKey === "contactEmail") {
    if (!clean.includes("@")) {
      return { isMismatch: true, message: "Sample data doesn't look like an email address" };
    }
  }

  if (fieldKey === "contactPhone") {
    const digits = clean.replace(/[^0-9]/g, "");
    if (digits.length < 5) {
      return { isMismatch: true, message: "Sample data doesn't look like a phone number" };
    }
  }

  return { isMismatch: false };
}

export function StepColumnMapping({
  headers,
  mapping,
  onMappingChange,
  sampleRows,
  title = "Map your columns",
  description = "Match your uploaded file columns with standard TrackVim fields.",
  fieldOptions = TRACKVIM_FIELD_OPTIONS,
  mandatoryFieldsLabel = "Full Name, Membership Plan, Start Date, End Date",
  optionalFieldsLabel = "Email, Phone, Date of Birth, Gender, Address, Payment Amount/Date/Method, Notes",
  autoDetectFn = autoDetectColumnMapping,
}: StepColumnMappingProps) {
  const mappedFieldKeys = Object.values(mapping).filter((k) => k !== "ignore");
  const missingRequiredFields = fieldOptions.filter(
    (opt) => opt.required && !mappedFieldKeys.includes(opt.key),
  );

  // Auto-detection mapping baseline to check if a mapping was auto-matched vs manual
  const autoMapBaseline = autoDetectFn(headers);

  return (
    <div className="space-y-6">
      {/* Legend & Alert Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {missingRequiredFields.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold">Missing Required Mappings: </span>
                Please map {missingRequiredFields.map((f) => f.label).join(", ")} before continuing.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Badge variant="default" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-red-200 dark:border-red-900 text-[10px]">
                  Required
                </Badge>
                Mandatory Fields
              </h4>
              <p className="text-xs text-muted-foreground">
                {mandatoryFieldsLabel}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  Optional
                </Badge>
                Optional Metadata
              </h4>
              <p className="text-xs text-muted-foreground">
                {optionalFieldsLabel}
              </p>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="border border-border rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[28%]">Your Column</TableHead>
                  <TableHead className="w-[38%]">TrackVim Field</TableHead>
                  <TableHead className="w-[18%]">Sample Data (Row 1)</TableHead>
                  <TableHead className="w-[16%] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {headers.map((header) => {
                  const currentSelected = mapping[header] || "ignore";
                  const sampleVal = sampleRows[0]?.[header] || "—";
                  const autoDetectedField = autoMapBaseline[header] || "ignore";

                  const formatCheck = checkSampleFormat(sampleVal, currentSelected);
                  const isAutoMatched =
                    currentSelected !== "ignore" && currentSelected === autoDetectedField;
                  const isManuallyMapped =
                    currentSelected !== "ignore" && currentSelected !== autoDetectedField;

                  return (
                    <TableRow key={header} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <span className="font-semibold">{header}</span>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={currentSelected}
                          onValueChange={(val) =>
                            onMappingChange(header, val as TrackVimFieldKey)
                          }
                        >
                          <SelectTrigger className="w-full bg-background border-border">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ignore">
                              <span className="text-muted-foreground italic">
                                — Not imported —
                              </span>
                            </SelectItem>
                            {fieldOptions.map((field) => (
                              <SelectItem key={field.key} value={field.key}>
                                <div className="flex items-center gap-2">
                                  <span>{field.label}</span>
                                  {field.required ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-1 py-0"
                                    >
                                      Required
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] px-1 py-0"
                                    >
                                      Optional
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {sampleVal}
                      </TableCell>

                      <TableCell className="text-right">
                        {currentSelected === "ignore" && (
                          <span className="text-xs text-muted-foreground font-normal">
                            Ignored
                          </span>
                        )}

                        {currentSelected !== "ignore" && formatCheck.isMismatch && (
                          <div className="inline-flex flex-col items-end">
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 gap-1 text-[10px]"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Format Mismatch
                            </Badge>
                            {formatCheck.message && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 max-w-[140px] truncate">
                                {formatCheck.message}
                              </span>
                            )}
                          </div>
                        )}

                        {currentSelected !== "ignore" &&
                          !formatCheck.isMismatch &&
                          isAutoMatched && (
                            <div className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-4 h-4" />
                              <span>Auto-Matched</span>
                            </div>
                          )}

                        {currentSelected !== "ignore" &&
                          !formatCheck.isMismatch &&
                          isManuallyMapped && (
                            <div className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                              <Pencil className="w-3 h-3" />
                              <span>Mapped</span>
                            </div>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
