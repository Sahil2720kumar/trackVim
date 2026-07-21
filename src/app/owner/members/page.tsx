import { Users, Filter, X, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MembersTable } from "@/components/owner/MembersTable";
import { initialMembers } from "@/mock/members";

export default function MembersPage() {
  // Stats calculations (based on full member list, not filtered)
  const totalMembers = initialMembers.length;
  const activeMembers = initialMembers.filter(
    (m) => m.status === "Active",
  ).length;
  const expiringSoon = initialMembers.filter(
    (m) => m.status === "Expiring Soon",
  ).length;
  const pendingPayments = initialMembers.filter(
    (m) => m.status === "Pending",
  ).length;

  return (
    <div className="flex flex-col px-4 py-5 gap-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Members
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Total Members"
          value={totalMembers}
          subtitle="+28 this month"
          trend={{ value: "8%", positive: true }}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={Users}
          title="Active Members"
          value={activeMembers}
          subtitle={`${Math.round((activeMembers / totalMembers) * 100)}% of total members`}
          trend={{ value: "6%", positive: true }}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Filter}
          title="Expiring Soon"
          value={expiringSoon}
          subtitle="Within 7 days"
          trend={{ value: "12%", positive: false }}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          icon={IndianRupee}
          title="Pending Payments"
          value={pendingPayments}
          subtitle="₹52,000"
          trend={{ value: "5%", positive: false }}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Interactive search/filter/table/pagination/add-modal all live in the client component */}
      <MembersTable initialMembers={initialMembers} />
    </div>
  );
}
