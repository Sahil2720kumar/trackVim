import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/services/member.query";
import MemberSettingsForm from "@/components/member/MemberSettingsForm";

export default async function MemberSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const supabase = await createServerClient();

  const profile = await getMyProfile(supabase);

  if (!profile.success) {
    if (profile.error !== "Profile not found.") {
      throw new Error(profile.error);
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
          <MemberSettingsForm
            memberId={undefined}
            initialData={undefined}
            membership={{ kind: "no-gym" }}
            clerkEmail={clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <MemberSettingsForm
          memberId={profile.data.member.id as string}
          initialData={profile.data.member as Record<string, unknown>}
          membership={profile.data.membership}
          clerkEmail={clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
        />
      </div>
    </div>
  );
}
