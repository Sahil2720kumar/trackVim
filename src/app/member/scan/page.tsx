import { processAttendance } from "@/actions/scan.actions";
import { ScanResultView } from "@/components/member/scan/ScanResultView";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { userId } = await auth();

  if (!token) {
    redirect("/member/home");
  }

  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/member/scan?token=${token}`)}`,
    );
  }
  const result = await processAttendance(token);

  return <ScanResultView result={result} />;
}
