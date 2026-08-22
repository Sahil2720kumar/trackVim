"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckCircle2,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { setUserRole } from "@/actions/onboarding.action";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";

interface Role {
  id: "gym_owner" | "member";
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const ROLES: Role[] = [
  {
    id: "gym_owner",
    title: "Gym Owner",
    description:
      "Create and manage your gym, memberships, trainers, members, attendance, reports, and business operations.",
    icon: <Building2 className="w-12 h-12" />,
    features: [
      "Manage Gym",
      "Membership Plans",
      "Trainers & Members",
      "Attendance",
      "Reports & Analytics",
    ],
  },
  {
    id: "member",
    title: "Member",
    description:
      "Join gyms, access assigned workout sessions, track your attendance, monitor your fitness journey, and stay connected with your trainers.",
    icon: <User className="w-12 h-12" />,
    features: [
      "Discover Gyms",
      "Workout Sessions",
      "Attendance",
      "Membership",
      // "Messages",
    ],
  },
];

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (roleId: Role["id"]) => void;
}

function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  return (
    <button
      onClick={() => onSelect(role.id)}
      className={`relative w-full rounded-2xl border-2 p-8 text-left transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/90"
      }`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}

      {/* Icon */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {role.icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-bold text-foreground">{role.title}</h3>

      {/* Description */}
      <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
        {role.description}
      </p>

      {/* Features */}
      <ul className="space-y-3">
        {role.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<Role["id"] | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { session } = useClerk();

  const handleContinue = () => {
    if (!selectedRole || isPending) return;

    startTransition(async () => {
      try {
        const result = await setUserRole(selectedRole);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        await session?.reload();
        localStorage.setItem("selectedRole", selectedRole);

        if (selectedRole === "gym_owner") {
          router.push("/onboarding/register-gym");
        } else {
          router.push("/onboarding/member-profile");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to select role");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center sm:mb-12">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <div className="text-lg font-bold">V</div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">TrackVim</h1>
          <p className="text-sm text-muted-foreground">
            Gym Management Platform
          </p>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Choose Your Role
          </h2>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Select how you&apos;ll use TrackVim.
          </p>
          <p className="text-sm text-muted-foreground sm:text-base">
            This helps us personalize your onboarding and dashboard experience.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="mb-8 w-full grid gap-6 sm:grid-cols-2">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              onSelect={setSelectedRole}
            />
          ))}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isPending}
          className="mb-8 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 py-6 text-base font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground sm:text-sm">
          <p className="mb-1">
            ℹ You&apos;ll complete a few additional setup steps after selecting
            your role.
          </p>
          <p>Your role determines your onboarding flow and dashboard.</p>
        </div>
      </div>
    </div>
  );
}
