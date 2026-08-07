import GymSummary from "@/components/member/GymSummary";
import SelectedMembershipPlan from "@/components/member/SelectedMembershipPlan";
import ApplyFormSection from "@/components/member/ApplyFormSection";
import StatusBanner from "./StatusBanner";
import type { MembershipApplicationByPlanIdPageData } from "@/services/member.query";

type Props = {
  gym: MembershipApplicationByPlanIdPageData["gym"];
  plan: MembershipApplicationByPlanIdPageData["plan"];
  member: MembershipApplicationByPlanIdPageData["member"];
  gymId: string;
  planId: string;
  rejected?: boolean;
};

export default function ReviewApplicationStep({
  gym,
  plan,
  member,
  gymId,
  planId,
  rejected,
}: Props) {
  return (
    <>
      {rejected && (
        <StatusBanner variant="rejected">
          Your previous application to {gym.name} wasn&apos;t approved. You can
          submit a new one below.
        </StatusBanner>
      )}
      <GymSummary gym={gym} />
      <SelectedMembershipPlan plan={plan} />
      <ApplyFormSection
        member={member}
        gymId={gymId}
        planId={planId}
        gymName={gym.name}
      />
    </>
  );
}
