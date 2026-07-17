import type { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
