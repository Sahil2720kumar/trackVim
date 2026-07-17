"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/onboarding/role-card";
import { ROLES, type Role } from "@/lib/roles";

export default function SelectRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  function handleContinue() {
    if (!role) return;
    router.push(
      role === "owner" ? "/onboarding/register-gym" : "/onboarding/join-gym",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-xl text-foreground"
          style={{ fontFamily: "Archivo-Bold" }}
        >
          How will you use TrackVim?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can&apos;t change this later without contacting support.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ROLES.map((r) => (
          <RoleCard
            key={r.value}
            value={r.value}
            label={r.label}
            description={r.description}
            selected={role === r.value}
            onSelect={setRole}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="rounded-xl"
        disabled={!role}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
}
