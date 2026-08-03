import MemberProfileForm from "@/components/onboarding/MemberProfileForm";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export default async function MemberProfilePage() {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    memberId?: string;
  };

  // No memberId in metadata yet means this member hasn't been fully set
  // up — treat this as "create" mode and skip the fetch entirely rather
  // than querying with an undefined id (which .single() would throw on
  // with a confusing error instead of a clean "not found").
  let member: Record<string, unknown> | null = null;

  if (meta.memberId) {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", meta.memberId)
      .maybeSingle(); // no matching row isn't an error here, just "create" mode

    if (error) {
      console.error("Failed to load member profile:", error.message);
    } else {
      member = data;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <MemberProfileForm
          memberId={meta.memberId}
          initialData={member ?? undefined}
        />
      </div>
    </div>
  );
}
