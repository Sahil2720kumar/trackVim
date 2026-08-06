// components/member/apply-steps/AwaitingApprovalStep.tsx
import GymSummary from "@/components/member/GymSummary";
import SelectedMembershipPlan from "@/components/member/SelectedMembershipPlan";
import StatusBanner from "./StatusBanner";
import type { MembershipApplicationByPlanIdPageData } from "@/services/member.query";

type Props = {
  gym: MembershipApplicationByPlanIdPageData["gym"];
  plan: MembershipApplicationByPlanIdPageData["plan"];
};

export default function AwaitingApprovalStep({ gym, plan }: Props) {
  return (
    <>
      <StatusBanner variant="pending">
        You already have a pending application at {gym.name}. The gym owner is
        reviewing it — we'll notify you once there's an update.
      </StatusBanner>
      <GymSummary gym={gym} />
      <SelectedMembershipPlan plan={plan} />
    </>
  );
}
