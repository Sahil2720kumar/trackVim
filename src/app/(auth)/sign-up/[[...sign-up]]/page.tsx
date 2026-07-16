import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full rounded-3xl border border-border bg-card p-5 shadow-none",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-border rounded-xl hover:bg-accent",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput:
            "rounded-xl border border-input bg-background px-3 py-2 text-sm",
          formButtonPrimary:
            "rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm normal-case",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      forceRedirectUrl="/onboarding/select-role"
    />
  );
}
