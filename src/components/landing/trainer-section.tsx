import React from "react";
import {
  Dumbbell,
  Users,
  CheckCircle2,
  ListOrdered,
  Layers,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TrainerSection() {
  const trainerFeatures = [
    "Manage assigned members per gym branch",
    "Build reusable workout templates (Push, Pull, Legs, Cardio)",
    "Custom gym exercise library with sets, reps & rest timers",
    "Schedule & track member training sessions",
    "View workout history & member execution records",
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left UI Mockup: Trainer Dashboard */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                    TR
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Trainer Workspace</h4>
                    <p className="text-[11px] text-muted-foreground">Trainer: Vikram Singh</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  14 Assigned Members
                </Badge>
              </div>

              {/* Session Template Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    Template: Upper Body Strength A
                  </span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    4 Exercises
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between p-1.5 rounded-md bg-card border border-border/40">
                    <span className="font-medium text-foreground">1. Barbell Bench Press</span>
                    <span>4 sets × 8 reps</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded-md bg-card border border-border/40">
                    <span className="font-medium text-foreground">2. Incline DB Press</span>
                    <span>3 sets × 10 reps</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded-md bg-card border border-border/40">
                    <span className="font-medium text-foreground">3. Cable Lat Pulldown</span>
                    <span>4 sets × 10 reps</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Session */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Upcoming Session: Rahul M.</p>
                  <p className="text-[11px] text-muted-foreground">Today at 5:00 PM • Goal: Hypertrophy</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                  Scheduled
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <Dumbbell className="h-4 w-4" />
              <span>Trainer Operating System</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Give trainers the tools to train better.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Trainers can manage assigned members, create structured workout sessions, build reusable workout templates, and keep training information organized without relying on loose paper or messaging apps.
            </p>

            <div className="space-y-3 pt-2">
              {trainerFeatures.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
