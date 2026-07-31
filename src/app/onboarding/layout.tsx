import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in"); // belt-and-suspenders — middleware should already catch this
  }

  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: "owner" | "trainer" | "member";
    onboardingComplete?: boolean;
    gymId?: string;
  };

  // Already fully onboarded — don't show onboarding screens again.
  if (meta.onboardingComplete) {
    if (meta.role==="member"){
      redirect("/member/home");
    }
    redirect(`/${meta.role}/dashboard`); // /owner, /trainer, or /member
  }

  // Invited trainers arrive with role already set by the invitation —
  // they should never see select-role at all.
  if (meta.role === "trainer") {
    redirect("/onboarding/trainer-profile");
  }

  // Organic owner/member who picked a role but didn't finish their
  // profile — send them back to exactly where they left off.
  if (meta.role === "owner") {
    redirect("/onboarding/register-gym");
  }
  if (meta.role === "member") {
    redirect("/onboarding/member-profile");
  }
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
