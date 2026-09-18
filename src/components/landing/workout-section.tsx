import React from "react";
import { Dumbbell, Layers, CheckCircle2, Target, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WorkoutSection() {
  const exercises = [
    { name: "Barbell Bench Press", sets: "4 Sets", reps: "8-10 Reps", rest: "90s Rest" },
    { name: "Incline Dumbbell Press", sets: "3 Sets", reps: "10-12 Reps", rest: "60s Rest" },
    { name: "Cable Chest Fly", sets: "3 Sets", reps: "12-15 Reps", rest: "60s Rest" },
    { name: "Tricep Rope Pushdown", sets: "4 Sets", reps: "12 Reps", rest: "45s Rest" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual UI Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    Workout Session
                  </h4>
                  <p className="text-xs text-muted-foreground">Category: Hypertrophy • Duration: 50 min</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Chest & Triceps
                </Badge>
              </div>

              {/* Exercise List */}
              <div className="space-y-2.5 font-sans">
                {exercises.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                        0{idx + 1}
                      </span>
                      <span className="font-semibold text-foreground">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span>{item.sets}</span>
                      <span>•</span>
                      <span>{item.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Layers className="h-4 w-4" />
              <span>Structured Training</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Keep workouts organized.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Trainers can create custom exercises, assemble reusable workout templates, and schedule structured training sessions assigned directly to members.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Global & Gym-specific exercise libraries",
                "Workout templates for Push, Pull, Legs, & Custom routines",
                "Per-session set, rep, target weight, and rest guidelines",
                "Permanent session execution snapshots for member history",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
