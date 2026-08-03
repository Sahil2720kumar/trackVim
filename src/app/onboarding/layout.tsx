// app/onboarding/layout.tsx
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


  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}