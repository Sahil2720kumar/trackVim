// src/lib/import-trainers-utils.ts

import {
  EmailConflictStatus,
  ImportTrainerPayloadItem,
  ParsedTrainerImportRow,
  TRACKVIM_TRAINER_FIELD_OPTIONS,
  TrainerColumnMappingState,
  TrainerImportSummaryStats,
  TrainerRowValidationError,
  TrainerRowValidationSeverity,
  TrainerTrackVimFieldKey,
} from "@/types/import-trainers.types";
import { downloadFile, parseCsvContent } from "@/lib/import-members-utils";

export { downloadFile, parseCsvContent };

/**
 * Generates a downloadable CSV import template for TrackVim existing trainers.
 */
export function generateTrainerImportTemplateCsv(): string {
  const headers = [
    "Full Name",
    "Contact Email",
    "Contact Phone",
    "Employee ID",
    "Joining Date",
    "Professional Title",
    "Experience (Years)",
    "Qualification",
    "Certification",
    "Salary",
    "Employment Type",
    "Specializations",
    "Working Days",
    "Session Types",
    "Start Time",
    "End Time",
    "Max Members",
    "Max Sessions Per Day",
    "Photo URL",
    "Notes",
  ];

  const sampleRows = [
    [
      "Rahul Kumar",
      "rahul@example.com",
      "+91 9876543210",
      "EMP-101",
      "2024-01-15",
      "Senior Fitness Trainer",
      "5",
      "B.Sc Sports Science",
      "ACE Certified",
      "45000",
      "Full Time",
      "Strength Training;Cardio",
      "Mon;Tue;Wed;Thu;Fri",
      "Personal Training;Group Fitness",
      "06:00",
      "14:00",
      "20",
      "8",
      "https://example.com/photos/rahul.jpg",
      "Experienced strength coach",
    ],
    [
      "Priya Das",
      "priya@example.com",
      "+91 9876543211",
      "EMP-102",
      "2024-03-01",
      "Yoga & Pilates Instructor",
      "3",
      "Certified Yoga Master",
      "RYT 500",
      "35000",
      "Part Time",
      "Yoga;Pilates;Flexibility",
      "Mon;Wed;Fri",
      "Group Fitness",
      "07:00",
      "12:00",
      "15",
      "5",
      "",
      "Specializes in restorative yoga",
    ],
    [
      "Amit Sharma",
      "amit.sharma@example.com",
      "+91 9876543212",
      "EMP-103",
      "2024-05-10",
      "CrossFit Coach",
      "4",
      "Diploma in Fitness",
      "CrossFit Level 2",
      "40000",
      "Full Time",
      "CrossFit;HIIT",
      "Tue;Thu;Sat",
      "Personal Training",
      "08:00",
      "16:00",
      "25",
      "10",
      "",
      "Functional training expert",
    ],
  ];

  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map(escapeCsv).join(",");
  const rowLines = sampleRows.map((r) => r.map(escapeCsv).join(","));

  return [headerLine, ...rowLines].join("\n");
}

/**
 * Intelligent field auto-matching based on column names for trainers.
 */
