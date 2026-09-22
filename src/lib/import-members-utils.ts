// src/lib/import-members-utils.ts

import {
  ColumnMappingState,
  ImportSummaryStats,
  ParsedImportRow,
  PlanMappingState,
  RowValidationError,
  RowValidationSeverity,
  TRACKVIM_FIELD_OPTIONS,
  TrackVimFieldKey,
} from "@/types/import-members.types";

/**
 * Generates a downloadable CSV import template for TrackVim existing members.
 */
export function generateImportTemplateCsv(): string {
  const headers = [
    "Full Name",
    "Contact Phone",
    "Contact Email",
    "Date of Birth",
    "Gender",
    "Photo URL",
    "Membership Plan",
    "Membership Start Date",
    "Membership End Date",
    "Current Payment Amount",
    "Payment Date",
    "Payment Method",
    "Address",
    "Notes",
  ];

  const sampleRows = [
    [
      "Rahul Kumar",
      "+91 9876543210",
      "rahul.kumar@example.com",
      "1994-05-15",
      "Male",
      "https://example.com/photos/rahul.jpg",
      "Gold Monthly",
      "2026-09-01",
      "2026-10-01",
      "1500",
      "2026-09-01",
      "UPI",
      "123 MG Road, Bengaluru",
      "Transferred from old gym database",
    ],
    [
      "Priya Das",
      "+91 9876543211",
      "priya.das@example.com",
      "1998-11-20",
      "Female",
      "",
      "Gold Annual",
      "2026-01-01",
      "2026-12-31",
      "14000",
      "2026-01-01",
      "Card",
      "45 Indiranagar, Bengaluru",
      "Annual member",
    ],
    [
      "Amit Sharma",
      "+91 9876543212",
      "amit.sharma@example.com",
      "1990-03-10",
      "Male",
      "",
      "Basic Monthly",
      "2026-08-15",
      "2026-09-15",
      "1000",
      "2026-08-15",
      "Cash",
      "78 HSR Layout, Bengaluru",
      "Walk-in member",
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
 * Triggers browser file download for template or reports.
 */
export function downloadFile(filename: string, content: string, mimeType = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses a raw CSV string into headers and array of row objects.
 * Handles quoted fields, escaped quotes, newlines inside quotes, and empty cells.
 */
export function parseCsvContent(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && csvText[i + 1] === "\n") {
        i++; // skip \n
      }
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h, idx) => h || `Column ${idx + 1}`);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => !v)) continue; // skip blank rows
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Intelligent field auto-matching based on column names.
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMappingState {
  const mapping: ColumnMappingState = {};

  headers.forEach((header) => {
    const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Full Name
    if (clean.includes("fullname") || clean === "name" || clean === "membername" || clean.includes("full_name")) {
      mapping[header] = "fullName";
    }
    // 2. Gender (check BEFORE dates because 'gender' contains 'end' -> g-END-er)
    else if (clean.includes("gender") || clean === "sex") {
      mapping[header] = "gender";
    }
    // 3. Start Date
    else if (
      clean.includes("startdate") ||
      clean.includes("start_date") ||
      clean.includes("membershipstart") ||
      clean.includes("validfrom") ||
      clean.includes("joining") ||
      clean === "start"
    ) {
      mapping[header] = "startDate";
    }
    // 4. End Date (check precise keywords so 'gender' or other words don't accidentally match)
    else if (
      clean.includes("enddate") ||
      clean.includes("end_date") ||
      clean.includes("membershipend") ||
      clean.includes("expire") ||
      clean.includes("expiry") ||
      clean.includes("validuntil") ||
      clean === "end"
    ) {
      mapping[header] = "endDate";
    }
    // 5. Payment Date
    else if (clean.includes("paydate") || clean.includes("paymentdate") || clean.includes("payment_date")) {
      mapping[header] = "paymentDate";
    }
    // 6. Payment Method
    else if (clean.includes("paymentmethod") || clean.includes("paymethod") || clean.includes("payment_method") || clean === "method" || clean === "mode") {
      mapping[header] = "paymentMethod";
    }
    // 7. Payment Amount
    else if (clean.includes("paymentamount") || clean.includes("amount") || clean.includes("paid") || clean.includes("fee") || clean.includes("price")) {
      mapping[header] = "paymentAmount";
    }
    // 8. Date of Birth
    else if (clean.includes("dateofbirth") || clean.includes("dob") || clean.includes("birth")) {
      mapping[header] = "dateOfBirth";
    }
    // 9. Contact Email
    else if (clean.includes("email") || clean.includes("mail")) {
      mapping[header] = "contactEmail";
    }
    // 10. Contact Phone
    else if (clean.includes("phone") || clean.includes("mobile") || clean.includes("contact")) {
      mapping[header] = "contactPhone";
    }
    // 11. Plan Name
    else if (clean.includes("plan") || clean.includes("pack") || clean === "membership") {
      mapping[header] = "planName";
    }
    // 12. Address
    else if (clean.includes("address") || clean.includes("city")) {
      mapping[header] = "address";
    }
    // 13. Notes
    else if (clean.includes("note") || clean.includes("remark") || clean.includes("comment")) {
      mapping[header] = "notes";
    }
    // 14. Photo URL
    else if (clean.includes("photo") || clean.includes("avatar") || clean.includes("picture") || clean.includes("profilepic") || clean.includes("imageurl") || clean.includes("photourl")) {
      mapping[header] = "photoUrl";
    }
    else {
      mapping[header] = "ignore";
    }
  });

  return mapping;
}

