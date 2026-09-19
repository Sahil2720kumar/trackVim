"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-theme";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function SignUpContainer() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleCardClickCapture = (e: React.MouseEvent) => {
    if (!acceptedTerms) {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a")
      ) {
        if (!target.closest("a[target='_blank']")) {
          e.stopPropagation();
          e.preventDefault();
          setShowErrorAlert(true);
          toast.error(
            "Please accept the Terms & Conditions and Privacy Policy to create your account.",
            { id: "terms-required-toast" },
          );
        }
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Explicit Terms & Conditions Agreement Box */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
          acceptedTerms
            ? "border-primary/40 bg-primary/5 text-foreground shadow-2xs"
            : showErrorAlert
              ? "border-destructive/60 bg-destructive/10 text-foreground ring-2 ring-destructive/20"
              : "border-border/80 bg-card/70 hover:border-primary/30 text-foreground"
        }`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-agree-checkbox"
            checked={acceptedTerms}
            onCheckedChange={(checked) => {
              const val = !!checked;
              setAcceptedTerms(val);
              if (val) setShowErrorAlert(false);
            }}
            className="mt-0.5 cursor-pointer size-4.5 rounded-md border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <div className="flex-1 text-xs sm:text-sm leading-relaxed select-none">
            <label
              htmlFor="terms-agree-checkbox"
              className="cursor-pointer text-foreground/90 font-medium"
            >
              I agree to TrackVim&apos;s{" "}
            </label>
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
            >
              Terms &amp; Conditions
            </Link>{" "}
            <span className="text-muted-foreground">and</span>{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        {!acceptedTerms && showErrorAlert && (
          <div className="mt-2.5 pt-2 border-t border-destructive/20 flex items-center gap-2 text-xs font-medium text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              You must check the agreement box before creating an account.
            </span>
          </div>
        )}

        {acceptedTerms && (
          <div className="mt-2.5 pt-2 border-t border-primary/20 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>Agreement accepted. You can complete your sign up.</span>
          </div>
        )}
      </div>
      {/* Clerk SignUp Component Container */}
      <div className="relative w-full" onClickCapture={handleCardClickCapture}>
        {!acceptedTerms && (
          <div
            className="absolute inset-0 z-20 cursor-not-allowed bg-background/5 rounded-[2.2rem]"
            title="Please agree to the Terms & Conditions and Privacy Policy to unlock sign up"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowErrorAlert(true);
              toast.error(
                "Please accept TrackVim's Terms & Conditions and Privacy Policy to proceed.",
                { id: "terms-required-toast" },
              );
            }}
          />
        )}

        <SignUp
          appearance={{
            ...clerkAuthAppearance,
            elements: {
              ...clerkAuthAppearance.elements,
              cardBox: `${clerkAuthAppearance.elements.cardBox} ${
                !acceptedTerms ? "opacity-90 grayscale-[0.15]" : ""
              }`,
            },
          }}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding/select-role"
        />
      </div>
    </div>
  );
}
