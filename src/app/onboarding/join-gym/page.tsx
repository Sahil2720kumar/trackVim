"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Role } from "@/lib/roles";
import { useAuth } from "@clerk/nextjs";

export default function JoinGymPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as Role) ?? "member";
  const { getToken } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Enter the gym's invite code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/join-gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      await getToken({ skipCache: true });
      router.push(
        `/${role}/dashboard`.replace(
          "dashboard",
          role === "member" ? "home" : "dashboard",
        ),
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1
          className="text-xl text-foreground"
          style={{ fontFamily: "Archivo-Bold" }}
        >
          Join your gym
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask your gym owner for the invite code and enter it below.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. FIT-7K2Q"
            className="rounded-xl tracking-widest"
            maxLength={12}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="rounded-xl" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join gym
      </Button>
    </form>
  );
}
