import React from "react";
import { BugReportForm } from "@/components/bug-report/bug-report-form";
import { BugReportGuidance } from "@/components/bug-report/bug-report-guidance";
import { Bug } from "lucide-react";

export const metadata = {
  title: "Report a Bug | TrackVim",
  description:
    "Report a bug or unexpected issue in TrackVim and help us improve the platform experience.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReportBugPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-8 bg-muted/20 border-b border-border/50">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-6xl bg-primary/10 blur-[100px] opacity-50 -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
            <Bug className="h-3.5 w-3.5" />
            <span>Bug Reporting</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Report a Bug
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed pt-1">
            Something not working as expected? Tell us what happened and
            we&apos;ll use your report to investigate and fix the issue.
          </p>

          <p className="text-xs text-muted-foreground font-medium pt-0.5">
            The more details you provide, the easier it is for us to reproduce
            and resolve the problem.
          </p>
        </div>
      </section>

      {/* Main 2-Column Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Bug Report Form */}
          <div className="lg:col-span-7">
            <BugReportForm />
          </div>

          {/* Right Column: Before You Submit Guidance */}
          <div className="lg:col-span-5">
            <BugReportGuidance />
          </div>
        </div>
      </main>
    </>
  );
}
