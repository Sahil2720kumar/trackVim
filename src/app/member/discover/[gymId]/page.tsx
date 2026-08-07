import { GymDetailView } from "@/components/member/GymDetailView";
import {
  getGymDetail,
  getMyMembershipStatusWithPlanDetails,
} from "@/services/member.query";
import { notFound } from "next/navigation";

export default async function GymDetailPage({
  params,
}: {
  params: Promise<{ gymId: string }>;
}) {
  const { gymId } = await params;

  const [gymResult, statusResult] = await Promise.all([
    getGymDetail(gymId),
    getMyMembershipStatusWithPlanDetails(gymId),
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
