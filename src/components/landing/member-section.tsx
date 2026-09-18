import React from "react";
import {
  Compass,
  FileText,
  CheckCircle,
  CreditCard,
  Dumbbell,
  QrCode,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MemberSection() {
  const journeySteps = [
    {
      step: "01",
      icon: Compass,
      title: "Discover a Gym",
      desc: "Browse participating gyms or enter a gym's code to view locations and plans.",
    },
    {
      step: "02",
      icon: FileText,
      title: "Choose & Apply",
      desc: "Select a plan (Basic, Gold, Premium) and submit your membership application.",
    },
    {
      step: "03",
      icon: CheckCircle,
      title: "Get Approved",
      desc: "The gym owner reviews and approves your application, establishing your plan rate.",
    },
    {
      step: "04",
      icon: CreditCard,
      title: "Pay & Verify",
      desc: "Upload payment reference or receipt screenshot. Once verified, access unlocks.",
    },
    {
      step: "05",
      icon: Dumbbell,
      title: "Start Training",
      desc: "Scan QR at the entrance, view assigned trainer sessions, and track progress.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-muted/20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs"
          >
            Member Experience
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Give members a better gym experience.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            From discovering a gym to scanning at the front door, TrackVim provides a seamless, digital-first journey for gym members.
          </p>
        </div>

        {/* Member Journey Visual Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-primary/30">
                      {item.step}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {idx < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                    </div>
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
