/**
 * Centralized Error Handling & Mapping Utility
 *
 * Ensures internal database details (PostgreSQL errors, SQLSTATEs, table/constraint names,
 * PostgREST codes, permission failures like "permission denied for function") are NEVER
 * exposed directly to users in the UI.
 *
 * Preserves clean business/application errors while translating technical DB errors into safe,
 * friendly user-facing messages.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DUPLICATE_ENTRY"
  | "FOREIGN_KEY_VIOLATION"
  | "REQUIRED_FIELD_MISSING"
  | "INVALID_INPUT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface AppErrorDetails {
  message: string;
  code: ErrorCode;
  rawError?: unknown;
}

const DEFAULT_FALLBACK = "Something went wrong while processing your request. Please try again.";

/**
 * Returns structured error details including a safe user-facing message and code.
 */
export function getUserFriendlyErrorDetails(
  error: unknown,
  fallbackMessage: string = DEFAULT_FALLBACK
): AppErrorDetails {
  if (!error) {
    return { message: fallbackMessage, code: "INTERNAL_ERROR" };
  }

  let rawMessage = "";
  let rawCode = "";
  let rawDetails = "";
  let rawHint = "";

  if (typeof error === "string") {
    rawMessage = error;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    rawMessage = String(errObj.message || errObj.error_description || errObj.error || "");
    rawCode = String(errObj.code || errObj.status || "");
    rawDetails = String(errObj.details || "");
    rawHint = String(errObj.hint || "");
  }

  const combinedText = `${rawCode} ${rawMessage} ${rawDetails} ${rawHint}`;

  // 1. Permission / Authorization Denied (SQLSTATE 42501, 'permission denied for function', etc.)
  if (
    rawCode === "42501" ||
    /permission denied/i.test(combinedText) ||
    /not authorized/i.test(combinedText) ||
    /unauthorized/i.test(combinedText)
  ) {
    return {
      message: "You are not authorized to perform this action.",
      code: "UNAUTHORIZED",
      rawError: error,
    };
  }

  // 2. Unique Constraint Violation (SQLSTATE 23505)
  if (
    rawCode === "23505" ||
    /unique constraint/i.test(combinedText) ||
    /duplicate key/i.test(combinedText)
  ) {
    return {
      message: "This record already exists.",
      code: "DUPLICATE_ENTRY",
      rawError: error,
    };
  }

  // 3. Foreign Key Violation (SQLSTATE 23503)
  if (
    rawCode === "23503" ||
    /foreign key constraint/i.test(combinedText) ||
    /referenced in table/i.test(combinedText)
  ) {
    return {
      message: "This record cannot be removed or updated because it is being used elsewhere.",
      code: "FOREIGN_KEY_VIOLATION",
      rawError: error,
    };
  }

  // 4. Not Null Violation (SQLSTATE 23502)
  if (
    rawCode === "23502" ||
    /not-null constraint/i.test(combinedText) ||
    /null value in column/i.test(combinedText)
  ) {
    return {
      message: "Some required information is missing.",
      code: "REQUIRED_FIELD_MISSING",
      rawError: error,
    };
  }

  // 5. Check Constraint Violation (SQLSTATE 23514)
  if (
    rawCode === "23514" ||
    /check constraint/i.test(combinedText)
  ) {
    return {
      message: "The provided information is invalid.",
      code: "INVALID_INPUT",
      rawError: error,
    };
  }

  // 6. Function or Relation Does Not Exist (SQLSTATE 42883 / 42P01)
  if (
    rawCode === "42883" ||
    rawCode === "42P01" ||
    /function .* does not exist/i.test(combinedText) ||
    /relation .* does not exist/i.test(combinedText)
  ) {
    return {
      message: "This feature or service is currently unavailable. Please try again later.",
      code: "SERVICE_UNAVAILABLE",
      rawError: error,
    };
  }

  // 7. PostgREST & Database Internals / Raw Technical Dumps
  if (
    /PGRST/i.test(combinedText) ||
    /Postgres/i.test(combinedText) ||
    /PostgreSQL/i.test(combinedText) ||
    /SQLSTATE/i.test(combinedText) ||
    /schema /i.test(combinedText) ||
    /relation /i.test(combinedText) ||
    /column /i.test(combinedText) ||
    /trigger /i.test(combinedText) ||
    /PL\/pgSQL/i.test(combinedText) ||
    /syntax error/i.test(combinedText)
  ) {
    return {
      message: fallbackMessage,
      code: "INTERNAL_ERROR",
      rawError: error,
    };
  }

  // 8. Legitimate Business / Application Errors (e.g., "Only the gym owner can change the subscription plan.")
  const trimmed = rawMessage.trim();
  if (trimmed) {
    return {
      message: trimmed,
      code: "INTERNAL_ERROR",
      rawError: error,
    };
  }

  return {
    message: fallbackMessage,
    code: "INTERNAL_ERROR",
    rawError: error,
  };
}

/**
 * Returns a user-friendly error message string.
 */
export function getUserFriendlyError(
  error: unknown,
  fallbackMessage: string = DEFAULT_FALLBACK
): string {
  return getUserFriendlyErrorDetails(error, fallbackMessage).message;
}

/**
 * Logs the full technical error to server/console for developer debugging
 * and returns the sanitized user-friendly error message.
 */
export function logAndSanitizeError(
  error: unknown,
  contextName: string = "Action",
  fallbackMessage: string = DEFAULT_FALLBACK
): string {
  if (error) {
    console.error(`[${contextName}] Error:`, error);
  }
  return getUserFriendlyError(error, fallbackMessage);
}
