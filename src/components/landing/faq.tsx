"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is TrackVim?",
      answer:
        "TrackVim is a modern gym management platform that brings members, memberships, payment tracking, QR attendance, trainers, and structured workout management into one unified system.",
    },
    {
      question: "Who can use TrackVim?",
      answer:
        "TrackVim supports three distinct roles: Gym Owners (to manage operations, plans, approvals, and platform billing), Trainers (to manage assigned members and workouts), and Members (to scan attendance, apply for plans, and view workouts).",
    },
    {
      question: "Can members discover gyms?",
      answer:
        "Yes! Members can discover participating gyms via unique gym codes or browse available gyms, view published membership plans, and submit applications directly from their mobile web app.",
    },
    {
      question: "Can I manage QR attendance?",
      answer:
        "Yes. TrackVim supports dual QR attendance workflows — members scanning static entrance QR codes verified cryptographically by the server, as well as staff scanning member physical or digital QR cards.",
    },
    {
      question: "Can trainers manage workouts?",
      answer:
        "Yes. Trainers can build exercise libraries, create reusable workout templates (e.g., Push/Pull/Legs), schedule training sessions, and assign structured workouts with sets, reps, and targets to members.",
    },
    {
      question: "Does TrackVim support payment tracking?",
      answer:
        "Yes. Gyms can track membership payments, upload transaction screenshots and references, and process owner verification before membership status transitions to Active.",
    },
    {
      question: "Can a member belong to multiple gyms?",
      answer:
        "Yes. TrackVim's membership model allows a single member profile to hold memberships across multiple gyms independently and switch between them in the app.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-muted/20 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs"
          >
            Got Questions?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Everything you need to know about TrackVim and how it works for your gym.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-base text-foreground hover:text-primary transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 flex items-center gap-3">
                    <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
