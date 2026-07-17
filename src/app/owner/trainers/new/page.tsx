"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function NewTrainerPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter the trainer's email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/owner/invite-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        {/* <ScreenHeader title="Invite trainer" /> */}
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <p
            className="font-bold text-foreground"
            style={{ fontFamily: "Archivo-Bold" }}
          >
            Invitation sent
          </p>
          <p className="text-sm text-muted-foreground">
            {email} will get an email with a sign-up link. Once they accept,
            they&apos;re added as a trainer at your gym automatically — no code
            needed.
          </p>
          <Button
            className="mt-2 rounded-xl"
            onClick={() => router.push("/owner/trainers")}
          >
            Back to trainers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* <ScreenHeader title="Invite trainer" /> */}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Trainer&apos;s email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trainer@example.com"
              className="rounded-xl"
              required
            />
            <p className="text-xs text-muted-foreground">
              They&apos;ll get an email from Clerk with a sign-up link. Trainer
              access is granted automatically when they accept — this is the
              only way to add a trainer, the shared gym code can&apos;t be used
              for this.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="rounded-xl"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send invitation
        </Button>
      </form>
    </div>
  );
}
