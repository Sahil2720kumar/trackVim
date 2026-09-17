import React from "react";
import {
  Users,
  CreditCard,
  QrCode,
  IndianRupee,
  UserCheck,
  Dumbbell,
  Compass,
  Building2,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Member Management",
      description:
        "Manage members, profiles, gym access, active gym selections, and member status from one unified dashboard.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-foreground font-sans font-medium">
            <span>Rahul Sharma</span>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 h-4">
              Active Member
            </Badge>
          </div>
          <p className="text-muted-foreground font-sans text-[11px]">
            Membership ID: #MB-9042 • Gold Tier
          </p>
        </div>
      ),
    },
    {
      icon: CreditCard,
      title: "Memberships",
      description:
        "Create plans, manage applications, renewals, active memberships, scheduled future memberships, and auto-expirations.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground font-sans">
            <span>Plan: Premium Quarterly</span>
            <span className="font-semibold text-foreground">₹4,500</span>
          </div>
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-3/4 rounded-full" />
          </div>
          <span className="text-[10px] text-muted-foreground block text-right font-sans">
            Expires in 24 days
          </span>
        </div>
      ),
    },
    {
      icon: QrCode,
      title: "QR Attendance",
      description:
        "Use QR-based attendance for quick check-ins and check-outs with cryptographic signature verification.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
              QR
            </div>
            <div>
              <p className="font-semibold text-foreground text-[11px]">
                Main Entrance Scanner
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Check-in logged • 07:14 AM
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: IndianRupee,
      title: "Payment Tracking",
      description:
        "Track membership payments, pending verification queues, transaction reference numbers, and uploaded receipts.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs flex items-center justify-between font-sans">
          <div>
            <p className="font-medium text-foreground text-[11px]">
              UPI Ref: 984729104
            </p>
            <p className="text-[10px] text-muted-foreground">
              Receipt Screenshot Attached
            </p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 h-4">
            Pending Verify
          </Badge>
        </div>
      ),
    },
    {
      icon: UserCheck,
      title: "Trainer Management",
      description:
        "Manage trainers, working hours, specializations, assigned members per gym branch, and trainer profile setup.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-sans space-y-1">
          <div className="flex justify-between font-medium text-foreground text-[11px]">
            <span>Trainer: Vikram Singh</span>
            <span className="text-primary font-semibold">14 Members</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Specialization: Strength & Functional Training
          </p>
        </div>
      ),
    },
    {
      icon: Dumbbell,
      title: "Workout Management",
      description:
        "Build reusable workout templates, exercise libraries, set/rep targets, and assign tailored sessions to members.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-sans space-y-1">
          <div className="flex justify-between font-semibold text-foreground text-[11px]">
            <span>Push Day Strength</span>
            <span className="text-muted-foreground text-[10px]">5 Exercises</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Bench Press (4x8) • Incline DB (3x10) • Tricep Dips
          </p>
        </div>
      ),
    },
    {
      icon: Compass,
      title: "Gym Discovery",
      description:
        "Allow members to discover participating gyms by unique gym code or directory, browse plans, and apply.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-sans flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div className="truncate">
            <p className="font-semibold text-foreground text-[11px] truncate">
              IronPulse Fitness Club
            </p>
            <p className="text-[10px] text-muted-foreground">
              Code: Q8K7PW • 3 Plans Available
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: Building2,
      title: "Gym Billing & SaaS",
      description:
        "Manage the gym's TrackVim SaaS subscription, active member counts, billing cycles, and automated invoices.",
      snippet: (
        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-sans flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground text-[11px]">
              SaaS Plan: Growth
            </p>
            <p className="text-[10px] text-muted-foreground">
              Active Member Count: 112
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] py-0 h-4">
            Cycle: Sep 2026
          </Badge>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs"
          >
            Full-Spectrum Platform
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Everything your gym needs to run smoothly.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            From the front entrance QR scanner to owner financial reports and trainer session plans — TrackVim covers every angle.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.snippet}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
