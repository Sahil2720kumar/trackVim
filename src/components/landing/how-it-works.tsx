import React from "react";
import { Building2, UserPlus, Users, Rocket, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Building2,
      title: "Create your gym",
      desc: "Set up your gym profile, unique gym code, locations, and GST details in minutes.",
    },
    {
      num: "02",
      icon: UserPlus,
      title: "Add your team",
      desc: "Invite trainers to join your gym workspace and configure entrance QR check-in points.",
    },
    {
      num: "03",
      icon: Users,
      title: "Add members",
      desc: "Add existing members or let members discover your gym and apply for published plans.",
    },
    {
      num: "04",
      icon: Rocket,
      title: "Run your gym",
      desc: "Manage daily QR attendance, verify payments, assign trainers, and track workouts seamlessly.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-muted/20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs"
          >
            Simple Onboarding
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Get your gym up and running in a few steps.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            No bloated setups or hardware installations required. Launch your digital gym management in 4 straightforward steps.
          </p>
        </div>

        {/* Responsive Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-primary/30">
                      {item.num}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
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
