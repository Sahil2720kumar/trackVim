import React from "react";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { LegalSection } from "@/components/legal/legal-section";
import {
  Trash2,
  ShieldAlert,
  UserX,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  ArrowRight,
  Database,
  Lock,
  RefreshCw,
  Info,
} from "lucide-react";

export const metadata = {
  title: "Data Deletion | TrackVim",
  description:
    "Learn how to request deletion of your TrackVim account and personal information, what data gets deleted, and what records may be retained.",
};

const tocItems = [
  { id: "overview", number: "01", title: "Overview" },
  { id: "what-data-can-be-deleted", number: "02", title: "What Data Can Be Deleted" },
  { id: "how-to-request", number: "03", title: "How to Request Deletion" },
  { id: "verifying-request", number: "04", title: "Verifying a Deletion Request" },
  { id: "what-happens-after", number: "05", title: "What Happens After a Request" },
  { id: "retained-data", number: "06", title: "Data That May Need to Be Retained" },
  { id: "gym-managed-information", number: "07", title: "Gym-Managed Information" },
  { id: "deactivation-vs-deletion", number: "08", title: "Account Deactivation vs. Data Deletion" },
  { id: "third-party-deletion", number: "09", title: "Deletion From Third-Party Services" },
  { id: "cancellation-of-request", number: "10", title: "Cancellation of a Deletion Request" },
  { id: "contact-us", number: "11", title: "Contact Us" },
];

