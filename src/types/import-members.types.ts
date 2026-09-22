// src/types/import-members.types.ts

export type TrackVimFieldKey =
  | "fullName"
  | "contactPhone"
  | "contactEmail"
  | "dateOfBirth"
  | "gender"
  | "address"
  | "planName"
  | "startDate"
  | "endDate"
  | "paymentAmount"
  | "paymentDate"
  | "paymentMethod"
  | "notes"
  | "photoUrl"
  | "ignore";

export interface TrackVimFieldOption {
  key: TrackVimFieldKey;
  label: string;
  required: boolean;
  description: string;
}

export const TRACKVIM_FIELD_OPTIONS: TrackVimFieldOption[] = [
  {
    key: "fullName",
    label: "Full Name",
    required: true,
    description: "Member's full legal or preferred name",
  },
  {
    key: "planName",
    label: "Membership Plan",
    required: true,
    description: "Plan name matching a gym plan",
  },
  {
    key: "startDate",
    label: "Membership Start Date",
    required: true,
    description: "Valid start date (YYYY-MM-DD or DD/MM/YYYY)",
  },
  {
    key: "endDate",
    label: "Membership End Date",
    required: true,
    description: "Valid end date after start date",
  },
  {
    key: "contactPhone",
    label: "Contact Phone",
    required: false,
    description: "Mobile number for member identification",
  },
  {
    key: "contactEmail",
    label: "Contact Email",
    required: false,
    description: "Email address for notifications/invites",
  },
  {
    key: "dateOfBirth",
    label: "Date of Birth",
    required: false,
    description: "Member birth date",
  },
  {
    key: "gender",
    label: "Gender",
    required: false,
    description: "Male, Female, or Other",
  },
  {
    key: "address",
    label: "Address",
    required: false,
    description: "Residential address",
  },
  {
    key: "paymentAmount",
    label: "Current Payment Amount",
    required: false,
    description: "Amount paid for current membership",
  },
  {
    key: "paymentDate",
    label: "Payment Date",
    required: false,
    description: "Date when current payment was collected",
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    required: false,
    description: "Cash, UPI, Card, or Bank Transfer",
  },
  {
    key: "notes",
    label: "Notes / Additional Info",
    required: false,
    description: "Internal notes or remarks",
  },
  {
    key: "photoUrl",
    label: "Photo URL",
    required: false,
    description: "Public URL of the member's profile photo (optional)",
  },
];

export interface ColumnMappingState {
  [fileColumn: string]: TrackVimFieldKey;
}

export interface ImportSettingsState {
  createActiveMemberships: boolean;
  importCurrentPayment: boolean;
  generateQrCards: boolean;
  sendInvitations: boolean;
}

export interface PlanMappingState {
  [importedPlanName: string]: string; // importedPlanName -> trackvimPlanId
}

export type RowValidationSeverity = "ready" | "warning" | "error";

export interface RowValidationError {
  field?: string;
  message: string;
  code:
    | "REQUIRED_FIELD_MISSING"
    | "UNKNOWN_PLAN"
    | "INVALID_DATE"
    | "END_BEFORE_START"
    | "DUPLICATE_PHONE_IN_GYM"
    | "EXISTING_GLOBAL_MEMBER"
    | "INVALID_EMAIL"
    | "INVALID_AMOUNT";
  suggestedAction?: string;
}

export interface ParsedImportRow {
  rowNumber: number;
  rawData: Record<string, string>;
  mappedData: {
    fullName?: string;
    contactPhone?: string;
    contactEmail?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    planName?: string;
    startDate?: string;
    endDate?: string;
    paymentAmount?: number;
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
    photoUrl?: string;
  };
  severity: RowValidationSeverity;
  issues: RowValidationError[];
  existingGlobalMemberMatch?: boolean;
}

export interface ImportBatchPayloadItem {
  rowNumber: number;
  fullName: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  planId: string;
  startDate: string;
  endDate: string;
  paymentAmount?: number | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
}

export interface ImportSummaryStats {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  existingGlobalMatches: number;
}

export interface ImportBatchResult {
  totalProcessed: number;
  membershipsCreated: number;
  paymentsImported: number;
  qrCardsCreated: number;
  skippedCount: number;
  skippedRows: Array<{
    rowNumber: number;
    fullName: string;
    reason: string;
  }>;
  errorRows: Array<{
    rowNumber: number;
    fullName: string;
    errorCode: string;
    stage?: string;
    sqlState?: string;
    error: string;
    detail?: string | null;
    hint?: string | null;
    context?: string | null;
    suggestedAction?: string;
    extra?: Record<string, unknown> | null;
  }>;
  successfulRows: Array<{
    rowNumber: number;
    fullName: string;
    contactEmail?: string;
    memberId: string;
    membershipId: string;
    paymentId?: string | null;
    qrToken?: string | null;
    isExistingGlobal: boolean;
    membershipStatus: string;
  }>;
}
