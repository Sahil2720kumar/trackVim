import { Users, Filter } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TrainersTable } from "@/components/owner/TrainersTable";
import { getAllTrainers, getTrainerStats } from "@/services/owner.query";
import { auth } from "@clerk/nextjs/server";

export default async function TrainersPage() {
  const { sessionClaims } = await auth();

  const gymId = sessionClaims?.publicMetadata?.gymId as unknown as string;

  const [trainersResult, statsResult] = await Promise.all([
    getAllTrainers(gymId),
    getTrainerStats(gymId),
  ]);

  if (!trainersResult.success) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load trainers: {trainersResult.error}
      </div>
    );
  }
  if (!statsResult.success) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load stats: {statsResult.error}
      </div>
    );
  }

  const { totalTrainers, activeTrainers, totalMembers, sessionsToday } =
    statsResult.data;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pt-4 sm:pt-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Trainers
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Trainers"
          value={totalTrainers}
          subtitle="At this gym"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Users}
          title="Active Trainers"
          value={activeTrainers}
          subtitle="Currently working"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Users}
          title="Members Assigned"
          value={totalMembers}
          subtitle="Active memberships"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Sessions Today"
          value={sessionsToday}
          subtitle="Scheduled today"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      <TrainersTable initialTrainers={trainersResult.data} />
    </div>
  );
}
