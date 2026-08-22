import { auth } from "@clerk/nextjs/server";
import { Users, Filter, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MembersTable } from "@/components/owner/MembersTable";
import { daysBetween, formatDateStr } from "@/lib/utils";
import { getInitials } from "@/lib/application-status";
import {
  getGymMemberStats,
  getMembersWithAttendance,
  getTrainersAndPlans,
  MemberRow,
  MemberWithAttendance,
} from "@/services/owner.query";

function resolveStatus(member: MemberWithAttendance): MemberRow["status"] {
  if (!member.membership) return "Pending";

  switch (member.membershipStatus) {
    case "PaymentPending":
    case "PaymentUploaded":
    case "PaymentRejected":
    case "Scheduled":
      return "Pending";
    case "Expired":
      return "Expired";
    case "Active": {
      const daysLeft = daysBetween(member.membership.end_date);
      return daysLeft <= 7 ? "Expiring Soon" : "Active";
    }
    default:
      return "Pending";
  }
}

function toMemberRow(member: MemberWithAttendance): MemberRow {
  const membership = member.membership;

  return {
    id: member.id,
    name: member.full_name,
    email: member.contact_email ?? "—",
    phone: member.contact_phone ?? "—",
    avatar: getInitials(member.full_name),
    memberType: member.memberType,
    plan: membership?.plan?.plan_name ?? "No Plan",
    planPrice: membership?.final_amount
      ? `₹${membership.final_amount.toLocaleString("en-IN")}`
      : "—",
    trainer: member.trainer?.full_name ?? "Unassigned",
    joined: membership?.start_date ? formatDateStr(membership.start_date) : "—",
    expiry: membership?.end_date ? formatDateStr(membership.end_date) : "—",
    daysLeft: membership?.end_date ? daysBetween(membership.end_date) : 0,
    attendance: Math.round(member.attendanceRate),
    status: resolveStatus(member),
  };
}

export default async function MembersPage() {
  const { sessionClaims } = await auth();
  const gymId = (
    sessionClaims?.publicMetadata as { gymId?: string } | undefined
  )?.gymId;

  if (!gymId) {
    return (
      <div className="p-6 text-muted-foreground">
        No gym found for this account.
      </div>
    );
  }

  const [membersResult, statsResult, trainersPlansResult] = await Promise.all([
    getMembersWithAttendance(gymId),
    getGymMemberStats(gymId),
    getTrainersAndPlans(gymId),
  ]);

  if (!membersResult.success) {
    throw new Error(membersResult.error);
  }

  const members = membersResult.data.map(toMemberRow);

  const stats = statsResult.success
    ? statsResult.data
    : {
        totalMembers: 0,
        activeMembers: 0,
        expiringSoon: 0,
        pendingPayments: 0,
        pendingAmount: 0,
      };

  const trainers = trainersPlansResult.success
    ? trainersPlansResult.data.trainers
    : [];
  const plans = trainersPlansResult.success
    ? trainersPlansResult.data.plans
    : [];

  const trainerOptions = ["All Trainers", ...trainers.map((t) => t.full_name)];
  const planOptions = ["All Plans", ...plans.map((p) => p.plan_name)];

  const activePct =
    stats.totalMembers > 0
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0;

  return (
    <div className="flex flex-col px-4 py-5 gap-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Members
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Members"
          value={stats.totalMembers}
          subtitle="All-time roster"
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Users}
          title="Active Members"
          value={stats.activeMembers}
          subtitle={`${activePct}% of total members`}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Expiring Soon"
          value={stats.expiringSoon}
          subtitle="Within 7 days"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          icon={IndianRupee}
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle={`₹${stats.pendingAmount.toLocaleString("en-IN")}`}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      <MembersTable
        initialMembers={members}
        trainerOptions={trainerOptions}
        planOptions={planOptions}
        availablePlans={plans}
        availableTrainers={trainers}
      />
    </div>
  );
}