/**
 * Helper to normalize dates into YYYY-MM-DD format.
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const s = dateStr.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // MM/DD/YYYY
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return null;
}

/**
 * Helper to calculate duration in months between start and end dates.
 */
export function calculateMonthsBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const daysDiff = end.getDate() - start.getDate();

  let months = yearsDiff * 12 + monthsDiff;
  if (daysDiff >= 15) {
    months += 1;
  }
  return Math.max(1, months);
}

/**
 * Validates parsed rows against TrackVim business rules and current gym plans/members.
 */
export function validateImportRows(
  rows: Record<string, string>[],
  mapping: ColumnMappingState,
  availablePlans: Array<{ id: string; name: string; durationMonths?: number }>,
  planMapping: PlanMappingState,
  existingGymPhoneNumbers: Set<string> = new Set(),
  existingGlobalPhones: Set<string> = new Set(),
): { parsedRows: ParsedImportRow[]; stats: ImportSummaryStats } {
  const parsedRows: ParsedImportRow[] = [];
  const seenPhoneInBatch = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const mappedData: ParsedImportRow["mappedData"] = {};

    Object.entries(mapping).forEach(([fileCol, trackvimField]) => {
      if (trackvimField === "ignore") return;
      const rawVal = row[fileCol]?.trim();
      if (!rawVal) return;

      if (trackvimField === "paymentAmount") {
        const num = parseFloat(rawVal.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) mappedData.paymentAmount = num;
      } else {
        (mappedData as any)[trackvimField] = rawVal;
      }
    });

    const issues: RowValidationError[] = [];
    let isExistingGlobal = false;

    // Required Field 1: Full Name
    if (!mappedData.fullName || mappedData.fullName.trim().length === 0) {
      issues.push({
        field: "Full Name",
        code: "REQUIRED_FIELD_MISSING",
        message: "Full Name is required.",
        suggestedAction: "Enter a valid member name.",
      });
    }

    // Required Field 3 & 4: Start & End Dates
    const normStartDate = mappedData.startDate ? normalizeDate(mappedData.startDate) : null;
    const normEndDate = mappedData.endDate ? normalizeDate(mappedData.endDate) : null;

    if (!normStartDate) {
      issues.push({
        field: "Membership Start Date",
        code: "INVALID_DATE",
        message: "Valid start date is required.",
        suggestedAction: "Format date as YYYY-MM-DD or DD/MM/YYYY.",
      });
    }

    if (!normEndDate) {
      issues.push({
        field: "Membership End Date",
        code: "INVALID_DATE",
        message: "Valid end date is required.",
        suggestedAction: "Format date as YYYY-MM-DD or DD/MM/YYYY.",
      });
    }

    let dateDurationMonths = 0;
    if (normStartDate && normEndDate) {
      if (new Date(normEndDate) <= new Date(normStartDate)) {
        issues.push({
          field: "Membership End Date",
          code: "END_BEFORE_START",
          message: "Membership end date must be after the start date.",
          suggestedAction: "Correct the membership end date.",
        });
      } else {
        dateDurationMonths = calculateMonthsBetween(normStartDate, normEndDate);
      }
    }

    // Required Field 2: Membership Plan
    if (!mappedData.planName) {
      issues.push({
        field: "Membership Plan",
        code: "REQUIRED_FIELD_MISSING",
        message: "Membership Plan is missing.",
        suggestedAction: "Select or map a membership plan.",
      });
    } else {
      const planName = mappedData.planName;
      const targetPlanId = planMapping[planName];
      const matchedPlan = availablePlans.find((p) => p.id === targetPlanId);

      if (!targetPlanId || !matchedPlan) {
        issues.push({
          field: "Membership Plan",
          code: "UNKNOWN_PLAN",
          message: `"${planName}" could not be matched to an existing TrackVim plan.`,
          suggestedAction: "Map Plan to an existing gym plan or create a new plan.",
        });
      } else if (
        dateDurationMonths > 0 &&
        matchedPlan.durationMonths &&
        matchedPlan.durationMonths !== dateDurationMonths
      ) {
        issues.push({
          field: "Membership Plan",
          code: "UNKNOWN_PLAN",
          message: `Plan period mismatch: Selected plan "${matchedPlan.name}" is ${matchedPlan.durationMonths} Month(s), but date range (${normStartDate} to ${normEndDate}) spans ${dateDurationMonths} Month(s).`,
          suggestedAction: `Map or create a ${dateDurationMonths} Month plan for this period.`,
        });
      }
    }

    // Check duplicate phone in current gym vs global member match
    if (mappedData.contactPhone) {
      const cleanPhone = mappedData.contactPhone.replace(/[^0-9]/g, "");

      if (cleanPhone.length >= 7) {
        if (existingGymPhoneNumbers.has(cleanPhone) || seenPhoneInBatch.has(cleanPhone)) {
          issues.push({
            field: "Contact Phone",
            code: "DUPLICATE_PHONE_IN_GYM",
            message: `A member with phone ${mappedData.contactPhone} already exists in this gym.`,
            suggestedAction: "Review member to avoid duplicate active gym memberships.",
          });
        } else if (existingGlobalPhones.has(cleanPhone)) {
          isExistingGlobal = true;
          issues.push({
            field: "Contact Phone",
            code: "EXISTING_GLOBAL_MEMBER",
            message: `This member already exists in TrackVim and will be linked to this gym.`,
            suggestedAction: "Informational state — existing global member record will be reused.",
          });
        }
        seenPhoneInBatch.add(cleanPhone);
      }
    }

    // Determine severity
    let severity: RowValidationSeverity = "ready";
    const hasError = issues.some(
      (i) => i.code === "REQUIRED_FIELD_MISSING" || i.code === "UNKNOWN_PLAN" || i.code === "INVALID_DATE" || i.code === "END_BEFORE_START" || i.code === "DUPLICATE_PHONE_IN_GYM",
    );
    const hasWarning = issues.some((i) => i.code === "EXISTING_GLOBAL_MEMBER");

    if (hasError) {
      severity = "error";
    } else if (hasWarning) {
      severity = "warning";
    }

    parsedRows.push({
      rowNumber,
      rawData: row,
      mappedData: {
        ...mappedData,
        startDate: normStartDate || mappedData.startDate,
        endDate: normEndDate || mappedData.endDate,
      },
      severity,
      issues,
      existingGlobalMemberMatch: isExistingGlobal,
    });
  });

  const stats: ImportSummaryStats = {
    totalRows: parsedRows.length,
    readyRows: parsedRows.filter((r) => r.severity === "ready").length,
    warningRows: parsedRows.filter((r) => r.severity === "warning").length,
    errorRows: parsedRows.filter((r) => r.severity === "error").length,
    duplicateRows: parsedRows.filter((r) => r.issues.some((i) => i.code === "DUPLICATE_PHONE_IN_GYM")).length,
    existingGlobalMatches: parsedRows.filter((r) => r.existingGlobalMemberMatch).length,
  };

  return { parsedRows, stats };
}
