import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // currentUser() always returns fresh data from Clerk — no stale cache issue
  const user = await currentUser();
  const role = user?.publicMetadata?.role as
    | "owner"
    | "trainer"
    | "member"
    | undefined;

  if (!role) {
    redirect("/onboarding/select-role");
  }

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
