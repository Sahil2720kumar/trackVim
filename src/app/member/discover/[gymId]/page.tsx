import { GymDetailView } from "@/components/member/GymDetailView";
import {
  getGymDetail,
  getMyMembershipStatusWithPlanDetails,
} from "@/services/member.query";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function GymDetailPage({
  params,
}: {
  params: Promise<{ gymId: string }>;
}) {
  const { gymId } = await params;
  const { sessionClaims } = await auth();
  const memberMeta = (sessionClaims?.publicMetadata ?? {}) as {
    memberId?: string;
  };
  const supabase = await createServerClient();

  if (!memberMeta?.memberId) {
    throw new Error("Member ID not found");
  }

  const [gymResult, statusResult] = await Promise.all([
    getGymDetail(supabase, gymId),
    getMyMembershipStatusWithPlanDetails(supabase, memberMeta.memberId, gymId),
  ]);

  if (!gymResult.success || !gymResult.data) notFound();

  return (
    <GymDetailView
      gym={gymResult.data}
      initialDisplayStatus={statusResult.displayStatus}
      initialPlanId={statusResult.planId}
      initialMembershipPlanDetails={statusResult.membershipPlanDetails}
    />
  );
}
