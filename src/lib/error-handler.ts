/**
 * Centralized Error Handling & Mapping Utility
 *
 * Keeps internal database details (PostgreSQL errors, SQLSTATEs,
 * table/constraint names, PostgREST codes, etc.) out of the UI.
 *
 * Maps known database/business errors to safe, user-friendly messages.
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

const DEFAULT_FALLBACK =
  "Something went wrong while processing your request. Please try again.";

/**
 * Extract common PostgreSQL / Supabase error fields safely.
 */
function extractErrorFields(error: unknown) {
  if (!error) {
    return {
      message: "",
      code: "",
      details: "",
      hint: "",
      constraint: "",
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      code: "",
      details: "",
      hint: "",
      constraint: "",
    };
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;

    return {
      message: String(
        errObj.message || errObj.error_description || errObj.error || "",
      ),
      code: String(errObj.code || errObj.status || ""),
      details: String(errObj.details || ""),
      hint: String(errObj.hint || ""),
      constraint: String(errObj.constraint_name || errObj.constraint || ""),
    };
  }

  return {
    message: "",
    code: "",
    details: "",
    hint: "",
    constraint: "",
  };
}

/**
 * Returns structured error details including a safe user-facing message.
 */
export function getUserFriendlyErrorDetails(
  error: unknown,
  fallbackMessage: string = DEFAULT_FALLBACK,
): AppErrorDetails {
  if (!error) {
    return {
      message: fallbackMessage,
      code: "INTERNAL_ERROR",
    };
  }

  const {
    message: rawMessage,
    code: rawCode,
    details: rawDetails,
    hint: rawHint,
    constraint,
  } = extractErrorFields(error);

  const combinedText = `${rawCode} ${rawMessage} ${rawDetails} ${rawHint} ${constraint}`;

  // ============================================================
  // 1. AUTHORIZATION / PERMISSION
  // ============================================================

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

  // ============================================================
  // 2. UNIQUE CONSTRAINT VIOLATION
  //
  // Handle known TrackVim constraints specifically.
  // ============================================================

  if (
    rawCode === "23505" ||
    /unique constraint/i.test(combinedText) ||
    /duplicate key/i.test(combinedText)
  ) {
    // ----------------------------------------------------------
    // MEMBERS
    // ----------------------------------------------------------

    if (
      constraint === "members_contact_phone_unique_idx" ||
      /members_contact_phone_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A member with this phone number already exists use different phone number.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "members_contact_email_unique_idx" ||
      /members_contact_email_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A member with this email address already exists use different email address.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "members_member_code_unique" ||
      /members_member_code_unique/i.test(combinedText)
    ) {
      return {
        message:
          "The generated member code already exists. Please try again with different code.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    // ----------------------------------------------------------
    // USERS
    // ----------------------------------------------------------

    if (
      constraint === "users_phone_unique_idx" ||
      /users_phone_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A user with this phone number already exists use different phone number.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "users_email_unique_idx" ||
      /users_email_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A user with this email address already exists use different email address.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "users_username_unique_idx" ||
      /users_username_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "This username is already in use.Please try with different username.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "users_clerk_id_unique_idx" ||
      /users_clerk_id_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "This account is already linked to another user.Please try with different account.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    // ----------------------------------------------------------
    // TRAINERS
    // ----------------------------------------------------------

    if (
      constraint === "trainers_contact_email_unique_idx" ||
      /trainers_contact_email_unique_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A trainer with this email address already exists. Please use a different email address.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "trainers_employee_id_gym_idx" ||
      /trainers_employee_id_gym_idx/i.test(combinedText)
    ) {
      return {
        message:
          "A trainer with this employee ID already exists in this gym.Please try with different employee ID.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    if (
      constraint === "trainers_profile_gym_idx" ||
      /trainers_profile_gym_idx/i.test(combinedText)
    ) {
      return {
        message:
          "This trainer is already registered with this gym.Please try with different trainer.",
        code: "DUPLICATE_ENTRY",
        rawError: error,
      };
    }

    // ----------------------------------------------------------
    // FALLBACK FOR OTHER UNIQUE CONSTRAINTS
    // ----------------------------------------------------------

    return {
      message: "This record already exists.",
      code: "DUPLICATE_ENTRY",
      rawError: error,
    };
  }

  // ============================================================
  // 3. FOREIGN KEY VIOLATION
  // ============================================================

  if (
    rawCode === "23503" ||
    /foreign key constraint/i.test(combinedText) ||
    /referenced in table/i.test(combinedText)
  ) {
    return {
      message:
        "This record cannot be removed or updated because it is being used elsewhere.",
      code: "FOREIGN_KEY_VIOLATION",
      rawError: error,
    };
  }

  // ============================================================
  // 4. NOT NULL VIOLATION
  // ============================================================

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

  // ============================================================
  // 5. CHECK CONSTRAINT VIOLATION
  // ============================================================

  if (rawCode === "23514" || /check constraint/i.test(combinedText)) {
    return {
      message: "The provided information is invalid.",
      code: "INVALID_INPUT",
      rawError: error,
    };
  }

  // ============================================================
  // 6. FUNCTION / RELATION DOES NOT EXIST
  // ============================================================

  if (
    rawCode === "42883" ||
    rawCode === "42P01" ||
    /function .* does not exist/i.test(combinedText) ||
    /relation .* does not exist/i.test(combinedText)
  ) {
    return {
      message:
        "This feature or service is currently unavailable. Please try again later.",
      code: "SERVICE_UNAVAILABLE",
      rawError: error,
    };
  }

  // ============================================================
  // 7. OTHER DATABASE / POSTGREST INTERNAL ERRORS
  // ============================================================

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

  // ============================================================
  // 8. LEGITIMATE BUSINESS / APPLICATION ERRORS
  // ============================================================

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
  fallbackMessage: string = DEFAULT_FALLBACK,
): string {
  return getUserFriendlyErrorDetails(error, fallbackMessage).message;
}

/**
 * Logs the full technical error on the server and returns
 * a sanitized user-friendly message.
 */
export function logAndSanitizeError(
  error: unknown,
  contextName: string = "Action",
  fallbackMessage: string = DEFAULT_FALLBACK,
): string {
  if (error) {
    console.error(`[${contextName}] Error:`, error);
  }

  return getUserFriendlyError(error, fallbackMessage);
}
