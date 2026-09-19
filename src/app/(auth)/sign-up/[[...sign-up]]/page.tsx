import type { Metadata } from "next";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthLegalLinks } from "@/components/auth/AuthLegalLinks";
import { SignUpContainer } from "@/components/auth/SignUpContainer";

export const metadata: Metadata = {
  title: "Create Account | TrackVim",
  description: "Create your TrackVim account.",
};

export default function SignUpPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md">
        <SignUpContainer />
      </div>
      <AuthLegalLinks />
    </div>
  );
}