export default function DataDeletionPage() {
  return (
    <LegalLayout
      title="Data Deletion Policy"
      lastUpdated="September 17, 2026"
      introduction="This document explains how users can request deletion of their TrackVim account and associated personal data, what information is deleted, what data may be retained, and how requests are processed."
      tocItems={tocItems}
    >
      {/* Primary Account Deletion Request CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-primary/20 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <UserX className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Want to delete your TrackVim account?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can submit a formal request to delete your TrackVim user profile and associated personal account data.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="mailto:support@trackvim.com?subject=Data%20Deletion%20Request"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-xs"
          >
            <Mail className="h-4 w-4" />
            <span>Request Account Deletion</span>
          </a>

          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Important Notice Callout */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground space-y-2 text-sm">
        <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Important Notice Before Submitting a Request</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Deleting your TrackVim account permanently removes your login access, profile settings, and personal account history. Deleting your account will prevent you from accessing active gym memberships, QR attendance logs, and workout records. Please export or save any personal records you need prior to submitting a deletion request.
        </p>
      </div>

      {/* Section 1: Overview */}
      <LegalSection id="overview" number="01" title="Overview">
        <p>
          TrackVim is a multi-tenant gym management platform serving Gym Owners, Trainers, and Members. We respect your right to control your personal data and provide a transparent process for requesting account deletion.
        </p>
        <p>
          This policy details how data deletion operates across our platform. Depending on your role (Owner, Trainer, or Member), data deletion applies to personal user account information, while independent gym business records or financial logs may be subject to specific operational or legal retention rules.
        </p>
      </LegalSection>

      {/* Section 2: What Data Can Be Deleted */}
      <LegalSection id="what-data-can-be-deleted" number="02" title="What Data Can Be Deleted">
        <p>
          Upon approval of a verified data deletion request, TrackVim deletes or permanently anonymizes eligible personal information associated with your individual user account.
        </p>
        <p>Information eligible for deletion includes:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account Profile Data:</strong> Full name, email address, phone number, bio, and avatar/profile picture.
          </li>
          <li>
            <strong className="text-foreground">Authentication Records:</strong> Linked login credentials, Clerk session tokens, and security metadata.
          </li>
          <li>
            <strong className="text-foreground">Member Activity Records:</strong> Personal workout logs, custom routine templates, and member profile settings.
          </li>
          <li>
            <strong className="text-foreground">Trainer Profiles:</strong> Bio details, specializations, working schedules, and individual trainer templates.
          </li>
          <li>
            <strong className="text-foreground">Notification Preferences:</strong> Push and email notification settings and historical app notification entries.
          </li>
        </ul>
      </LegalSection>

      {/* Section 3: How to Request Deletion */}
      <LegalSection id="how-to-request" number="03" title="How to Request Deletion">
        <p>
          You can request deletion of your TrackVim account and associated personal data by submitting a request through our official support channel:
        </p>

        {/* Numbered Process Indicator */}
        <div className="my-6 p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Standard Deletion Request Workflow
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-primary">01. Request</span>
              <p className="text-[11px] text-muted-foreground leading-tight">Submit request via support email with your account details.</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-primary">02. Verify</span>
              <p className="text-[11px] text-muted-foreground leading-tight">TrackVim verifies email/account ownership for security.</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-primary">03. Review</span>
              <p className="text-[11px] text-muted-foreground leading-tight">Account records and gym dependencies are identified.</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-primary">04. Delete</span>
              <p className="text-[11px] text-muted-foreground leading-tight">Personal data is purged or anonymized across systems.</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs font-bold text-primary">05. Confirm</span>
              <p className="text-[11px] text-muted-foreground leading-tight">Confirmation email sent upon completion of request.</p>
            </div>
          </div>
        </div>

        {/* Deletion Request Submission Details */}
        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Submitting Your Deletion Request</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            To submit an official account deletion request, email <a href="mailto:support@trackvim.com?subject=Data%20Deletion%20Request" className="text-primary underline hover:opacity-80">support@trackvim.com</a> from your registered email address with the subject line <strong>&quot;Data Deletion Request&quot;</strong>. Include your full name, registered email address, and user role (Member, Trainer, or Gym Owner). You can also initiate a deletion inquiry through our support channel.
          </p>
        </div>
      </LegalSection>

      {/* Section 4: Verifying a Deletion Request */}
      <LegalSection id="verifying-request" number="04" title="Verifying a Deletion Request">
        <p>
          To protect user accounts from malicious or unauthorized deletion requests, TrackVim requires verification of account ownership before processing any deletion.
        </p>
        <p>Verification methods may include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Sending a confirmation email to the registered email address associated with the account.</li>
          <li>Requiring account re-authentication if requesting deletion from within an active session.</li>
          <li>Confirming account ownership details for gym owners managing subscription billing accounts.</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          TrackVim will never ask for your raw password, payment card CVV, or unneeded sensitive credentials during the verification process.
        </p>
      </LegalSection>

      {/* Section 5: What Happens After a Request */}
      <LegalSection id="what-happens-after" number="05" title="What Happens After a Request">
        <p>
          Once your identity and account ownership are verified:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>Your account credentials are revoked, preventing future logins.</li>
          <li>Active sessions and tokens across web and mobile interfaces are invalidated.</li>
          <li>Personal account information is scheduled for permanent deletion or cryptographic anonymization.</li>
          <li>You will receive a final confirmation message upon completion.</li>
        </ol>

        {/* Processing Timeline */}
        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2 my-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Processing Timeline & Deadlines</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            TrackVim processes and completes all verified data deletion requests within <strong>30 calendar days</strong> of receiving identity verification. Upon completion, you will receive a final confirmation email confirming that your account credentials and personal data have been permanently removed or anonymized.
          </p>
        </div>
      </LegalSection>

      {/* Section 6: Data That May Need to Be Retained */}
      <LegalSection id="retained-data" number="06" title="Data That May Need to Be Retained">
        <p>
          In accordance with applicable legal requirements and legitimate operational needs, certain data elements may be retained for limited periods even after account deletion.
        </p>
        <p>Retained records may include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Financial & Billing Records:</strong> Invoices, Razorpay payment transaction IDs, and tax compliance records maintained for accounting and statutory audit obligations.
          </li>
          <li>
            <strong className="text-foreground">Security & Audit Logs:</strong> Anonymized server logs retained temporarily for fraud prevention, system security, and API stability.
          </li>
          <li>
            <strong className="text-foreground">Dispute Records:</strong> Data necessary to resolve ongoing legal claims, chargeback disputes, or enforce contract terms.
          </li>
        </ul>
      </LegalSection>

      {/* Section 7: Gym-Managed Information */}
      <LegalSection id="gym-managed-information" number="07" title="Gym-Managed Information">
        <p>
          TrackVim operates as a multi-tenant platform. When you join a gym as a member or trainer, the gym owner maintains independent business records relating to facility operations, membership applications, and payment verification history.
        </p>
        <p>
          Deleting your global TrackVim user profile removes your personal account login, but records independently maintained by a gym (such as historical gym membership applications or cash receipt confirmations) remain governed by that specific gym&apos;s records policy.
        </p>
        <p className="text-sm bg-muted/30 p-3.5 rounded-xl border border-border/60">
          <strong className="text-foreground">Note for Gym Members:</strong> If you wish to delete membership records maintained directly by an independent gym location, please contact your gym manager directly.
        </p>
      </LegalSection>

      {/* Section 8: Account Deactivation vs. Data Deletion */}
      <LegalSection id="deactivation-vs-deletion" number="08" title="Account Deactivation vs. Data Deletion">
        <p>
          It is important to understand the distinction between temporary account deactivation and permanent data deletion:
        </p>

        {/* Visual Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <Lock className="h-4 w-4" />
              <span>Account Deactivation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Login access is temporarily suspended or disabled. Profile data remains stored in encrypted databases should you choose to reactivate your account in the future.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <Trash2 className="h-4 w-4" />
              <span>Data Deletion</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eligible personal data is permanently purged or anonymized. Account access cannot be restored, and profile history is permanently removed.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Section 9: Deletion From Third-Party Services */}
      <LegalSection id="third-party-deletion" number="09" title="Deletion From Third-Party Services">
        <p>
          TrackVim utilizes trusted third-party infrastructure providers to support authentication, database storage, payment processing, and media delivery:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Clerk (Identity Management):</strong> User identities and authentication credentials are deleted from Clerk directory services upon account deletion.
          </li>
          <li>
            <strong className="text-foreground">Cloudinary (Media Assets):</strong> Uploaded user avatars or payment receipt images associated with the deleted account are removed from cloud storage buckets.
          </li>
          <li>
            <strong className="text-foreground">Razorpay (Payment Processor):</strong> Payment gateway records are retained according to Razorpay statutory financial compliance and banking regulations.
          </li>
        </ul>
      </LegalSection>

      {/* Section 10: Cancellation of a Deletion Request */}
      <LegalSection id="cancellation-of-request" number="10" title="Cancellation of a Deletion Request">
        <p>
          If you submit a deletion request by mistake, you may cancel your request prior to identity verification and processing by contacting support immediately.
        </p>

        {/* Grace Period & Cancellation */}
        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2 my-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Grace Period & Cancellation Process</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            You may cancel a pending data deletion request within a <strong>7-day grace period</strong> following submission, or at any time prior to identity verification and final data purging. To cancel your request, email <a href="mailto:support@trackvim.com?subject=Cancel%20Data%20Deletion%20Request" className="text-primary underline hover:opacity-80">support@trackvim.com</a> with the subject line <strong>&quot;Cancel Data Deletion Request&quot;</strong> from your registered email address.
          </p>
        </div>
      </LegalSection>

      {/* Section 11: Contact Us */}
      <LegalSection id="contact-us" number="11" title="Contact Us">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-primary/20 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Questions about deleting your data?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about our data deletion policy, account privacy, or need help submitting a request, please contact TrackVim support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="mailto:support@trackvim.com?subject=Data%20Deletion%20Inquiry"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <Mail className="h-4 w-4" />
              <span>Contact TrackVim Support</span>
            </a>

            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              href="/terms-of-service"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Terms of Service</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
