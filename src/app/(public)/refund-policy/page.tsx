import React from "react";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { LegalSection } from "@/components/legal/legal-section";
import {
  AlertCircle,
  CreditCard,
  Building2,
  RefreshCw,
  HelpCircle,
  Mail,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Info,
  Scale,
  ShieldAlert,
} from "lucide-react";

export const metadata = {
  title: "Refund Policy | TrackVim",
  description:
    "Learn how refunds, cancellations, and payment-related adjustments are handled for TrackVim subscriptions and gym membership transactions.",
};

const tocItems = [
  { id: "overview", number: "01", title: "Overview" },
  { id: "subscription-fees", number: "02", title: "TrackVim Subscription Fees" },
  { id: "gym-membership-payments", number: "03", title: "Gym Membership Payments" },
  { id: "cancellation-and-changes", number: "04", title: "Cancellation and Subscription Changes" },
  { id: "refund-eligibility", number: "05", title: "Refund Eligibility" },
  { id: "non-refundable-charges", number: "06", title: "Non-Refundable Charges" },
  { id: "failed-or-duplicate-payments", number: "07", title: "Failed or Duplicate Payments" },
  { id: "chargebacks-and-disputes", number: "08", title: "Chargebacks and Payment Disputes" },
  { id: "promotional-plans", number: "09", title: "Promotional or Discounted Plans" },
  { id: "taxes", number: "10", title: "Taxes" },
  { id: "refund-processing", number: "11", title: "Refund Processing" },
  { id: "changes-to-policy", number: "12", title: "Changes to This Refund Policy" },
  { id: "contact-us", number: "13", title: "Contact Us" },
];

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      lastUpdated="September 17, 2026"
      introduction="This Refund Policy explains how refunds, cancellations, and payment-related adjustments are handled for TrackVim subscriptions and software services."
      tocItems={tocItems}
    >
      {/* Important Callout: Separation of SaaS Billing vs Gym Membership */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-2 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-base text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Important Notice: Two Separate Payment Relationships</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          TrackVim subscription payments and gym membership payments are separate transactions:
        </p>
        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">TrackVim SaaS Subscriptions:</strong> Payments made by Gym Owners directly to TrackVim for platform access and software features.
          </li>
          <li>
            <strong className="text-foreground">Gym Membership Payments:</strong> Payments made by Members to an independent Gym. Refunds for gym memberships are handled according to the gym&apos;s own policies.
          </li>
        </ul>
      </div>

      {/* Section 1: Overview */}
      <LegalSection id="overview" number="01" title="Overview">
        <p>
          TrackVim provides a multi-tenant software-as-a-service (SaaS) platform designed for gym owners, trainers, and gym members. This Refund Policy describes the terms governing refund requests, subscription cancellations, billing corrections, and payment adjustments.
        </p>
        <p>
          Because TrackVim operates both as a software provider to gym businesses and as a tool used by gyms to manage their member records, payment transactions fall into two distinct categories:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Building2 className="h-4 w-4" />
              <span>A. TrackVim SaaS Subscription</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paid by the Gym Owner to TrackVim for platform licensing, tenant hosting, and administrative tools.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CreditCard className="h-4 w-4" />
              <span>B. Gym Membership Payment</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paid by a Member to an independent Gym for fitness services, personal training, or facilities.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Section 2: TrackVim Subscription Fees */}
      <LegalSection id="subscription-fees" number="02" title="TrackVim Subscription Fees">
        <p>
          Gym Owners purchase subscription plans to access TrackVim platform features. Subscriptions are billed on a recurring basis as selected during registration or plan upgrade checkout (e.g., monthly or annual billing cycles).
        </p>
        <p>
          Exact subscription charges, member count tiers, and renewal dates depend on the specific plan chosen in the owner dashboard.
        </p>

        {/* Business Rule Placeholder */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-primary/40 space-y-2 my-3 text-xs">
          <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] block">
            [Business Term Placeholder — Final Review Required]
          </span>
          <p className="text-muted-foreground">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Describe applicable TrackVim subscription billing cycle]</code>
            <br />
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Describe whether subscription charges are automatically non-refundable or eligible for initial trial refunds]</code>
          </p>
        </div>
      </LegalSection>

      {/* Section 3: Gym Membership Payments */}
      <LegalSection id="gym-membership-payments" number="03" title="Gym Membership Payments">
        <p>
          Gym membership payments, personal training fees, and facility charges paid by individual members are paid directly to or processed on behalf of the specific gym location where the member holds a membership.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Each gym determines its own membership fees, joining fees, renewal schedules, and cancellation policies.</li>
          <li>Each gym is independently responsible for evaluating, approving, and issuing refunds for its own membership fees.</li>
          <li>TrackVim provides software features to record payment status, transaction receipts, and verification documentation, but does not act as the merchant of record for gym memberships.</li>
        </ul>
        <p className="text-sm bg-muted/30 p-3.5 rounded-xl border border-border/60">
          <strong className="text-foreground">Member Note:</strong> If you are a gym member seeking a refund or billing adjustment for your gym membership, please contact your gym management directly.
        </p>
      </LegalSection>

      {/* Section 4: Cancellation and Subscription Changes */}
      <LegalSection id="cancellation-and-changes" number="04" title="Cancellation and Subscription Changes">
        <p>
          Gym Owners can cancel or change their TrackVim subscription plan at any time through the owner subscription settings.
        </p>
        <p>
          Cancelling a subscription prevents future automatic renewal charges at the end of the current billing period. Cancelling a subscription does not automatically issue a refund for previously billed billing periods.
        </p>

        {/* Business Rule Placeholder */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-primary/40 space-y-2 my-3 text-xs">
          <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] block">
            [Business Term Placeholder — Final Review Required]
          </span>
          <p className="text-muted-foreground">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Specify exact cancellation effective date policy — e.g. end of current billing cycle or immediate access loss]</code>
          </p>
        </div>
      </LegalSection>

      {/* Section 5: Refund Eligibility */}
      <LegalSection id="refund-eligibility" number="05" title="Refund Eligibility">
        <p>
          TrackVim evaluates SaaS subscription refund requests on a case-by-case basis according to approved criteria.
        </p>

        <div className="space-y-3 my-4">
          <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Refunds May Be Considered When:
            </h4>
            <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border text-xs text-muted-foreground font-mono space-y-1">
              <p><code className="text-foreground">[Insert approved TrackVim refund conditions — e.g., duplicate billing error, technical service unavailability, or accidental renewal within specified window]</code></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-500" />
              Refunds Are Generally Excluded When:
            </h4>
            <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border text-xs text-muted-foreground font-mono space-y-1">
              <p><code className="text-foreground">[Insert approved exclusions — e.g., partial billing cycle usage, user error, or requests submitted past applicable window]</code></p>
            </div>
          </div>
        </div>
      </LegalSection>

      {/* Section 6: Non-Refundable Charges */}
      <LegalSection id="non-refundable-charges" number="06" title="Non-Refundable Charges">
        <p>
          Certain fees and charges incurred on the platform may be non-refundable once processed or rendered.
        </p>
        
        {/* Business Rule Placeholder */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-primary/40 space-y-2 my-3 text-xs">
          <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] block">
            [Business Term Placeholder — Final Review Required]
          </span>
          <p className="text-muted-foreground">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Specify any non-refundable fees — e.g. setup fees, custom integration charges, or payment processor gateway fees]</code>
          </p>
        </div>
      </LegalSection>

      {/* Section 7: Failed or Duplicate Payments */}
      <LegalSection id="failed-or-duplicate-payments" number="07" title="Failed or Duplicate Payments">
        <p>
          If a billing transaction fails, is charged twice due to a technical error, or experiences network disruption during checkout:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Duplicate Charges:</strong> In the event of an accidental duplicate transaction for the same subscription period, the extra payment will be refunded upon verification.</li>
          <li><strong className="text-foreground">Payment Authorization Holds:</strong> Temporary bank authorization holds that fail before capture will automatically release according to your issuing bank&apos;s timeline.</li>
          <li><strong className="text-foreground">Failed Payments:</strong> Subscriptions with failed payments may enter a grace period before service suspension.</li>
        </ul>
      </LegalSection>

      {/* Section 8: Chargebacks and Payment Disputes */}
      <LegalSection id="chargebacks-and-disputes" number="08" title="Chargebacks and Payment Disputes">
        <p>
          We strongly encourage customers to contact TrackVim support before initiating a payment dispute or chargeback with their bank or payment card provider.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
          <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-primary" /> TrackVim Subscription Dispute
            </h4>
            <p className="text-xs text-muted-foreground">
              Gym owners experiencing a billing error should submit a ticket to TrackVim support for direct review.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" /> Gym Membership Dispute
            </h4>
            <p className="text-xs text-muted-foreground">
              Gym members should address billing questions or disputes directly with their gym manager.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          TrackVim handles all payment dispute communications transparently and in compliance with payment network guidelines and applicable consumer protection laws.
        </p>
      </LegalSection>

      {/* Section 9: Promotional or Discounted Plans */}
      <LegalSection id="promotional-plans" number="09" title="Promotional or Discounted Plans">
        <p>
          TrackVim may occasionally offer promotional pricing, introductory trial periods, or discounted subscription bundles.
        </p>
        
        {/* Business Rule Placeholder */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-primary/40 space-y-2 my-3 text-xs">
          <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] block">
            [Business Term Placeholder — Final Review Required]
          </span>
          <p className="text-muted-foreground">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Specify refund rules for promotional plans, coupons, or trial-to-paid conversions]</code>
          </p>
        </div>
      </LegalSection>

      {/* Section 10: Taxes */}
      <LegalSection id="taxes" number="10" title="Taxes">
        <p>
          Subscription prices may be subject to applicable local, state, or national taxes (such as Goods and Services Tax / GST where applicable).
        </p>
        <p className="text-xs text-muted-foreground">
          Where applicable tax laws dictate refund procedures, taxes charged on refunded transactions will be adjusted according to relevant tax regulations.
        </p>
      </LegalSection>

      {/* Section 11: Refund Processing */}
      <LegalSection id="refund-processing" number="11" title="Refund Processing">
        <p>
          Approved refunds will be credited back to the original payment method used during checkout (e.g., credit card, debit card, UPI, or Razorpay payment account).
        </p>

        {/* Business Rule Placeholder */}
        <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-primary/40 space-y-2 my-3 text-xs">
          <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] block">
            [Business Term Placeholder — Final Review Required]
          </span>
          <p className="text-muted-foreground">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">[Specify expected refund processing timeframe — e.g. 5–10 business days depending on payment gateway and card issuer]</code>
          </p>
        </div>
      </LegalSection>

      {/* Section 12: Changes to This Refund Policy */}
      <LegalSection id="changes-to-policy" number="12" title="Changes to This Refund Policy">
        <p>
          TrackVim reserves the right to update or modify this Refund Policy at any time. When updates occur, we will update the <strong className="text-foreground font-semibold">&quot;Last updated&quot;</strong> date at the top of this page.
        </p>
        <p>
          Continued use of TrackVim software services following the posting of an updated Refund Policy constitutes acceptance of the modified terms.
        </p>
      </LegalSection>

      {/* Section 13: Contact Us */}
      <LegalSection id="contact-us" number="13" title="Contact Us">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-primary/20 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Need help with a payment or subscription?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about a TrackVim subscription charge, cancellation, or refund request, our support team is here to assist.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="mailto:support@trackvim.com"
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
