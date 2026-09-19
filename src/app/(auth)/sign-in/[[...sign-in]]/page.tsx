import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-theme";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalLinks } from "@/components/auth/AuthLegalLinks";

export const metadata: Metadata = {
  title: "Sign In | TrackVim",
  description: "Sign in to your TrackVim account.",
};

export default function SignInPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md">
        <SignIn
          appearance={clerkAuthAppearance}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/onboarding/select-role"
        />
      </div>
      <AuthLegalLinks />
    </div>
  );
}
