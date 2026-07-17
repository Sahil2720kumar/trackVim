"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function RegisterGymPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Gym name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/register-gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Force Clerk to fetch a fresh session token with updated publicMetadata
      await getToken({ skipCache: true });

      router.push("/owner/dashboard");
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
          Set up your gym
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll generate an invite code your trainers and members can use
          to join.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Gym name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iron Peak Fitness"
              className="rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. GS Road, Guwahati"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="rounded-xl" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create gym
      </Button>
    </form>
  );
}
