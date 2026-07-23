"use client";

// ============================================================================
// Imports
// ============================================================================

import React from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { useRouter } from "next/navigation"; // swap for your router if different

import { SesssionTable } from "@/components/trainer/SesssionTable";
import { Sesssions, type Session } from "@/mock/trainer/sesssions";
import { MembersTable } from "@/components/trainer/MembersTable";
import { Members, type Member } from "@/mock/trainer/members";

// ============================================================================
// Types
// ============================================================================

interface DashboardStat {
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
// Mock Data
// ============================================================================

const MOCK_STATS: DashboardStat[] = [
  {
    id: "1",
    label: "Assigned Members",
    value: 48,
    icon: Users,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    trend: { value: "+6%", positive: true },
    subtitle: "+3 this week",
  },
  {
    id: "2",
    label: "Today's Sessions",
    value: 6,
    icon: Calendar,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: { value: "+6%", positive: true },
    badge: "2 upcoming",
    subtitle: "1 completed",
  },
  {
    id: "3",
    label: "Attendance Today",
    value: 41,
    icon: UserCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trend: { value: "85%", positive: true },
    subtitle: "+5% from yesterday",
  },
  {
    id: "4",
    label: "Upcoming Sessions",
    value: 3,
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    trend: { value: "-1", positive: false },
    subtitle: "Compared to yesterday",
  },
];

// ============================================================================
// Main Page Component
// ============================================================================

export default function TrainerDashboard() {
  const router = useRouter();

  const handleViewSession = (session: Session) =>
    router.push(`/sessions/${session.id}`);
  const handleEditSession = (session: Session) =>
    router.push(`/sessions/${session.id}/edit`);
  const handleCancelSession = (session: Session) =>
    console.log("cancel session", session.id);

  const handleViewProfile = (member: Member) =>
    router.push(`/trainer/members/${member.id}`);
  const handleSendMessage = (member: Member) =>
    console.log("message member", member.id);
  const handleRemoveMember = (member: Member) =>
    console.log("remove member", member.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Good Morning, Rahul 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your members and today&apos;s training
            schedule.
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {MOCK_STATS.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.label}
              value={stat.value}
              trend={{ value: stat.trend.value, positive: stat.trend.positive }}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              badge={stat.badge}
              subtitle={stat.subtitle}
            />
          ))}
        </section>

        {/* Today's Sessions and Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Reusable session table — same component as the Sessions page, no toolbar/create button here */}
          <div className="lg:col-span-2">
            <SesssionTable
              sessions={Sesssions}
              title="Today's Sessions"
              showCreateButton={false}
              viewAllHref="/trainer/sessions"
              showPagination={false}
              pageSize={6}
              onViewDetails={handleViewSession}
              onEditSession={handleEditSession}
              onCancelSession={handleCancelSession}
              showToolbar={false}
            />
          </div>

          {/* Attendance Summary */}
          <div>
            <Card className="border-0 shadow-sm bg-card h-full">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg font-semibold">
                  Today&apos;s Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">41</p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">7</p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">2</p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      Attendance Rate
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-green-600">
                          85%
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: "85%" }}
                        />
                      </div>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Great job! Your attendance rate is higher than last
                        week.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground pt-4 border-t">
                    41 / 48 Members attended today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reusable members table — compact widget variant, no toolbar/create button, links out to the full Members page */}
        <MembersTable
          members={Members}
          title="Assigned Members"
          variant="compact"
          pageSize={5}
          showCreateButton={false}
          showExportButton={false}
          showToolbar={false}
          showPagination={false}
          viewAllHref="/trainer/members"
          onViewProfile={handleViewProfile}
          onSendMessage={handleSendMessage}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  );
}
