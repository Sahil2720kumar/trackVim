"use server";

import {
  CreateContactSubmissionInput,
  createContactSubmissionSchema,
  CreateBugReportInput,
  createBugReportSchema,
} from "@/db/validators";
import { uploadFile } from "@/lib/cloudinary/upload";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Contact Form Submission
// ============================================================================

/**
 * Submits a contact form entry to contact_submissions.
 * Accessible to both authenticated users and guests.
 */
export async function submitContactFormAction(
  data: CreateContactSubmissionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Optional Auth check
    const { userId: clerkUserId } = await auth();
    const supabase = await createServerClient();

    let internalUserId: string | null = null;
    if (clerkUserId) {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .maybeSingle();
      if (userRow) internalUserId = userRow.id;
    }

    // 2. Validate input
    const parsed = createContactSubmissionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "Invalid contact form submission.",
      };
    }
    const input = parsed.data;

    // 3. Insert row
    const { error } = await supabase.from("contact_submissions").insert({
      user_id: internalUserId,
      name: input.name,
      email: input.email,
      role: input.role,
      topic: input.topic,
      subject: input.subject || null,
      message: input.message,
      status: "Pending",
    });

    if (error) {
      console.error("Failed to submit contact form:", error);

      return {
        success: false,
        error: "Failed to submit message. Please try again later.",
      };
    }

    return {
      success: true,
      data: { id: "submitted" },
    };
  } catch (err) {
    console.error("Unexpected error submitting contact form:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ============================================================================
// Bug Report Submission
// ============================================================================

/**
 * Submits a bug report to bug_reports, uploading an optional screenshot to Cloudinary.
 * Accessible to both authenticated users and guests.
 */
export async function submitBugReportAction(
  data: CreateBugReportInput,
  screenshotFile?: File | null,
): Promise<ActionResult<{ id: string; reportId: string }>> {
  try {
    // 1. Optional Auth check
    const { userId: clerkUserId } = await auth();
    const supabase = await createServerClient();

    let internalUserId: string | null = null;
    if (clerkUserId) {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .maybeSingle();
      if (userRow) internalUserId = userRow.id;
    }

    // 2. Validate input
    const parsed = createBugReportSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "Invalid bug report submission.",
      };
    }
    const input = parsed.data;

    // 3. Screenshot Upload — reference from createMemberProfileAction (Cloudinary)
    let screenshotUrl: string | undefined = input.screenshotUrl || undefined;
    if (screenshotFile && screenshotFile.size > 0) {
      try {
        const folder = internalUserId
          ? `trackVim/bug-reports/${internalUserId}`
          : `trackVim/bug-reports/guest`;
        screenshotUrl = await uploadFile(screenshotFile, folder);
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to upload screenshot. Please try again.",
        };
      }
    }

    // 4. Generate unique report identifier
    const reportId = `TV-BUG-${crypto.randomUUID()}`;

    // 5. Insert row
    const { data: inserted, error } = await supabase
      .from("bug_reports")
      .insert({
        report_id: reportId,
        user_id: internalUserId,
        title: input.title,
        category: input.category,
        severity: input.severity,
        where_occurred: input.whereOccurred || null,
        description: input.description,
        steps_to_reproduce: input.stepsToReproduce || null,
        expected_behavior: input.expectedBehavior || null,
        actual_behavior: input.actualBehavior || null,
        contact_email: input.contactEmail,
        browser_info: input.browserInfo || null,
        os_info: input.osInfo || null,
        reported_path: input.reportedPath || null,
        screenshot_url: screenshotUrl || null,
        status: "Open",
      })

      .single();

    if (error) {
      console.error("Failed to submit bug report:", error);
      return {
        success: false,
        error: "Failed to submit bug report. Please try again later.",
      };
    }

    return {
      success: true,
      data: {
        id: reportId,
        reportId: reportId,
      },
    };
  } catch (err) {
    console.error("Unexpected error submitting bug report:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
