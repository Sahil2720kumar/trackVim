import { Users, Filter } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { TrainersTable } from "@/components/owner/TrainersTable";
import { initialTrainers } from "@/mock/trainers";

export default async function TrainersPage() {
  const trainers = initialTrainers;

  const totalTrainers = trainers.length;
  const activeTrainers = trainers.filter((t) => t.status === "Active").length;
  const totalMembers = trainers.reduce((sum, t) => sum + t.assignedMembers, 0);
  const totalSessions = trainers.reduce((sum, t) => sum + t.todaySessions, 0);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pt-4 sm:pt-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Trainers
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Trainers"
          value={totalTrainers}
          subtitle="+2 this month"
          trend={{ value: "8%", positive: true }}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Users}
          title="Active Trainers"
          value={activeTrainers}
          subtitle="Currently working"
          trend={{ value: "5%", positive: true }}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={Users}
          title="Members Assigned"
          value={totalMembers}
          subtitle="Across all trainers"
          trend={{ value: "12%", positive: true }}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Sessions Today"
          value={totalSessions}
          subtitle="Scheduled today"
          trend={{ value: "3%", positive: true }}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      <TrainersTable initialTrainers={trainers} />
    </div>
  );
}
