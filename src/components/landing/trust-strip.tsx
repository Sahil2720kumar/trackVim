import React from "react";
import {
  CreditCard,
  QrCode,
  Users,
  Dumbbell,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export function TrustStrip() {
  const capabilities = [
    { icon: UserCheck, label: "Member Management" },
    { icon: CreditCard, label: "Memberships" },
    { icon: CreditCard, label: "Payments" },
    { icon: QrCode, label: "QR Attendance" },
    { icon: Users, label: "Trainers" },
    { icon: Dumbbell, label: "Workouts" },
  ];

  return (
    <div className="w-full border-y border-border/50 bg-muted/20 backdrop-blur-xs py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Built for modern gyms</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex items-center gap-x-6 gap-y-3 w-full md:w-auto justify-between md:justify-end text-xs sm:text-sm font-medium text-foreground">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
