import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.publicMetadata?.role as
    | "owner"
    | "trainer"
    | "member"
    | undefined;

  if (!role) {
    redirect("/onboarding/select-role");
  }

  console.log("role from index", role);
  switch (role) {
    case "owner":
      redirect("/owner/dashboard");
    case "trainer":
      redirect("/trainer/dashboard");
    case "member":
      redirect("/member/home");
    default:
      redirect("/onboarding/select-role");
  }
}
