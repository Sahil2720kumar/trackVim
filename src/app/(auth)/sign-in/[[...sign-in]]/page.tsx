import { SignIn } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-theme";

export default function SignInPage() {
  return (
    <SignIn
      appearance={clerkAuthAppearance}
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      forceRedirectUrl="/onboarding/select-role"
    />
  );
}
