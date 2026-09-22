// src/app/owner/members/import/page.tsx

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ImportMembersWizard } from "@/components/owner/import/ImportMembersWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";

export const metadata = {
  title: "Import Existing Members | TrackVim Owner",
  description:
    "Bring your existing gym members into TrackVim without creating duplicate records.",
};

export default async function ImportMembersPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;

  // Fallback: fetch owner's primary gym if gymId is not in publicMetadata
  if (!gymId) {
    const supabase = await createServerClient();

    // Find db user
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userRow) {
      const { data: gymRow } = await supabase
        .from("gyms")
        .select("id")
        .eq("owner_id", userRow.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (gymRow) {
        gymId = gymRow.id;
      }
    }
  }

  if (!gymId) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">No Gym Found</h2>
        <p className="text-sm text-muted-foreground">
          Please complete your gym setup before importing existing members.
        </p>
        <Button asChild>
          <Link href="/onboarding">Setup Gym</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-5 gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-10 w-10 rounded-xl shrink-0 border border-border sm:hidden"
          >
            <Link
              className="flex flex-row justify-center items-center gap-2"
              href="/owner/members"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Import Existing Members
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Bring your existing gym members into TrackVim without creating
              duplicate records.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 border-border"
          >
            <Link
              className="flex flex-row justify-center items-center gap-2"
              href="/owner/members"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Members
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Wizard Content */}
      <main className="min-w-0">
        <ImportMembersWizard gymId={gymId} />
      </main>
    </div>
  );
}
