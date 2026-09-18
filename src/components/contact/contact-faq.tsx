"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export function ContactFAQ() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "How do I contact TrackVim support?",
      answer: (
        <p>
          You can submit a message using the contact form on this page or email us directly at{" "}
          <a href="mailto:support@trackvim.com" className="text-primary font-medium underline">
            support@trackvim.com
          </a>
          . Our team will review your inquiry and respond to your email.
        </p>
      ),
    },
    {
      id: "faq-2",
      question: "I can't sign in. What should I do?",
      answer: (
        <p>
          If you are having trouble signing in, verify your email address and password on the{" "}
          <Link href="/sign-in" className="text-primary font-medium underline">
            Sign In page
          </Link>
          . If your account authentication was created through Clerk or an invited gym link, ensure you are using the correct account credentials.
        </p>
      ),
    },
    {
      id: "faq-3",
      question: "I have a problem with my gym membership. Who should I contact?",
      answer: (
        <p>
          TrackVim provides software tools to independent gym owners to manage their operations. If your question concerns a gym&apos;s membership fees, refund rules, class schedules, or facility access, please contact your gym management directly.
        </p>
      ),
    },
    {
      id: "faq-4",
      question: "I want to delete my TrackVim account. What should I do?",
      answer: (
        <div className="space-y-2">
          <p>
            You can request full deletion of your TrackVim user profile and personal data. Learn more about the request process, data retention policies, and steps on our dedicated page:
          </p>
          <Link
            href="/data-deletion"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Go to Data Deletion Policy <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
    {
      id: "faq-5",
      question: "Where can I read TrackVim's privacy policy?",
      answer: (
        <div className="space-y-2">
          <p>
            Our Privacy Policy details what personal information we collect, how it is used, and how data is protected across our multi-tenant platform.
          </p>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Read Privacy Policy <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
    {
      id: "faq-6",
      question: "Where can I find TrackVim's terms of service?",
      answer: (
        <div className="space-y-2">
          <p>
            You can review the Terms of Service governing platform usage, account rules, Gym Owner subscriptions, and platform guidelines:
          </p>
          <Link
            href="/terms-of-service"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Read Terms of Service <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <HelpCircle className="h-4 w-4" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card overflow-hidden">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="transition-colors">
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-foreground text-sm hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
