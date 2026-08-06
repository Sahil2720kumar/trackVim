"use client";

import { Building2, BadgeCheck, MapPin, Users, UserCheck } from "lucide-react";
import { SectionCard } from "@/components/GymFormFields";

interface Gym {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  city: string | null;
  address: string | null;
  isVerified: boolean;
  memberCount: number;
  trainerCount: number;
}

function GymLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0 overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center p-1">
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center mb-0.5">
          <Building2 className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[6px] font-bold text-white leading-tight uppercase tracking-wide">
          {name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2.5">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

export default function GymSummary({ gym }: { gym: Gym }) {
  return (
    <SectionCard title="Gym Summary" icon={Building2}>
      <div className="flex items-start gap-4">
        <GymLogo name={gym.name} logoUrl={gym.logoUrl} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{gym.name}</h2>
            {gym.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          {gym.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {gym.description}
            </p>
          )}
          {(gym.city || gym.address) && (
            <div className="flex items-start gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                {gym.city && (
                  <p className="text-sm font-medium text-foreground">
                    {gym.city}
                  </p>
                )}
                {gym.address && (
                  <p className="text-xs text-muted-foreground">{gym.address}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Stat icon={Users} value={gym.memberCount} label="Members" />
        <Stat icon={UserCheck} value={gym.trainerCount} label="Trainers" />
      </div>
    </SectionCard>
  );
}
