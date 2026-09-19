import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { LegalSection } from "@/components/legal/legal-section";
import { TocItem } from "@/components/legal/table-of-contents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  CreditCard,
  QrCode,
  Dumbbell,
  Server,
  UserCheck,
  FileText,
  Trash2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | TrackVim",
  description:
    "Learn how TrackVim collects, uses, stores, and protects information across our gym management platform.",
};

const tocItems: TocItem[] = [
  {
    id: "information-we-collect",
    number: "1",
    title: "Information We Collect",
  },
  {
    id: "how-we-use-information",
    number: "2",
    title: "How We Use Information",
  },
  {
    id: "information-shared-with-gyms",
    number: "3",
    title: "Information Shared With Gyms",
  },
  { id: "payments", number: "4", title: "Payments" },
  {
    id: "qr-codes-and-attendance",
    number: "5",
    title: "QR Codes and Attendance",
  },
  {
    id: "workout-and-fitness-information",
    number: "6",
    title: "Workout and Fitness Information",
  },
  {
    id: "cookies-and-similar-technologies",
    number: "7",
    title: "Cookies and Similar Technologies",
  },
  {
    id: "data-storage-and-security",
    number: "8",
    title: "Data Storage and Security",
  },
  { id: "data-retention", number: "9", title: "Data Retention" },
  {
    id: "your-rights-and-choices",
    number: "10",
    title: "Your Rights and Choices",
  },
  { id: "account-deletion", number: "11", title: "Account Deletion" },
  { id: "childrens-privacy", number: "12", title: "Children's Privacy" },
  { id: "third-party-services", number: "13", title: "Third-Party Services" },
  {
    id: "international-data-transfers",
    number: "14",
    title: "International Data Transfers",
  },
  {
    id: "changes-to-this-policy",
    number: "15",
    title: "Changes to This Policy",
  },
  { id: "contact-us", number: "16", title: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="September 17, 2026"
      introduction="Your privacy matters to us. This Privacy Policy explains how TrackVim collects, uses, stores, and protects information when you use our multi-tenant gym management platform, mobile web application, and associated services."
      tocItems={tocItems}
    >
      {/* 1. Information We Collect */}
      <LegalSection
        id="information-we-collect"
        number="1"
        title="Information We Collect"
      >
        <p>
          TrackVim collects information directly from you when you register an
          account, fill out profiles, apply for gym memberships, process
          payments, log workout sessions, or check into participating gyms. The
          type of data collected depends on your role on the platform:
        </p>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-primary" />
              Account & Profile Information
            </h3>
            <p className="text-sm text-muted-foreground">
              When you sign up via our authentication provider (Clerk) or
              complete your TrackVim profile:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Full name, email address, username, and phone number.</li>
              <li>Account role selection (Gym Owner, Trainer, or Member).</li>
              <li>Profile photo URL and avatar metadata.</li>
              <li>Authentication identifiers (Clerk user ID).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-primary" />
              Gym Owner & Business Information
            </h3>
            <p className="text-sm text-muted-foreground">
              When a Gym Owner registers and configures a gym on TrackVim:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>
                Gym name, short name, unique gym code, and gym description.
              </li>
              <li>
                Physical branch address, city, state, postal code, and country.
              </li>
              <li>
                Business email, phone number, website URL, and gym logo/cover
                photos.
              </li>
              <li>
                GST registration details (GSTIN, legal business name, state
                code, place of supply, and SAC code) for tax compliance.
              </li>
              <li>
                Facility specifications (floors, rooms, washrooms, lockers,
                sauna/steam amenities, and equipment lists).
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              Member Profile & Health/Fitness Data
            </h3>
            <p className="text-sm text-muted-foreground">
              When a member completes their profile or submits a gym
              application:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Date of birth, gender, occupation, and blood group.</li>
              <li>
                Physical metrics (height in cm, weight in kg, fitness goals).
              </li>
              <li>
                Optional physical & medical notes (e.g., allergies, relevant
                medical conditions entered for safety).
              </li>
              <li>
                Emergency contact details (contact name, relationship, phone
                number, and address).
              </li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* 2. How We Use Information */}
      <LegalSection
        id="how-we-use-information"
        number="2"
        title="How We Use Information"
      >
        <p>
          We process personal data strictly for legitimate operational,
          contractual, and legal purposes related to providing the TrackVim
          platform:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Platform Operations:</strong> Creating and managing
            accounts, verifying identities, and routing users to their assigned
            dashboards.
          </li>
          <li>
            <strong>Gym Membership Lifecycle:</strong> Facilitating plan
            browsing, application submissions, owner approvals, and automated
            membership expiration tracking.
          </li>
          <li>
            <strong>QR Attendance Logging:</strong> Authenticating entrance
            scans and member card check-ins against active membership records.
          </li>
          <li>
            <strong>Workout & Training Management:</strong> Enabling trainers to
            build workout templates, schedule training sessions, and assign
            structured exercises to members.
          </li>
          <li>
            <strong>Payment Verification & Invoicing:</strong> Facilitating
            membership receipt verification for gym staff and generating SaaS
            subscription billing invoices for gym owners.
          </li>
          <li>
            <strong>Notifications & Communications:</strong> Sending session
            reminders, payment verification updates, and security alerts.
          </li>
          <li>
            <strong>Security & Fraud Prevention:</strong> Protecting tenant data
            boundaries, enforcing role-based access control, and monitoring
            platform reliability.
          </li>
        </ul>
      </LegalSection>

      {/* 3. Information Shared With Gyms */}
      <LegalSection
        id="information-shared-with-gyms"
        number="3"
        title="Information Shared With Gyms"
      >
        <p>
          TrackVim operates as a multi-tenant platform. Data access is strictly
          compartmentalized using Row-Level Security (RLS) policies at the
          database level:
        </p>
        <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2 my-2">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Tenant Isolation & Role-Based Access
          </h4>
          <p className="text-sm text-muted-foreground">
            A member's profile information, application status, payment history,
            and attendance records are accessible{" "}
            <strong>only to authorized staff of the specific gym(s)</strong>{" "}
            with which the member holds an application or active membership.
          </p>
        </div>
        <p>
          TrackVim does not sell, rent, or share member data across unrelated
          gyms. A gym owner or trainer cannot view member records or attendance
          history for gyms with which they have no administrative association.
        </p>
      </LegalSection>

      {/* 4. Payments */}
      <LegalSection id="payments" number="4" title="Payments">
        <p>
          Payment processing on TrackVim is divided into two distinct channels:
        </p>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Member Payments to Gyms
            </h3>
            <p className="text-sm text-muted-foreground">
              When a member pays for a gym membership (via UPI, cash, bank
              transfer, or offline methods), the member may upload a transaction
              screenshot or reference number as proof. These uploaded receipts
              are stored securely in Cloudinary and presented to the gym owner
              for verification. TrackVim does <strong>not</strong> store full
              bank account credentials or credit card PINs for member-to-gym
              payments.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              TrackVim SaaS Billing (Gym Owner Subscriptions)
            </h3>
            <p className="text-sm text-muted-foreground">
              Gym owners pay TrackVim platform subscription fees via our
              integrated payment gateway (Razorpay). Online card or UPI payment
              details are processed directly by Razorpay in compliance with
              PCI-DSS standards. TrackVim receives payment status tokens and
              order identifiers from Razorpay webhooks to activate gym billing
              cycles.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* 5. QR Codes and Attendance */}
      <LegalSection
        id="qr-codes-and-attendance"
        number="5"
        title="QR Codes and Attendance"
      >
        <p>
          TrackVim uses QR code technology to provide fast, secure, and
          paperless gym attendance check-ins:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Gym Entrance Static QR:</strong> Encodes an opaque,
            server-verified token. Scanning the entrance QR initiates a server
            check to verify the gym's signature secret and validate the member's
            active membership status before logging a check-in or check-out
            timestamp.
          </li>
          <li>
            <strong>Member Card QR:</strong> Displays an opaque member
            identifier token on digital or physical membership cards. Gym staff
            can scan this card to verify active plan duration and record
            attendance at the reception desk.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          QR codes themselves contain random cryptographic tokens rather than
          plain-text personal identification numbers or passwords.
        </p>
      </LegalSection>

      {/* 6. Workout and Fitness Information */}
      <LegalSection
        id="workout-and-fitness-information"
        number="6"
        title="Workout and Fitness Information"
      >
        <p>
          TrackVim processes workout and session information entered by trainers
          or members to provide workout management functionality. This includes:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Exercise names, targeted muscle groups, and equipment
            specifications.
          </li>
          <li>
            Workout templates, prescribed sets, repetition counts, target
            weights, and rest interval timers.
          </li>
          <li>Scheduled training sessions and completion checkmarks.</li>
        </ul>
        <p className="text-sm text-muted-foreground pt-1">
          This fitness information is processed solely to operate training
          features within the platform. TrackVim does not make medical
          diagnoses, health assessments, or clinical claims based on this data.
        </p>
      </LegalSection>

      {/* 7. Cookies and Similar Technologies */}
      <LegalSection
        id="cookies-and-similar-technologies"
        number="7"
        title="Cookies and Similar Technologies"
      >
        <p>
          TrackVim uses essential cookies and local browser storage necessary to
          operate the application securely:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Authentication &amp; Session Cookies:</strong> Managed by
            Clerk to maintain secure signed-in sessions across page navigations.
          </li>
          <li>
            <strong>Preference Cookies:</strong> Storing light/dark theme
            choices (`next-themes`) and active gym selection identifiers.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          We do not use third-party advertising cookies or cross-site tracking
          technologies.
        </p>
      </LegalSection>

      {/* 8. Data Storage and Security */}
      <LegalSection
        id="data-storage-and-security"
        number="8"
        title="Data Storage and Security"
      >
        <p>
          We implement technical and organizational security measures designed
          to protect information against unauthorized access, alteration,
          disclosure, or destruction:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Row-Level Security (RLS):</strong> Enforced natively in
            PostgreSQL (Supabase) to strictly segregate data between gym tenants
            and user roles.
          </li>
          <li>
            <strong>Data Encryption:</strong> HTTPS/TLS encryption in transit
            for all web traffic and API endpoints.
          </li>
          <li>
            <strong>Access Controls:</strong> Role-based access control
            restricting administrative actions to verified gym owners and staff.
          </li>
          <li>
            <strong>Media Storage:</strong> Cloudinary secure storage with
            signed access URLs for receipt proofs and gym documentation.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          While we maintain rigorous security standards, no internet
          transmission or database storage system can be guaranteed 100% secure.
          We encourage users to protect their account login credentials.
        </p>
      </LegalSection>

      {/* 9. Data Retention */}
      <LegalSection id="data-retention" number="9" title="Data Retention">
        <p>
          We retain personal information for as long as your account remains
          active or as necessary to fulfill the operational purposes outlined in
          this policy:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Account Data:</strong> Retained while the user account or
            gym membership is active.
          </li>
          <li>
            <strong>Financial Records:</strong> Transaction logs, SaaS
            subscription invoices, and payment verification records are retained
            to satisfy tax, accounting, and legal compliance obligations.
          </li>
          <li>
            <strong>Attendance Logs:</strong> Attendance records are maintained
            for gym operational analytics as determined by the gym owner's
            subscription status.
          </li>
        </ul>
      </LegalSection>

      {/* 10. Your Rights and Choices */}
      <LegalSection
        id="your-rights-and-choices"
        number="10"
        title="Your Rights and Choices"
      >
        <p>
          Depending on your location and applicable privacy laws, you may have
          the following rights regarding your personal information:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Access:</strong> Request a copy of the personal information
            we hold about you.
          </li>
          <li>
            <strong>Correction:</strong> Update or correct inaccurate or
            incomplete profile details directly through account settings.
          </li>
          <li>
            <strong>Data Deletion:</strong> Request the deletion of your account
            and associated personal data.
          </li>
          <li>
            <strong>Objection / Restriction:</strong> Request restrictions on
            specific processing activities where applicable.
          </li>
        </ul>
      </LegalSection>

      {/* 11. Account Deletion */}
      <LegalSection id="account-deletion" number="11" title="Account Deletion">
        <p>
          Users may request deletion of their TrackVim account and personal
          information at any time. When an account deletion request is
          processed, personal identity records are permanently removed or
          anonymized, except where data must be retained for legal, security, or
          tax accounting reasons.
        </p>

        <div className="p-5 rounded-2xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Request Data Deletion
            </h4>
            <p className="text-xs text-muted-foreground">
              Submit a formal request to remove your TrackVim account and
              personal records.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Link
              className="flex flex-row gap-2 items-center justify-center"
              href="/data-deletion"
            >
              Request Data Deletion
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </LegalSection>

      {/* 12. Children's Privacy */}
      <LegalSection
        id="childrens-privacy"
        number="12"
        title="Children's Privacy"
      >
        <p>
          TrackVim is designed for gym management operations. Gym membership
          plans configured on the platform specify minimum age parameters
          (defaulting to 14 years of age). We do not knowingly collect personal
          information directly from children under 13 years of age without
          parental or legal guardian consent provided through participating
          gyms.
        </p>
      </LegalSection>

      {/* 13. Third-Party Services */}
      <LegalSection
        id="third-party-services"
        number="13"
        title="Third-Party Services"
      >
        <p>
          TrackVim integrates with trusted third-party infrastructure providers
          to deliver authentication, database, media storage, and payment
          capabilities. Each provider processes information in accordance with
          its respective privacy policy:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Clerk</h4>
              <Badge variant="outline" className="text-[10px]">
                Authentication
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Provides user authentication, passwordless sign-in, session token
              management, and account security.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Supabase</h4>
              <Badge variant="outline" className="text-[10px]">
                Database &amp; RLS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Provides managed PostgreSQL database infrastructure, Row-Level
              Security enforcement, and real-time functions.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Cloudinary</h4>
              <Badge variant="outline" className="text-[10px]">
                Media Storage
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Stores uploaded gym logos, photos, member avatars, and encrypted
              payment receipt screenshots securely.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Razorpay</h4>
              <Badge variant="outline" className="text-[10px]">
                Payment Gateway
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Processes online payment transactions and gym SaaS billing
              subscriptions under PCI-DSS compliance standards.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* 14. International Data Transfers */}
      <LegalSection
        id="international-data-transfers"
        number="14"
        title="International Data Transfers"
      >
        <p>
          TrackVim and its service providers host cloud infrastructure in
          regional data centers (including India and secure global cloud
          regions). By using TrackVim, you acknowledge that your information may
          be processed and stored in servers located outside your immediate
          state or province, where data protection standards meet cloud security
          compliance requirements.
        </p>
      </LegalSection>

      {/* 15. Changes to This Policy */}
      <LegalSection
        id="changes-to-this-policy"
        number="15"
        title="Changes to This Policy"
      >
        <p>
          We may update this Privacy Policy periodically to reflect platform
          enhancements, legal changes, or operational updates. When changes
          occur, we will update the "Last updated" date at the top of this
          document. For material updates, we may provide prominent in-app
          notification alerts or email updates where appropriate.
        </p>
      </LegalSection>

      {/* 16. Contact Us */}
      <LegalSection id="contact-us" number="16" title="Contact Us">
        <p>
          If you have questions, concerns, or formal privacy requests regarding
          this Privacy Policy or TrackVim's data practices, please contact our
          privacy support team:
        </p>

        <div
          id="contact"
          className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4 my-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                TrackVim Support
              </h4>
              <p className="text-xs text-muted-foreground">
                Privacy &amp; Data Protection Desk
              </p>
            </div>
          </div>

          <div className="text-sm text-foreground space-y-1">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@trackvim.com"
                className="text-primary underline hover:text-primary/80"
              >
                support@trackvim.com
              </a>
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2">
            <a
              target="_blank"
              className="flex flex-row gap-2 items-center justify-center"
              href="mailto:support@trackvim.com"
            >
              <Mail className="h-4 w-4" />
              Contact Privacy Support
            </a>
          </Button>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
