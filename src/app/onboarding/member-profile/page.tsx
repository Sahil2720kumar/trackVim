import MemberProfileForm from "@/components/onboarding/MemberProfileForm";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export default async function MemberProfilePage() {
  const { userId } = await auth();

  // Resolve the member row through users.clerk_id -> members.profile_id.
  // Clerk metadata can lag behind the database, so it is not used here.
  let member: Record<string, unknown> | null = null;

  if (userId) {
    const supabase = await createServerClient();
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (user) {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load member profile:", error.message);
      } else {
        member = data;
      }
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <MemberProfileForm
          memberId={member?.id as string}
          initialData={member ?? undefined}
        />
      </div>
    </div>
  );
}
