import React from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactFAQ } from "@/components/contact/contact-faq";
import {
  HelpCircle,
  Building2,
  Users,
  Briefcase,
  Mail,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Contact TrackVim | Support & Inquiries",
  description:
    "Contact TrackVim for support, product questions, billing help, gym management solutions, and general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-10 bg-muted/20 border-b border-border/50">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-6xl bg-primary/10 blur-[100px] opacity-50 -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Get in Touch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Contact TrackVim
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed pt-1">
            Have a question, need help, or want to learn more about TrackVim? We&apos;re here to help. Choose the option below that best matches what you need.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-14">
        {/* Contact Option Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Product Support */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-base">Product Support</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need technical assistance or help navigating your TrackVim account?
              </p>
            </div>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
            >
              Get Support <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 2: Gym Owners */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-base">Gym Owners</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Questions about managing your gym, subscription plans, or onboarding?
              </p>
            </div>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
            >
              Contact Us <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 3: Gym Members */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-base">Gym Members</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Having an issue with your membership, payments, or gym attendance?
              </p>
            </div>
            <a
              href="#support-guidance"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
            >
              Get Guidance <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 4: Business / Demo */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-base">Business &amp; Sales</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interested in onboarding multiple gym branches or platform partnerships?
              </p>
            </div>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
            >
              Talk to Us <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 2-Column Main Layout: Contact Form + Support Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" id="contact-form">
          {/* Left / Main Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Support Guidance & Official Contact */}
          <div className="lg:col-span-5 space-y-6" id="support-guidance">
            {/* Support Routing Guidance Card */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Which Channel Should You Use?
              </h3>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground text-sm block">Account &amp; Sign-In Issues</span>
                  <p>For login problems, password resets, or account configuration, contact TrackVim support.</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground text-sm block">Gym Membership Questions</span>
                  <p>
                    If your question concerns membership pricing, cancellation rules, facility access, or gym schedules, please contact your gym manager directly.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <span className="font-semibold text-foreground text-sm block">TrackVim Software &amp; Billing</span>
                  <p>For platform bugs, SaaS subscription invoices, or feature requests, contact TrackVim support.</p>
                </div>
              </div>
            </div>

            {/* Official Support Info Card */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Direct Contact Channels
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prefer email? You can reach our support and business teams directly:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground font-medium">Customer Support:</span>
                  <a href="mailto:support@trackvim.com" className="font-semibold text-primary hover:underline font-mono">
                    support@trackvim.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-6">
          <ContactFAQ />
        </div>
      </main>
    </div>
  );
}
