import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function OnboardingIndexPage() {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: "owner" | "trainer" | "member";
  };

  if (meta.role === "trainer") {
    redirect("/onboarding/trainer-profile");
  }
  if (meta.role === "owner") {
    redirect("/onboarding/register-gym");
  }
  if (meta.role === "member") {
    redirect("/onboarding/member-profile");
  }

  redirect("/onboarding/select-role");
}
