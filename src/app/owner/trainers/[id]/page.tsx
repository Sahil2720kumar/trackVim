"use client";

import { useState } from "react";
import {
  Users,
  Activity,
  Award,
  Star,
  Calendar,
  Clock,
  Briefcase,
  ArrowLeft,
  Edit3,
  MoreVertical,
  Search,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  XCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { MonthlySessionsChart } from "@/components/owner/MonthlySessionsChart";
import { MemberGrowthChart } from "@/components/owner/MemberGrowthChart";
import { trainerDetailQuickActions } from "@/components/owner/quick-actions-data";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { bigSquareButton } from "@/lib/styles";
import { TrainerAssignedMembersTable } from "@/components/owner/TrainerAssignedMembersTable";
import { initialAssignedMembers } from "@/mock/trainerAssignedMembers";


// Mock Data
const trainerData = {
  id: "TR-1025",
  name: "Rahul Sharma",
  status: "Active",
  joiningDate: "12 Mar 2023",
  experience: 5,
  avatar:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
  specializations: [
    { name: "Strength Training", color: "bg-purple-100 text-purple-700" },
    { name: "Weight Loss", color: "bg-purple-100 text-purple-700" },
    { name: "HIIT", color: "bg-purple-100 text-purple-700" },
    { name: "CrossFit", color: "bg-purple-100 text-purple-700" },
    { name: "Nutrition", color: "bg-purple-100 text-purple-700" },
  ],
  assignedMembers: 42,
  sessionsThisMonth: 118,
  attendanceRate: 96,
  averageRating: 4.9,
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  workingHours: "09:00 AM - 06:00 PM",
  employmentType: "Full Time",
  maxMembers: 40,
  currentMembers: 36,
  maxSessions: 8,
};

const monthlySessions = [
  { month: "Jan", sessions: 120 },
  { month: "Feb", sessions: 130 },
  { month: "Mar", sessions: 110 },
  { month: "Apr", sessions: 115 },
  { month: "May", sessions: 125 },
  { month: "Jun", sessions: 120 },
  { month: "Jul", sessions: 130 },
  { month: "Aug", sessions: 110 },
  { month: "Sep", sessions: 115 },
  { month: "Oct", sessions: 125 },
  { month: "Nov", sessions: 120 },
  { month: "Dec", sessions: 130 },
];

const memberGrowth = [
  { month: "Jun", members: 18 },
  { month: "Jul", members: 28 },
  { month: "Aug", members: 32 },
  { month: "Sep", members: 35 },
  { month: "Oct", members: 38 },
  { month: "Nov", members: 42 },
  { month: "Dec", members: 40 },
  { month: "Jan", members: 45 },
  { month: "Feb", members: 48 },
  { month: "Mar", members: 50 },
  { month: "Apr", members: 52 },
  { month: "May", members: 55 },
];


const recentActivities = [
  {
    id: "1",
    description: "Completed Strength Training session for Rohan Sharma",
    time: "Today, 10:30 AM",
    icon: CheckCircle2,
    color: "text-blue-500",
  },
  {
    id: "2",
    description: "Assigned new member Arjun Mehta",
    time: "Today, 09:15 AM",
    icon: Users,
    color: "text-emerald-500",
  },
  {
    id: "3",
    description: "Updated workout plan for Neha Patel",
    time: "Yesterday, 06:20 PM",
    icon: Briefcase,
    color: "text-amber-500",
  },
  {
    id: "4",
    description: "Marked attendance for 8 members",
    time: "Yesterday, 05:45 PM",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    id: "5",
    description: "Member Vikram Singh achieved weight loss goal",
    time: "20 May 2025, 08:30 AM",
    icon: Award,
    color: "text-rose-500",
  },
];

const getPlanBadgeColor = (plan: string) => {
  if (plan.includes("Gold")) return "bg-amber-100 text-amber-700";
  if (plan.includes("Premium")) return "bg-purple-100 text-purple-700";
  if (plan.includes("Silver")) return "bg-gray-100 text-gray-700";
  return "bg-blue-100 text-blue-700";
};

const getProgressColor = (progress: string) => {
  switch (progress.toLowerCase()) {
    case "excellent":
      return "bg-emerald-500";
    case "good":
      return "bg-blue-500";
    case "average":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};

export default function TrainerProfilePage() {
  return (

    <div className="flex-1 bg-background">
      <div className="flex flex-col gap-6 lg:flex-row px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20 border-2 border-border sm:h-24 sm:w-24">
                <AvatarImage src={trainerData.avatar} />
                <AvatarFallback>RS</AvatarFallback>
              </Avatar>
              <div className="sm:pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    {trainerData.name}
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {trainerData.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Trainer ID: {trainerData.id} | Joined:{" "}
                  {trainerData.joiningDate} | {trainerData.experience} Years
                  Experience
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {trainerData.specializations.map((spec) => (
                    <Badge
                      key={spec.name}
                      variant="secondary"
                      className={`${spec.color} border-0`}
                    >
                      {spec.name}
                    </Badge>
                  ))}
                  <Badge variant="outline">+1</Badge>
                </div>
              </div>
            </div>

            {/* Actions: full buttons from md up, compact icon row below md */}
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" className={bigSquareButton}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Trainers
              </Button>
              <Button variant="outline" className={bigSquareButton}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Trainer
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={bigSquareButton}>
                    <MoreVertical className="w-4 h-4 mr-2" />
                    More Actions
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="w-4 h-4 mr-2" />
                    View Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Trainer
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate Trainer
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Trainer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Compact action bar for mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 ${bigSquareButton}`}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`flex-1 ${bigSquareButton}`}
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="w-4 h-4 mr-2" />
                    View Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Trainer
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate Trainer
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Trainer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assigned Members"
              value={trainerData.assignedMembers}
              trend={{ value: "+3%", positive: true }}
              icon={Users}
              iconBg="bg-violet-100 dark:bg-violet-500/15"
              iconColor="text-violet-600"
            />

            <StatCard
              title="Sessions This Month"
              value={trainerData.sessionsThisMonth}
              trend={{ value: "+12%", positive: true }}
              icon={Activity}
              iconBg="bg-blue-100 dark:bg-blue-500/15"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Attendance Rate"
              value={`${trainerData.attendanceRate}%`}
              trend={{ value: "+4%", positive: true }}
              icon={ShieldCheck}
              iconBg="bg-emerald-100 dark:bg-emerald-500/15"
              iconColor="text-emerald-600"
            />

            <StatCard
              title="Average Rating"
              value={trainerData.averageRating}
              trend={{ value: "+0.2", positive: true }}
              icon={Star}
              iconBg="bg-orange-100 dark:bg-orange-500/15"
              iconColor="text-orange-500"
            />
          </div>

          {/* Performance Analytics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Performance Analytics
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Monthly Sessions Chart */}
              <MonthlySessionsChart data={monthlySessions} />
              {/* Member Growth Chart */}
              <MemberGrowthChart data={memberGrowth} />
            </div>
          </div>

          {/* Working Schedule */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Working Schedule
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Working Days
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded border text-sm font-medium ${
                            trainerData.workingDays.includes(day)
                              ? "bg-purple-100 text-purple-700 border-purple-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {trainerData.workingDays.includes(day) ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            day.substring(0, 1)
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-foreground truncate">
                          {trainerData.workingHours}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Employment Type
                        </p>
                        <p className="font-semibold text-foreground truncate">
                          {trainerData.employmentType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Metrics */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">Capacity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Members
                  </span>
                  <span className="font-semibold text-foreground">
                    {trainerData.maxMembers} Members
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Sessions / Day
                  </span>
                  <span className="font-semibold text-foreground">
                    {trainerData.maxSessions} Sessions
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Assigned Members */}
          <TrainerAssignedMembersTable initialMembers={initialAssignedMembers} />


          {/* Recent Activities & Quick Actions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Recent Activities
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <Icon
                        className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <QuickActionsGrid
                actions={trainerDetailQuickActions}
                columns={2}
              />
            </Card>
          </div>
        </div>

        {/* Right Sidebar — flows below content until lg, then sticky rail */}
        <div className="w-full lg:block lg:w-80 lg:shrink-0 space-y-4">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-6">
            <h3 className="font-semibold text-foreground mb-4">
              Trainer Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-sm text-muted-foreground">
                  Profile Preview
                </span>
              </div>

              <div className="text-center py-3">
                <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-border">
                  <AvatarImage src={trainerData.avatar} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">
                  {trainerData.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Trainer ID: {trainerData.id}
                </p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                  Active
                </Badge>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 shrink-0" />
                    Current Status
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    Today&apos;s Schedule
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {trainerData.workingHours}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    Working Days
                  </span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {trainerData.workingDays.join(", ")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    Employment Type
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainerData.employmentType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" />
                    Maximum Members
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainerData.maxMembers}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" />
                    Current Members
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainerData.currentMembers}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 shrink-0" />
                    Max Sessions / Day
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {trainerData.maxSessions}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Invitation Status
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                    Accepted
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Profile Completion
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    100% Completed
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
