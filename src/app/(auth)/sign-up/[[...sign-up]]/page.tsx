import { SignUp } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-theme";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={clerkAuthAppearance}
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      forceRedirectUrl="/onboarding/select-role"
    />
  );
}
