import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Info,
  Lightbulb,
  FileCheck2,
} from "lucide-react";

export function BugReportGuidance() {
  return (
    <aside className="space-y-6">
      {/* Before You Submit Checklist */}
      <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">Before You Submit</h3>
        </div>

        <ul className="space-y-2.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Describe what you were trying to accomplish when the issue occurred.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Include step-by-step instructions so our team can reproduce it.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Tell us what you expected to happen vs. what actually happened.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Attach a screenshot if it helps explain visual errors or layout issues.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Avoid sharing passwords, OTPs, or credit card numbers in your report.</span>
          </li>
        </ul>
      </div>

      {/* Tips for a Great Bug Report */}
      <div className="p-6 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h4>Tips for a Helpful Report</h4>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-semibold text-rose-500 block text-[11px]">Instead of:</span>
            <p className="text-muted-foreground italic">&quot;It doesn&apos;t work.&quot;</p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
            <span className="font-semibold text-emerald-500 block text-[11px]">Prefer:</span>
            <p className="text-muted-foreground">
              &quot;I opened the member payment page and clicked Verify Payment, but the status remained PaymentPending.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Support CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-primary/20 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h4>Need General Support Instead?</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          If you are unsure whether an issue is a bug or need assistance with your account, our support team can help you directly.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
        >
          Contact Support <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
