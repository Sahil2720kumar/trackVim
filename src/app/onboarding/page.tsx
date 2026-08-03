import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

// This route is only ever hit when someone lands on /onboarding directly
// (e.g. a bookmarked link, or the middleware's fallback for a role-less
// user). It's the one safe place to route by role, since none of its
// redirect targets point back at "/onboarding" itself — so it can't loop
// the way the layout-level redirect did.
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