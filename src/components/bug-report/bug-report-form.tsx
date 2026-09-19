"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSingleUpload, DropZone } from "@/components/ImageUpload";
import {
  Bug,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  X,
  UserCheck,
} from "lucide-react";
import { createBugReportSchema, CreateBugReportInput } from "@/db/validators";
import { submitBugReportAction } from "@/actions/support.action";
import { toast } from "sonner";

export function BugReportForm() {
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") || "";
  const errorParam = searchParams.get("error") || "";
  const digestParam = searchParams.get("digest") || "";

  const [isPending, startTransition] = useTransition();
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Single Image Upload hook for screenshot attachment
  const {
    file: screenshotFile,
    preview: screenshotPreview,
    clear: clearScreenshot,
    dropzone,
  } = useSingleUpload(undefined, {
    "image/png": [],
    "image/jpeg": [],
    "image/jpg": [],
    "image/webp": [],
  });

  const categories = [
    "Account & Sign In",
    "Members",
    "Memberships",
    "Payments & Billing",
    "Attendance",
    "QR Scanner",
    "Workouts",
    "Trainer Features",
    "Gym Management",
    "Notifications",
    "Dashboard",
    "Performance",
    "Mobile / Responsive",
    "Other",
  ];

  const pagesWhereOccurred = [
    "Dashboard",
    "Members Management",
    "Membership Plans / Applications",
    "Payments & Billing",
    "QR Attendance / Scanner",
    "Workouts & Exercises",
    "Trainer Management",
    "Gym Settings / Onboarding",
    "Account Profile",
    "Other",
  ];

  const severityOptions = [
    {
      id: "low",
      label: "Low",
      description: "Minor visual glitch or minor inconvenience.",
    },
    {
      id: "medium",
      label: "Medium",
      description: "Feature is faulty, but workarounds exist.",
    },
    {
      id: "high",
      label: "High",
      description: "Important feature is broken or severely impacting work.",
    },
    {
      id: "critical",
      label: "Critical",
      description:
        "Unable to use core platform features or data access blocked.",
    },
  ] as const;

  // Build a nicely formatted auto-captured description block when the
  // user arrives here via an error boundary redirect (?error=...&digest=...)
  const buildAutoDescription = (message: string, digest: string) => {
    if (!message) return "";
    const lines = [
      "🔴 Auto-captured error report",
      "",
      `Error message: ${message}`,
    ];
    if (digest) {
      lines.push(`Reference ID: ${digest}`);
    }
    lines.push(
      "",
      "— Please add any additional details about what you were doing below —",
      "",
    );
    return lines.join("\n");
  };

  const autoDescription = buildAutoDescription(errorParam, digestParam);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBugReportInput>({
    resolver: zodResolver(createBugReportSchema),
    defaultValues: {
      title: errorParam ? `Error: ${errorParam}`.slice(0, 120) : "",
      category: "",
      severity: errorParam ? "high" : "medium",
      whereOccurred: "",
      description: autoDescription,
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: errorParam ? `App crashed with: "${errorParam}"` : "",
      contactEmail: "",
      reportedPath: fromParam,
      browserInfo: "",
      osInfo: "",
    },
  });

  const currentSeverity = watch("severity");

  // Auto-fill user email when signed in
  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      setValue("contactEmail", user.primaryEmailAddress.emailAddress);
    }
  }, [isSignedIn, user, setValue]);

  // Auto-detect non-sensitive browser and OS details
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Web Browser";
      if (ua.includes("Edg")) browser = "Microsoft Edge";
      else if (ua.includes("Chrome")) browser = "Google Chrome";
      else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
      else if (ua.includes("Safari")) browser = "Apple Safari";

      let os = "Desktop";
      if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
      else if (ua.includes("Win")) os = "Windows";
      else if (ua.includes("Mac")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";

      setValue(
        "browserInfo",
        `${browser} (${window.innerWidth}x${window.innerHeight})`,
      );
      setValue("osInfo", os);
    }
  }, [setValue]);

  const onSubmit = (data: CreateBugReportInput) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await submitBugReportAction(
          data,
          screenshotFile ?? null,
        );
        if (!result.success) {
          setSubmitError(result.error);
          toast.error(result.error);
          return;
        }
        toast.success("Bug report submitted successfully!");
        setSubmittedReportId(result.data.reportId);
      } catch (err) {
        console.error("Submission error:", err);
        const errMessage =
          "We couldn't submit your bug report right now. Please check your connection or contact support.";
        setSubmitError(errMessage);
        toast.error(errMessage);
      }
    });
  };

  if (submittedReportId) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-primary/20 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            Bug Report Submitted
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for helping us improve TrackVim. Your bug report has been
            logged and our engineering team will investigate the issue.
          </p>
        </div>

        {/* Report ID Badge */}
        <div className="inline-flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Report Reference ID
          </span>
          <span className="text-base font-bold font-mono text-primary pt-0.5">
            {submittedReportId}
          </span>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              reset({
                title: "",
                category: "",
                severity: "medium",
                whereOccurred: "",
                description: "",
                stepsToReproduce: "",
                expectedBehavior: "",
                actualBehavior: "",
                contactEmail:
                  isSignedIn && user?.primaryEmailAddress?.emailAddress
                    ? user.primaryEmailAddress.emailAddress
                    : "",
                reportedPath: "",
                browserInfo: "",
                osInfo: "",
              });
              clearScreenshot();
              setSubmittedReportId(null);
              setSubmitError(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors cursor-pointer"
          >
            Report Another Bug
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm space-y-6"
      noValidate
    >
      <div className="space-y-1 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            <span>Bug Details</span>
          </h3>

          {isSignedIn && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
              <UserCheck className="h-3.5 w-3.5" />
              <span>
                Signed In as{" "}
                {user.firstName || user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Provide as much clear detail as possible to help us reproduce and fix
          the bug quickly.
        </p>
      </div>

      {/* Auto-captured error notice */}
      {errorParam && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              We auto-filled this report from an error that just occurred.
            </p>
            <p className="opacity-90">
              Feel free to edit any field below, then add extra details before
              submitting.
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Title Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="bug-title"
          className="text-xs font-semibold text-foreground block"
        >
          Bug Title / Summary <span className="text-primary">*</span>
        </label>
        <input
          id="bug-title"
          type="text"
          placeholder="e.g. Attendance scanner does not recognize QR code"
          {...register("title")}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.title
              ? "border-rose-500 focus:border-rose-500"
              : "border-border/80 focus:border-primary"
          }`}
        />
        {errors.title && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Category & Location Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Select */}
        <div className="space-y-1.5">
          <label
            htmlFor="bug-category"
            className="text-xs font-semibold text-foreground block"
          >
            Category <span className="text-primary">*</span>
          </label>
          <select
            id="bug-category"
            {...register("category")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.category
                ? "border-rose-500 focus:border-rose-500"
                : "border-border/80 focus:border-primary"
            }`}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Where Occurred Select */}
        <div className="space-y-1.5">
          <label
            htmlFor="bug-where"
            className="text-xs font-semibold text-foreground block"
          >
            Where Did This Happen?
          </label>
          <select
            id="bug-where"
            {...register("whereOccurred")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.whereOccurred
                ? "border-rose-500 focus:border-rose-500"
                : "border-border/80 focus:border-primary"
            }`}
          >
            <option value="">Select feature / page (optional)</option>
            {pagesWhereOccurred.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          {errors.whereOccurred && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.whereOccurred.message}
            </p>
          )}
        </div>
      </div>

      {/* Severity Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground block">
          Severity Level <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {severityOptions.map((opt) => {
            const isSelected = currentSeverity === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setValue("severity", opt.id, { shouldValidate: true })
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "border-border/70 bg-background/50 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground capitalize">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <p className="text-[11px] leading-tight opacity-80">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
        {errors.severity && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.severity.message}
          </p>
        )}
      </div>

      {/* General Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="bug-description"
          className="text-xs font-semibold text-foreground block"
        >
          What Happened? (Description) <span className="text-primary">*</span>
        </label>
        <textarea
          id="bug-description"
          rows={errorParam ? 6 : 3}
          placeholder="Describe what went wrong when performing the action..."
          {...register("description")}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
            errors.description
              ? "border-rose-500 focus:border-rose-500"
              : "border-border/80 focus:border-primary"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Steps to Reproduce */}
      <div className="space-y-1.5">
        <label
          htmlFor="bug-steps"
          className="text-xs font-semibold text-foreground block"
        >
          Steps to Reproduce{" "}
          <span className="text-muted-foreground font-normal">
            (Recommended)
          </span>
        </label>
        <textarea
          id="bug-steps"
          rows={3}
          placeholder={`1. Open member profile view\n2. Click "Upload Payment Receipt"\n3. Submit form and error dialog appears`}
          {...register("stepsToReproduce")}
          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-xs resize-none"
        />
      </div>

      {/* Expected vs Actual Behavior Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expected Behavior */}
        <div className="space-y-1.5">
          <label
            htmlFor="bug-expected"
            className="text-xs font-semibold text-foreground block"
          >
            Expected Behavior{" "}
            <span className="text-muted-foreground font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            id="bug-expected"
            rows={2}
            placeholder="What did you expect TrackVim to do?"
            {...register("expectedBehavior")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Actual Behavior */}
        <div className="space-y-1.5">
          <label
            htmlFor="bug-actual"
            className="text-xs font-semibold text-foreground block"
          >
            Actual Behavior{" "}
            <span className="text-muted-foreground font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            id="bug-actual"
            rows={2}
            placeholder="What actually happened instead?"
            {...register("actualBehavior")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>
      </div>

      {/* Screenshot DropZone Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground block">
          Screenshot Attachment{" "}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>

        {screenshotPreview ? (
          <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-14 w-14 relative rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotPreview}
                  alt="Bug screenshot preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">
                  {screenshotFile?.name || "Attached Screenshot"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {screenshotFile
                    ? `${(screenshotFile.size / 1024).toFixed(1)} KB`
                    : "Image preview ready"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearScreenshot}
              className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <DropZone dropzone={dropzone} hint="PNG, JPG, WEBP under 2MB" />
        )}
      </div>

      {/* Contact Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="bug-email"
          className="text-xs font-semibold text-foreground block"
        >
          Contact Email Address <span className="text-primary">*</span>
        </label>
        <input
          id="bug-email"
          type="email"
          placeholder="you@example.com"
          {...register("contactEmail")}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.contactEmail
              ? "border-rose-500 focus:border-rose-500"
              : "border-border/80 focus:border-primary"
          }`}
        />
        <p className="text-[11px] text-muted-foreground">
          We will use this email address to send report status updates or ask
          clarifying questions if required.
        </p>
        {errors.contactEmail && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Bug Report...</span>
            </>
          ) : (
            <>
              <Bug className="h-4 w-4" />
              <span>Submit Bug Report</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="pt-3 border-t border-border/50 flex items-start gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        <p className="leading-relaxed">
          <strong className="text-foreground font-medium">
            Security Notice:
          </strong>{" "}
          Please do not include passwords, OTPs, payment card numbers, or API
          keys in your report or screenshots. See our{" "}
          <Link
            href="/privacy-policy"
            className="text-primary underline hover:text-primary/80"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
