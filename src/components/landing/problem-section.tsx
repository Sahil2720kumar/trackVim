import React from "react";
import {
  ClipboardX,
  Receipt,
  Clock,
  UserX,
  CalendarX,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: ClipboardX,
      title: "Manual attendance registers",
      description:
        "Paper registers and manual sign-in logs lead to long queues at the door and incomplete check-in records.",
      solution: "Instant QR scanner check-in & check-out",
    },
    {
      icon: Receipt,
      title: "Scattered payment records",
      description:
        "Tracking cash, UPI screenshots, and partial payments across messaging apps makes audit month a headache.",
      solution: "Centralized payment verification & receipts",
    },
    {
      icon: CalendarX,
      title: "Untracked membership expiries",
      description:
        "Members continuing past their end date without renewing because nobody noticed their plan expired.",
      solution: "Automated daily expiry & renewal tracking",
    },
    {
      icon: UserX,
      title: "Disjointed trainer assignments",
      description:
        "No clear visibility into which trainer is training which member or how sessions are being executed.",
      solution: "Per-gym trainer assignments & rosters",
    },
    {
      icon: FileSpreadsheet,
      title: "Spreadsheet workout logs",
      description:
        "Workout plans trapped on personal phones or printed paper that get lost after a week.",
      solution: "Structured workout templates & sessions",
    },
    {
      icon: Clock,
      title: "Delayed application reviews",
      description:
        "New member applications lying unapproved for days without a clear review queue for gym owners.",
      solution: "Real-time application & approval pipeline",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Running a gym shouldn't mean managing everything manually.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Gym management software should eliminate chaos, not add more.
            TrackVim replaces fragmented tools with one streamlined operating system.
          </p>
        </div>

        {/* Problem to Solution Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-border/70 bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-11 w-11 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {item.solution}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
