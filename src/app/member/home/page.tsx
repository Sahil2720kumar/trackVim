import { processAttendance } from "@/actions/scan.actions";
import MemberHomeClient from "@/components/member/home/MemberHomeClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MemberHomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return <MemberHomeClient onScan={processAttendance} />;
}
