import { processAttendance } from "@/actions/scan.actions";
import MemberHomeClient from "@/components/member/home/MemberHomeClient";
import { getMemberHomeState } from "@/services/scan.query";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MemberHomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const state = await getMemberHomeState();

  return <MemberHomeClient state={state} onScan={processAttendance} />;
}
