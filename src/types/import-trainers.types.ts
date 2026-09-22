export type ImportTrainerPayloadItem = {
  rowNumber: number;

  fullName: string;

  contactEmail?: string | null;
  contactPhone?: string | null;

  employeeId?: string | null;

  gender?: "Male" | "Female" | "Other" | null;
  dateOfBirth?: string | null;

  professionalTitle?: string | null;
  bio?: string | null;

  joiningDate?: string | null;
  experienceYears?: number | null;

  qualification?: string | null;
  certification?: string | null;
  salary?: number | null;

  employmentType?: "Full Time" | "Part Time" | "Contract" | null;

  specializations?: string[];
  workingDays?: string[];
  sessionTypes?: string[];
  languages?: string[];

  maxMembers?: number | null;
  maxSessionsPerDay?: number | null;

  startTime?: string | null;
  endTime?: string | null;

  acceptingNewMembers?: boolean;

  coachingExperience?: string | null;
  trainingPhilosophy?: string | null;

  emergencyContactName?: string | null;
  emergencyRelationship?: string | null;
  emergencyPhone?: string | null;
  emergencyAlternatePhone?: string | null;

  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;

  additionalNotes?: string | null;
  photoUrl?: string | null;
};

export type TrainerTrackVimFieldKey =
  | "fullName"
  | "contactEmail"
  | "contactPhone"
  | "employeeId"
  | "joiningDate"
  | "professionalTitle"
  | "experienceYears"
  | "qualification"
  | "certification"
  | "salary"
  | "employmentType"
  | "specializations"
  | "workingDays"
  | "sessionTypes"
  | "startTime"
  | "endTime"
  | "maxMembers"
  | "maxSessionsPerDay"
  | "additionalNotes"
  | "photoUrl"
  | "ignore";

export interface TrainerFieldOption {
  key: TrainerTrackVimFieldKey;
  label: string;
  required?: boolean;
}

export const TRACKVIM_TRAINER_FIELD_OPTIONS: TrainerFieldOption[] = [
  { key: "fullName", label: "Full Name", required: true },
  { key: "contactEmail", label: "Contact Email" },
  { key: "contactPhone", label: "Contact Phone" },
  { key: "employeeId", label: "Employee ID" },
  { key: "joiningDate", label: "Joining Date" },
  { key: "professionalTitle", label: "Professional Title" },
  { key: "experienceYears", label: "Experience (Years)" },
  { key: "qualification", label: "Qualification" },
  { key: "certification", label: "Certification" },
  { key: "salary", label: "Salary" },
  { key: "employmentType", label: "Employment Type" },
  { key: "specializations", label: "Specializations" },
  { key: "workingDays", label: "Working Days" },
  { key: "sessionTypes", label: "Session Types" },
  { key: "startTime", label: "Start Time" },
  { key: "endTime", label: "End Time" },
  { key: "maxMembers", label: "Max Members" },
  { key: "maxSessionsPerDay", label: "Max Sessions Per Day" },
  { key: "additionalNotes", label: "Notes" },
  { key: "photoUrl", label: "Photo URL" },
];

export type TrainerColumnMappingState = Record<string, TrainerTrackVimFieldKey>;

export type EmailConflictStatus =
  | "available"
  | "existing_trainer_gym"
  | "existing_trainer_other"
  | "member_email"
  | "owner_email";

export type TrainerRowValidationError = {
  field?: string;
  code: string;
  message: string;
  suggestedAction?: string;
};

export type TrainerRowValidationSeverity = "ready" | "warning" | "error";

export type ParsedTrainerImportRow = {
  rowNumber: number;
  rawData: Record<string, string>;
  mappedData: Partial<ImportTrainerPayloadItem>;
  severity: TrainerRowValidationSeverity;
  issues: TrainerRowValidationError[];
  emailConflictStatus?: EmailConflictStatus;
  existingGlobalTrainerMatch?: boolean;
};

export type TrainerImportSummaryStats = {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  existingGlobalMatches: number;
};

export type ImportTrainerSettings = {
  sendInvitations: boolean;
};

export type ImportTrainerErrorRow = {
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
};

export type ImportTrainerSuccessRow = {
  rowNumber: number;
  fullName: string;
  contactEmail?: string | null;
  trainerId: string;
  trainerCode: string;
  profileId?: string | null;
  hasExistingProfile: boolean;
};

export type ImportTrainerBatchResult = {
  totalProcessed: number;
  trainersCreated: number;
  existingProfilesLinked: number;
  skippedCount: number;
  skippedRows: unknown[];
  errorRows: ImportTrainerErrorRow[];
  successfulRows: ImportTrainerSuccessRow[];
};