export function autoDetectTrainerColumnMapping(
  headers: string[],
): TrainerColumnMappingState {
  const mapping: TrainerColumnMappingState = {};

  headers.forEach((header) => {
    const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (
      clean.includes("fullname") ||
      clean === "name" ||
      clean === "trainername" ||
      clean.includes("full_name")
    ) {
      mapping[header] = "fullName";
    } else if (clean.includes("email") || clean.includes("mail")) {
      mapping[header] = "contactEmail";
    } else if (
      clean.includes("phone") ||
      clean.includes("mobile") ||
      clean.includes("contact")
    ) {
      mapping[header] = "contactPhone";
    } else if (
      clean.includes("employeeid") ||
      clean.includes("empid") ||
      clean.includes("employee")
    ) {
      mapping[header] = "employeeId";
    } else if (
      clean.includes("joining") ||
      clean.includes("joined") ||
      clean.includes("startdate")
    ) {
      mapping[header] = "joiningDate";
    } else if (
      clean.includes("title") ||
      clean.includes("designation") ||
      clean.includes("role")
    ) {
      mapping[header] = "professionalTitle";
    } else if (
      clean.includes("experience") ||
      clean.includes("exp") ||
      clean.includes("years")
    ) {
      mapping[header] = "experienceYears";
    } else if (clean.includes("qualification") || clean.includes("degree")) {
      mapping[header] = "qualification";
    } else if (clean.includes("certification") || clean.includes("cert")) {
      mapping[header] = "certification";
    } else if (
      clean.includes("salary") ||
      clean.includes("pay") ||
      clean.includes("remuneration")
    ) {
      mapping[header] = "salary";
    } else if (clean.includes("employment") || clean.includes("jobtype")) {
      mapping[header] = "employmentType";
    } else if (clean.includes("specialization") || clean.includes("skills")) {
      mapping[header] = "specializations";
    } else if (clean.includes("workingday") || clean.includes("workingdays")) {
      mapping[header] = "workingDays";
    } else if (
      clean.includes("maxsession") ||
      clean.includes("sessionsperday") ||
      clean.includes("maxsessions")
    ) {
      mapping[header] = "maxSessionsPerDay";
    } else if (clean.includes("maxmember") || clean.includes("maxmembers") || clean.includes("capacity")) {
      mapping[header] = "maxMembers";
    } else if (clean.includes("sessiontype") || clean.includes("sessiontypes") || clean === "sessions") {
      mapping[header] = "sessionTypes";
    } else if (clean.includes("starttime") || clean.includes("workstart")) {
      mapping[header] = "startTime";
    } else if (clean.includes("endtime") || clean.includes("workend")) {
      mapping[header] = "endTime";
    } else if (
      clean.includes("note") ||
      clean.includes("remark") ||
      clean.includes("bio")
    ) {
      mapping[header] = "additionalNotes";
    } else if (
      clean.includes("photo") ||
      clean.includes("avatar") ||
      clean.includes("picture") ||
      clean.includes("profilepic") ||
      clean.includes("imageurl") ||
      clean.includes("photourl")
    ) {
      mapping[header] = "photoUrl";
    } else {
      mapping[header] = "ignore";
    }
  });

  return mapping;
}

/**
 * Validates parsed trainer rows against rules.
 */
