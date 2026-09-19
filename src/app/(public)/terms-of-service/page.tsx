import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { LegalSection } from "@/components/legal/legal-section";
import { TocItem } from "@/components/legal/table-of-contents";
import {
  Building2,
  UserCheck,
  Dumbbell,
  CreditCard,
  QrCode,
  ShieldAlert,
  Scale,
  Lock,
  AlertTriangle,
  Ban,
  RefreshCw,
  Gavel,
  HeartHandshake,
  Mail,
  FileText,
  UserX,
  Server,
  Puzzle,
  Edit,
  BadgeCheck,
  Users,
  ScrollText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | TrackVim",
  description:
    "Read the Terms of Service for TrackVim — the gym management platform for owners, trainers, and members.",
};

const tocItems: TocItem[] = [
  { id: "acceptance", number: "1", title: "Acceptance of Terms" },
  { id: "description-of-service", number: "2", title: "Description of Service" },
  { id: "user-roles-and-accounts", number: "3", title: "User Roles and Accounts" },
  { id: "gym-owner-terms", number: "4", title: "Gym Owner Terms" },
  { id: "trainer-terms", number: "5", title: "Trainer Terms" },
  { id: "member-terms", number: "6", title: "Member Terms" },
  { id: "membership-plans-and-fees", number: "7", title: "Membership Plans and Fees" },
  { id: "payment-processing", number: "8", title: "Payment Processing" },
  { id: "saas-subscription-billing", number: "9", title: "SaaS Subscription & Billing" },
  { id: "qr-attendance-system", number: "10", title: "QR Attendance System" },
  { id: "workout-and-training-data", number: "11", title: "Workout and Training Data" },
  { id: "prohibited-conduct", number: "12", title: "Prohibited Conduct" },
  { id: "intellectual-property", number: "13", title: "Intellectual Property" },
  { id: "third-party-services", number: "14", title: "Third-Party Services" },
  { id: "disclaimers", number: "15", title: "Disclaimers" },
  { id: "limitation-of-liability", number: "16", title: "Limitation of Liability" },
  { id: "indemnification", number: "17", title: "Indemnification" },
  { id: "suspension-and-termination", number: "18", title: "Suspension and Termination" },
  { id: "data-and-privacy", number: "19", title: "Data and Privacy" },
  { id: "modifications-to-service", number: "20", title: "Modifications to Service" },
  { id: "governing-law", number: "21", title: "Governing Law" },
  { id: "contact-us", number: "22", title: "Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="September 17, 2026"
      introduction="These Terms of Service govern your access to and use of TrackVim, a multi-tenant gym management platform. By creating an account or using any part of the service, you agree to be bound by these terms. Please read them carefully."
      tocItems={tocItems}
    >
      {/* 1 */}
      <LegalSection id="acceptance" number="1" title="Acceptance of Terms">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <ScrollText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            By accessing or using TrackVim (the &ldquo;Service&rdquo;), you confirm that you have
            read, understood, and agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;)
            and our{" "}
            <Link
              href="/privacy-policy"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </Link>
            . If you do not agree, you must not access or use the Service.
          </p>
        </div>
        <p>
          These Terms form a legally binding agreement between you and TrackVim (&ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;). If you are accepting on behalf of an organisation
          (such as a gym), you represent and warrant you have authority to bind that organisation,
          and references to &ldquo;you&rdquo; include it.
        </p>
        <p>
          If you are under the age of majority in your jurisdiction, a parent or legal guardian
          must review and accept these Terms before you use the Service.
        </p>
      </LegalSection>

      {/* 2 */}
      <LegalSection id="description-of-service" number="2" title="Description of Service">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Server className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            TrackVim is a cloud-hosted SaaS platform that enables gym businesses to manage their
            operations and members to interact with those gyms digitally.
          </p>
        </div>
        <p>Core capabilities include:</p>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Gym registration and profile management",
            "Membership plan creation and publishing",
            "Member application, approval, and onboarding workflows",
            "Payment upload, verification, and record-keeping",
            "QR-code-based attendance check-in and check-out",
            "Digital membership cards with QR identifiers",
            "Trainer profile management and member assignment",
            "Workout template creation and training-session management",
            "Gym discovery for prospective members",
            "In-platform notifications for all roles",
            "Gym-owner SaaS billing and invoice management",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          TrackVim is a <strong>software platform only</strong>. We do not operate gyms, employ
          trainers, or provide physical fitness services. Those services are delivered by the gym
          operator.
        </p>
      </LegalSection>

      {/* 3 */}
      <LegalSection id="user-roles-and-accounts" number="3" title="User Roles and Accounts">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            TrackVim operates a multi-role system. Your access and permissions depend on the role
            assigned to your account.
          </p>
        </div>
        <div className="space-y-4">
          {[
            {
              role: "Gym Owner",
              desc: "Registers a gym, manages membership plans, reviews applications, verifies payments, manages trainers, and pays TrackVim subscription fees. Responsible for the accuracy of gym information and compliance with applicable law.",
            },
            {
              role: "Trainer",
              desc: "Invited by a gym owner; manages workout templates, training sessions, and member assignments. A trainer account does not constitute an employment relationship with TrackVim.",
            },
            {
              role: "Member",
              desc: "Signs up and applies to join one or more gyms. A global member profile is created once; gym memberships are granted per-gym by the respective owner. Members may hold active memberships at multiple gyms.",
            },
          ].map(({ role, desc }) => (
            <div key={role} className="p-4 rounded-lg border border-border/60 bg-card/30">
              <h3 className="font-semibold text-foreground mb-1">{role}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p>
          You are responsible for maintaining the confidentiality of your credentials and all
          activity under your account. Notify us immediately if you suspect unauthorised access.
        </p>
      </LegalSection>

      {/* 4 */}
      <LegalSection id="gym-owner-terms" number="4" title="Gym Owner Terms">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            By registering a gym on TrackVim, you accept additional obligations as a gym operator.
          </p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Provide accurate gym information, including name, address, and contact details.",
            "Ensure membership plan pricing, duration, and features accurately reflect your offering.",
            "Review membership applications promptly and act in good faith.",
            "Verify payment receipts honestly; do not approve unpaid receipts or reject valid ones without legitimate grounds.",
            "Ensure invited trainers are authorised and their information is accurate.",
            "Use the attendance QR system only for legitimate check-in/check-out of registered members.",
            "Comply with all applicable consumer protection, data protection, and employment laws.",
            "Pay TrackVim platform subscription fees in accordance with Section 9.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          TrackVim is not responsible for disputes between gym owners and their members or
          trainers.
        </p>
      </LegalSection>

      {/* 5 */}
      <LegalSection id="trainer-terms" number="5" title="Trainer Terms">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Trainer accounts are created by gym owners. By accepting an invitation and activating
            your account, you agree to these Terms.
          </p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Complete your profile accurately, including qualifications and working hours.",
            "Create workout templates and training sessions reflecting safe fitness content.",
            "Record session outcomes honestly — mark sessions complete only when genuinely done.",
            "Respect member data and use it only for legitimate training duties.",
            "Do not share your account credentials.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Your relationship is with the gym, not with TrackVim. TrackVim is not liable for injury
          or harm arising from the training services you provide.
        </p>
      </LegalSection>

      {/* 6 */}
      <LegalSection id="member-terms" number="6" title="Member Terms">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            As a member, you use TrackVim to discover gyms, apply for memberships, and manage your
            gym interactions digitally.
          </p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Provide accurate personal information when registering and applying to gyms.",
            "Upload genuine payment receipts only — fraudulent evidence is a serious breach of these Terms.",
            "Use the QR attendance system only for your own legitimate check-in and check-out.",
            "Do not share your digital membership card or QR code with others.",
            "Comply with the rules of each gym you join.",
            "Understand that membership approvals and renewals are at the gym owner's discretion.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          TrackVim facilitates the gym–member relationship through software. We are not a party
          to your gym membership contract and are not responsible for the quality or safety of gym
          facilities.
        </p>
      </LegalSection>

      {/* 7 */}
      <LegalSection id="membership-plans-and-fees" number="7" title="Membership Plans and Fees">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Gym owners publish membership plans on TrackVim, each specifying price, duration, and
            joining fee. These are separate from TrackVim&apos;s own subscription fees.
          </p>
        </div>
        <p>
          The plan price and duration active at the time of approval are locked in for that
          membership period. Future plan price changes do not retroactively affect
          already-approved memberships.
        </p>
        <p>
          Membership fees are paid directly to the gym. TrackVim does not collect or process gym
          membership fees. Disputes about fees, refunds, or cancellations are between the member
          and the gym owner.
        </p>
      </LegalSection>

      {/* 8 */}
      <LegalSection id="payment-processing" number="8" title="Payment Processing">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            TrackVim integrates with Razorpay to facilitate gym owners paying their TrackVim
            platform subscription.
          </p>
        </div>
        <p>
          <strong>Platform Subscription Payments:</strong> Payment orders are created via Razorpay
          and confirmed via webhooks. We are not responsible for delays caused by third-party
          payment infrastructure.
        </p>
        <p>
          <strong>Gym Membership Payments:</strong> Members upload payment receipts for gym owners
          to verify. These go directly to the gym — TrackVim does not act as a payment processor
          or escrow for gym membership fees.
        </p>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Uploading fraudulent payment evidence to obtain gym membership access is a serious
            breach of these Terms and may result in immediate account termination and legal action.
          </p>
        </div>
      </LegalSection>

      {/* 9 */}
      <LegalSection id="saas-subscription-billing" number="9" title="SaaS Subscription & Billing">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <RefreshCw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Gym owners pay TrackVim a periodic platform subscription fee based on the number of
            active gym memberships and the subscription plan selected.
          </p>
        </div>
        <p>
          <strong>Trial Period:</strong> New gyms receive a trial period from registration.
          Billing begins after the trial ends. The trial duration is shown during registration.
        </p>
        <p>
          <strong>Billing Cycle:</strong> Invoices are generated periodically (typically monthly).
          Each reflects the active member count at generation time multiplied by the per-member
          rate or flat fee.
        </p>
        <p>
          <strong>Overdue Invoices:</strong> Unpaid invoices past the due date are marked overdue
          and the gym&apos;s access to certain features may be suspended until settled.
        </p>
        <p>
          <strong>Refunds:</strong> Subscription fees are generally non-refundable except where
          required by law or expressly agreed in writing.
        </p>
      </LegalSection>

      {/* 10 */}
      <LegalSection id="qr-attendance-system" number="10" title="QR Attendance System">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <QrCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Gym owners generate a static entrance QR code per location. Members scan this QR to
            record check-in and check-out times.
          </p>
        </div>
        <p>
          Each QR code is verified server-side against a stored secret. Members may only check in
          where they hold an active, verified membership. The system records one check-in and one
          check-out per member per day.
        </p>
        <p>
          <strong>Limitations:</strong> The QR attendance system is a convenience tool, not a
          certified access control system. Gym owners remain responsible for physical security.
          TrackVim is not liable for physical security incidents at gym locations.
        </p>
        <p>
          You must not circumvent, spoof, or manipulate the QR attendance system, including by
          scanning codes on behalf of other members.
        </p>
      </LegalSection>

      {/* 11 */}
      <LegalSection id="workout-and-training-data" number="11" title="Workout and Training Data">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Dumbbell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Trainers create workout templates, plan sessions, and record outcomes including
            exercises, sets, reps, weights, and rest periods.
          </p>
        </div>
        <p>
          <strong>Health Disclaimer:</strong> Workout content is created by gym trainers, not
          TrackVim. We do not validate or endorse plans for medical suitability. Always consult
          a qualified health professional before beginning a fitness programme. TrackVim is not
          liable for injury or health outcomes from workouts on the platform.
        </p>
        <p>
          Completed session records are immutable. The historical snapshot is preserved even if
          the underlying template is later modified or deleted.
        </p>
      </LegalSection>

      {/* 12 */}
      <LegalSection id="prohibited-conduct" number="12" title="Prohibited Conduct">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Ban className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>You must not engage in any of the following:</p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Uploading false, fabricated, or manipulated payment receipts.",
            "Registering a gym you do not own or are not authorised to represent.",
            "Using another member's QR code or membership card to check in on their behalf.",
            "Attempting to reverse-engineer, decompile, or extract source code from the platform.",
            "Gaining unauthorised access to other users' accounts or data.",
            "Scraping or systematically extracting platform data without express written permission.",
            "Interfering with or disrupting the platform's infrastructure or networks.",
            "Transmitting spam, phishing content, or malicious code through the platform.",
            "Impersonating any person or misrepresenting your affiliation with any entity.",
            "Using the platform for any purpose that violates applicable law or these Terms.",
            "Reselling or sublicensing platform access without prior written agreement.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Violations may result in immediate account suspension or termination and may be reported
          to law enforcement.
        </p>
      </LegalSection>

      {/* 13 */}
      <LegalSection id="intellectual-property" number="13" title="Intellectual Property">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            All software, code, design, branding, logos, and documentation comprising TrackVim
            are owned by or licensed to TrackVim and protected by applicable IP laws.
          </p>
        </div>
        <p>
          You receive a limited, non-exclusive, non-transferable, revocable licence to access and
          use the Service as described in these Terms.
        </p>
        <p>
          <strong>Your Content:</strong> You retain ownership of content you upload. By uploading,
          you grant TrackVim a non-exclusive, worldwide, royalty-free licence to host, store, and
          display that content solely to provide the Service.
        </p>
        <p>
          You warrant that any content you upload does not infringe third-party rights.
        </p>
      </LegalSection>

      {/* 14 */}
      <LegalSection id="third-party-services" number="14" title="Third-Party Services">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Puzzle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            TrackVim integrates with third-party services that have their own terms and privacy
            policies.
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              name: "Clerk (Authentication)",
              desc: "Handles authentication, session management, and MFA. Creating an account also subjects you to Clerk's terms and privacy policy.",
            },
            {
              name: "Razorpay (Payment Gateway)",
              desc: "Processes platform subscription payments. Completing a payment subjects you to Razorpay's payment terms and policies.",
            },
            {
              name: "Supabase (Database & Storage)",
              desc: "Application data and uploaded files (including payment receipts) are stored via Supabase infrastructure.",
            },
          ].map(({ name, desc }) => (
            <div key={name} className="p-4 rounded-lg border border-border/60 bg-card/30">
              <h3 className="font-semibold text-foreground mb-1">{name}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p>
          TrackVim is not responsible for the availability, accuracy, or conduct of third-party
          services.
        </p>
      </LegalSection>

      {/* 15 */}
      <LegalSection id="disclaimers" number="15" title="Disclaimers">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis
            without warranties of any kind.
          </p>
        </div>
        <p>
          To the fullest extent permitted by law, TrackVim disclaims all implied warranties of
          merchantability, fitness for a particular purpose, and non-infringement. We do not
          warrant that the Service will be uninterrupted or error-free.
        </p>
        <p>
          Gym information published on the platform is provided by gym owners and is their sole
          responsibility.
        </p>
      </LegalSection>

      {/* 16 */}
      <LegalSection id="limitation-of-liability" number="16" title="Limitation of Liability">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            To the maximum extent permitted by law, TrackVim and its affiliates shall not be
            liable for indirect, incidental, special, consequential, or punitive damages arising
            from your use of the Service.
          </p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Loss of data, revenue, profits, or business.",
            "Unauthorised access to or alteration of your data.",
            "Gym owner decisions regarding applications or payment verification.",
            "Physical injury from fitness activities facilitated through the platform.",
            "Service interruptions, outages, or technical failures.",
            "Conduct of any third party using the platform.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Where liability cannot be excluded, TrackVim&apos;s total cumulative liability shall not
          exceed amounts you paid to TrackVim in the twelve (12) months preceding the event.
        </p>
      </LegalSection>

      {/* 17 */}
      <LegalSection id="indemnification" number="17" title="Indemnification">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <HeartHandshake className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            You agree to indemnify and hold harmless TrackVim and its affiliates, directors,
            employees, and agents from claims arising out of:
          </p>
        </div>
        <ul className="list-none space-y-2 pl-0">
          {[
            "Your access to or use of the Service.",
            "Your violation of any provision of these Terms.",
            "Your violation of any third-party rights.",
            "Content you upload, submit, or transmit through the platform.",
            "Any misrepresentation made by you.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      {/* 18 */}
      <LegalSection id="suspension-and-termination" number="18" title="Suspension and Termination">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <UserX className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Either you or TrackVim may terminate your account at any time. Termination does not
            relieve you of obligations incurred before it.
          </p>
        </div>
        <p>
          <strong>Termination by You:</strong> Request account deletion via account settings or
          by contacting us. Data retention after deletion is described in our Privacy Policy.
        </p>
        <p>
          <strong>Suspension or Termination by TrackVim:</strong> We may suspend or terminate
          your account if you violate these Terms, your account poses a security risk, your
          subscription invoice is significantly overdue, or we are required to do so by law.
        </p>
        <p>
          Sections covering limitation of liability, indemnification, governing law, and accrued
          payment obligations survive termination.
        </p>
      </LegalSection>

      {/* 19 */}
      <LegalSection id="data-and-privacy" number="19" title="Data and Privacy">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            Your use of TrackVim involves collection and processing of personal data. Our{" "}
            <Link
              href="/privacy-policy"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </Link>{" "}
            is incorporated into these Terms by reference.
          </p>
        </div>
        <p>
          <strong>Gym Owners as Data Controllers:</strong> Gym owners collect and manage personal
          data about members and trainers through TrackVim. The gym owner acts as a data
          controller; TrackVim acts as a data processor on their behalf. Gym owners are
          responsible for having a valid legal basis for collection and providing appropriate
          privacy notices.
        </p>
        <p>
          <strong>Data Portability and Deletion:</strong> You may request a copy of your personal
          data or account deletion at any time, subject to retention requirements in our Privacy
          Policy.
        </p>
      </LegalSection>

      {/* 20 */}
      <LegalSection id="modifications-to-service" number="20" title="Modifications to Service">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Edit className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            TrackVim reserves the right to modify, update, suspend, or discontinue any part of
            the Service at any time.
          </p>
        </div>
        <p>
          When we make material changes to these Terms, we will update the &ldquo;Last updated&rdquo;
          date and notify you via the platform or your registered email. Continued use after
          changes take effect constitutes acceptance of the revised Terms.
        </p>
        <p>
          We will provide reasonable advance notice before subscription pricing changes take
          effect.
        </p>
      </LegalSection>

      {/* 21 */}
      <LegalSection id="governing-law" number="21" title="Governing Law">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Gavel className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            These Terms shall be governed by applicable law. The specific governing jurisdiction
            will be identified once the business is formally incorporated.
          </p>
        </div>
        <p>
          Any dispute that cannot be resolved informally shall be subject to the exclusive
          jurisdiction of competent courts applicable to TrackVim&apos;s registered place of
          business. We encourage direct contact before initiating formal proceedings.
        </p>
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Specific jurisdiction and dispute-resolution procedures will
            be confirmed once TrackVim&apos;s legal entity is formally registered.
          </p>
        </div>
      </LegalSection>

      {/* 22 */}
      <LegalSection id="contact-us" number="22" title="Contact Us">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            If you have questions about these Terms, want to report a concern, or need to exercise
            any of your rights, please contact us.
          </p>
        </div>
        <div className="mt-2">
          <div className="p-4 rounded-xl bg-card border border-border/60 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Legal Enquiries
              </p>
              <a
                href="mailto:legal@trackvim.com"
                className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
              >
                legal@trackvim.com
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                General Support
              </p>
              <a
                href="mailto:support@trackvim.com"
                className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
              >
                support@trackvim.com
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Related Documents
              </p>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
