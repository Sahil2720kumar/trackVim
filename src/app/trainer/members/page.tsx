"use client";

// ============================================================================
// Imports
// ============================================================================
import React, { useState } from "react";
import { Users, UserCheck, Calendar, Clock, LucideIcon } from "lucide-react";
import { MembersTable } from "@/components/trainer/MembersTable";
import { Members, type Member } from "@/mock/trainer/members";
import { StatCard } from "@/components/StatCard";

// ============================================================================
// Types
// ============================================================================
interface StatisticCard {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: { value: string | number; positive: boolean };
  subtitle: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function MembersPage() {
  const [attendanceToday] = useState(41);

  const stats: StatisticCard[] = [
    {
      id: "assigned-members",
      label: "Assigned Members",
      value: Members.length,
      icon: Users,
      trend: {
        value: "+3",
        positive: true,
      },
      subtitle: "Currently assigned",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "active-members",
      label: "Active Members",
      value: Members.filter((m) => m.status === "Active").length,
      icon: UserCheck,
      trend: {
        value: "+2",
        positive: true,
      },
      subtitle: "Currently active",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "attendance-today",
      label: "Attendance Today",
      value: attendanceToday,
      icon: Calendar,
      trend: {
        value: "92%",
        positive: true,
      },
      subtitle: "Checked in today",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "on-leave",
      label: "On Leave",
      value: Members.filter((m) => m.status === "On Leave").length,
      icon: Clock,
      trend: {
        value: "-1",
        positive: false,
      },
      subtitle: "Temporary leave",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const handleRecordAttendance = () => {
    console.log("Record attendance clicked");
  };

  const handleViewProfile = (member: Member) => {
    console.log("View profile:", member.id);
  };

  const handleSendMessage = (member: Member) => {
    console.log("Send message:", member.id);
  };

  const handleRemoveMember = (member: Member) => {
    console.log("Remove member:", member.id);
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <StatCard
            key={stat.id}
            title={stat.label}
            value={stat.value}
            // trend={{ value: stat.trend.value, positive: stat.trend.positive }}
            icon={stat.icon}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            badge={stat.badge}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Reusable members table: header + search + filters + status pills + export + create button */}
      <MembersTable
        members={Members}
        title="Members"
        subtitle="Manage and monitor all members assigned to you."
        variant="full"
        showCreateButton
        createButtonLabel="Record Attendance"
        onCreateClick={handleRecordAttendance}
        onViewProfile={handleViewProfile}
        onSendMessage={handleSendMessage}
        onRemoveMember={handleRemoveMember}
        pageSize={10}
      />
    </div>
  );
}
