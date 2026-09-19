"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import {
  createContactSubmissionSchema,
  CreateContactSubmissionInput,
} from "@/db/validators";
import { submitContactFormAction } from "@/actions/support.action";
import { toast } from "sonner";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const roles = [
    "Gym Owner",
    "Trainer",
    "Member",
    "Visitor",
    "Other",
  ];

  const topics = [
    "General Question",
    "Account & Sign In",
    "Membership",
    "Payments & Billing",
    "Attendance",
    "Workout / Training",
    "Gym Management",
    "Technical Issue",
    "Privacy / Data",
    "Business / Partnership",
    "Other",
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContactSubmissionInput>({
    resolver: zodResolver(createContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      topic: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: CreateContactSubmissionInput) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await submitContactFormAction(data);
        if (!result.success) {
          setSubmitError(result.error);
          toast.error(result.error);
          return;
        }
        toast.success("Message sent successfully!");
        setIsSubmitted(true);
      } catch (err) {
        console.error("Submission error:", err);
        const errMessage =
          "We couldn't send your message right now. Please try again or reach out to support@trackvim.com directly.";
        setSubmitError(errMessage);
        toast.error(errMessage);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-primary/20 shadow-sm text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Message Sent</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thanks for contacting TrackVim. We have received your message and will review it promptly.
          </p>
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={() => {
              reset();
              setIsSubmitted(false);
              setSubmitError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
          >
            <span>Send another message</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm space-y-5"
      noValidate
    >
      <div className="space-y-1 pb-2 border-b border-border/50">
        <h3 className="text-xl font-bold text-foreground">Send Us a Message</h3>
        <p className="text-xs text-muted-foreground">
          Fill out the form below and we will route your request to the appropriate team.
        </p>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-semibold text-foreground block">
            Your Name <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.name ? "border-rose-500 focus:border-rose-500" : "border-border/80 focus:border-primary"
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-semibold text-foreground block">
            Email Address <span className="text-primary">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.email ? "border-rose-500 focus:border-rose-500" : "border-border/80 focus:border-primary"
            }`}
          />
          {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>}
        </div>
      </div>

      {/* Role & Topic Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role Select */}
        <div className="space-y-1.5">
          <label htmlFor="contact-role" className="text-xs font-semibold text-foreground block">
            I am a <span className="text-primary">*</span>
          </label>
          <select
            id="contact-role"
            {...register("role")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.role ? "border-rose-500 focus:border-rose-500" : "border-border/80 focus:border-primary"
            }`}
          >
            <option value="" disabled>
              Select an option
            </option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-rose-500 font-medium">{errors.role.message}</p>}
        </div>

        {/* Topic Select */}
        <div className="space-y-1.5">
          <label htmlFor="contact-topic" className="text-xs font-semibold text-foreground block">
            Topic <span className="text-primary">*</span>
          </label>
          <select
            id="contact-topic"
            {...register("topic")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.topic ? "border-rose-500 focus:border-rose-500" : "border-border/80 focus:border-primary"
            }`}
          >
            <option value="" disabled>
              What can we help with?
            </option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic && <p className="text-xs text-rose-500 font-medium">{errors.topic.message}</p>}
        </div>
      </div>

      {/* Optional Subject */}
      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-xs font-semibold text-foreground block">
          Subject <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="Brief summary of your question"
          {...register("subject")}
          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Message Textarea */}
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-semibold text-foreground block">
          Message <span className="text-primary">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder="How can we help you?"
          {...register("message")}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
            errors.message ? "border-rose-500 focus:border-rose-500" : "border-border/80 focus:border-primary"
          }`}
        />
        {errors.message && <p className="text-xs text-rose-500 font-medium">{errors.message.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Send Message</span>
          </>
        )}
      </button>

      {/* Privacy Notice */}
      <div className="pt-3 border-t border-border/50 flex items-start gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        <p className="leading-relaxed">
          <strong className="text-foreground font-medium">Privacy Notice:</strong> We use the information provided to respond to your message. Please do not include passwords, payment card numbers, or sensitive credentials. See our{" "}
          <Link href="/privacy-policy" className="text-primary underline hover:text-primary/80">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
      </div>
    </form>
  );
}
