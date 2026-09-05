import { auth, currentUser } from "@clerk/nextjs/server";
import { getMembersAndPlans } from "@/services/owner.query";
import { createServerClient } from "@/lib/supabase/server";
import { AttendanceQrScanner } from "@/components/owner/AttendanceQrScanner";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import Link from "next/link";

export default async function AttendanceScanPage() {
  const user = await currentUser();
  const { sessionClaims } = await auth();
  const gymId = (sessionClaims?.publicMetadata as { gymId?: string })?.gymId;

  if (!gymId) {
    throw new Error("No gym found for this user.");
  }

  const supabase = await createServerClient();
  const result = await getMembersAndPlans(supabase, gymId);

  if (!result.success) {
    return (
      <div className="px-4 py-8 max-w-[1400px] mx-auto">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load attendance data: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header bar */}
      <div className="border-b border-border pb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
            Attendance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Front-desk QR attendance check-in counter
          </p>
        </div>
        <Button variant="outline" className={bigSquareButton} asChild>
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {/* Main Scanner Section */}
      <main className="py-4">
        <AttendanceQrScanner
          gymId={gymId}
          memberships={result.data.memberships}
        />
      </main>
    </div>
  );
}