export function validateTrainerImportRows(
  rows: Record<string, string>[],
  mapping: TrainerColumnMappingState,
  emailConflictMap: Record<string, EmailConflictStatus> = {},
): { parsedRows: ParsedTrainerImportRow[]; stats: TrainerImportSummaryStats } {
  const parsedRows: ParsedTrainerImportRow[] = [];
  const seenEmailsInBatch = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // Row 1 is header
    const mappedData: Partial<ImportTrainerPayloadItem> = {
      rowNumber,
    };

    Object.entries(mapping).forEach(([fileCol, trackvimField]) => {
      if (trackvimField === "ignore") return;
      const rawVal = row[fileCol]?.trim();
      if (!rawVal) return;

      const fieldKey = trackvimField as string;

      if (
        fieldKey === "experienceYears" ||
        fieldKey === "salary" ||
        fieldKey === "maxMembers" ||
        fieldKey === "maxSessionsPerDay"
      ) {
        const num = parseFloat(rawVal.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) {
          (mappedData as Record<string, any>)[fieldKey] = num;
        }
      } else if (
        fieldKey === "specializations" ||
        fieldKey === "workingDays" ||
        fieldKey === "sessionTypes"
      ) {
        const items = rawVal.split(/[;,|]/).map((s) => s.trim()).filter(Boolean);
        (mappedData as Record<string, any>)[fieldKey] = items;
      } else {
        (mappedData as Record<string, any>)[fieldKey] = rawVal;
      }
    });

    const issues: TrainerRowValidationError[] = [];
    let existingGlobalTrainerMatch = false;

    // Required Field: Full Name
    if (!mappedData.fullName || mappedData.fullName.trim().length === 0) {
      issues.push({
        field: "Full Name",
        code: "REQUIRED_FIELD_MISSING",
        message: "Full Name is required.",
        suggestedAction: "Enter a valid trainer name.",
      });
    }

    // Employment Type Validation
    if (mappedData.employmentType) {
      const empType = mappedData.employmentType.trim();
      const validTypes = ["Full Time", "Part Time", "Contract"];
      const matched = validTypes.find(
        (t) => t.toLowerCase() === empType.toLowerCase(),
      );

      if (matched) {
        mappedData.employmentType = matched as any;
      } else {
        issues.push({
          field: "Employment Type",
          code: "INVALID_EMPLOYMENT_TYPE",
          message: `"${empType}" is not a supported employment type.`,
          suggestedAction: "Use Full Time, Part Time, or Contract.",
        });
      }
    }

    // Email Validation & Duplicate Check
    let emailStatus: EmailConflictStatus = "available";

    if (mappedData.contactEmail) {
      const cleanEmail = mappedData.contactEmail.trim().toLowerCase();

      if (!cleanEmail.includes("@")) {
        issues.push({
          field: "Contact Email",
          code: "INVALID_EMAIL",
          message: "Contact Email format is invalid.",
          suggestedAction: "Provide a valid email address.",
        });
      } else {
        mappedData.contactEmail = cleanEmail;

        if (seenEmailsInBatch.has(cleanEmail)) {
          issues.push({
            field: "Contact Email",
            code: "DUPLICATE_EMAIL_IN_IMPORT",
            message: "This email appears more than once in the uploaded file.",
            suggestedAction: "Remove or update duplicate trainer email rows.",
          });
        }
        seenEmailsInBatch.add(cleanEmail);

        // Check pre-fetched email conflict status if available
        if (emailConflictMap[cleanEmail]) {
          emailStatus = emailConflictMap[cleanEmail];
        }

        if (emailStatus === "member_email") {
          issues.push({
            field: "Contact Email",
            code: "EMAIL_BELONGS_TO_MEMBER",
            message: "This email already belongs to a TrackVim member account.",
            suggestedAction: "Use a different email address and retry this row.",
          });
        } else if (emailStatus === "owner_email") {
          issues.push({
            field: "Contact Email",
            code: "EMAIL_BELONGS_TO_OWNER",
            message: "This email belongs to an owner account and cannot be used for a trainer.",
            suggestedAction: "Use a different email address for this trainer.",
          });
        } else if (emailStatus === "existing_trainer_gym") {
          issues.push({
            field: "Contact Email",
            code: "TRAINER_ALREADY_EXISTS_IN_GYM",
            message: "A trainer with this email already exists in this gym.",
            suggestedAction: "Review existing gym trainers.",
          });
        } else if (emailStatus === "existing_trainer_other") {
          existingGlobalTrainerMatch = true;
          issues.push({
            field: "Contact Email",
            code: "EXISTING_TRAINER_ACCOUNT",
            message: "This email belongs to an existing trainer account and will be linked to this gym.",
            suggestedAction: "Informational state — global trainer account will be linked.",
          });
        }
      }
    }

    // Determine severity
    let severity: TrainerRowValidationSeverity = "ready";
    const hasError = issues.some(
      (i) =>
        i.code === "REQUIRED_FIELD_MISSING" ||
        i.code === "INVALID_EMPLOYMENT_TYPE" ||
        i.code === "INVALID_EMAIL" ||
        i.code === "DUPLICATE_EMAIL_IN_IMPORT" ||
        i.code === "EMAIL_BELONGS_TO_MEMBER" ||
        i.code === "EMAIL_BELONGS_TO_OWNER" ||
        i.code === "TRAINER_ALREADY_EXISTS_IN_GYM",
    );
    const hasWarning = issues.some(
      (i) => i.code === "EXISTING_TRAINER_ACCOUNT",
    );

    if (hasError) {
      severity = "error";
    } else if (hasWarning) {
      severity = "warning";
    }

    parsedRows.push({
      rowNumber,
      rawData: row,
      mappedData,
      severity,
      issues,
      emailConflictStatus: emailStatus,
      existingGlobalTrainerMatch,
    });
  });

  const stats: TrainerImportSummaryStats = {
    totalRows: parsedRows.length,
    readyRows: parsedRows.filter((r) => r.severity === "ready").length,
    warningRows: parsedRows.filter((r) => r.severity === "warning").length,
    errorRows: parsedRows.filter((r) => r.severity === "error").length,
    duplicateRows: parsedRows.filter((r) =>
      r.issues.some((i) => i.code === "DUPLICATE_EMAIL_IN_IMPORT" || i.code === "TRAINER_ALREADY_EXISTS_IN_GYM"),
    ).length,
    existingGlobalMatches: parsedRows.filter((r) => r.existingGlobalTrainerMatch).length,
  };

  return { parsedRows, stats };
}
