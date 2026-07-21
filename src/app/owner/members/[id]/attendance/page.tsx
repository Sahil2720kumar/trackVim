"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StatCard } from "@/components/StatCard";
import { AttendanceAnalyticsChart } from "@/components/owner/AttendanceAnalyticsChart";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { memberDetailsQuickActions } from "@/components/owner/quick-actions-data";
import { MemberAttendanceTable } from "@/components/owner/MemberAttendanceTable";
import { initialAttendanceRecords } from "@/mock/membersAttendance";

const attendanceData = [
  { month: "Jan", present: 45, absent: 12, late: 3 },
  { month: "Feb", present: 52, absent: 10, late: 4 },
  { month: "Mar", present: 48, absent: 14, late: 5 },
  { month: "Apr", present: 61, absent: 9, late: 3 },
  { month: "May", present: 55, absent: 11, late: 6 },
  { month: "Jun", present: 67, absent: 8, late: 2 },
  { month: "Jul", present: 72, absent: 7, late: 4 },
  { month: "Aug", present: 68, absent: 10, late: 3 },
  { month: "Sep", present: 74, absent: 6, late: 2 },
  { month: "Oct", present: 79, absent: 5, late: 3 },
  { month: "Nov", present: 85, absent: 4, late: 2 },
  { month: "Dec", present: 91, absent: 3, late: 1 },
];

const attendanceHistory = [
  {
    id: 1,
    date: "12 May 2025, Mon",
    checkIn: "06:05 AM",
    checkOut: "08:20 AM",
    duration: "2h 15m",
    status: "Present",
    notes: "Good session",
  },
  {
    id: 2,
    date: "11 May 2025, Sun",
    checkIn: "—",
    checkOut: "—",
    duration: "—",
    status: "Absent",
    notes: "—",
  },
  {
    id: 3,
    date: "10 May 2025, Sat",
    checkIn: "06:15 AM",
    checkOut: "08:30 AM",
    duration: "2h 15m",
    status: "Present",
    notes: "—",
  },
  {
    id: 4,
    date: "9 May 2025, Fri",
    checkIn: "06:00 AM",
    checkOut: "08:10 AM",
    duration: "2h 10m",
    status: "Present",
    notes: "—",
  },
  {
    id: 5,
    date: "8 May 2025, Thu",
    checkIn: "06:25 AM",
    checkOut: "08:45 AM",
    duration: "2h 20m",
    status: "Late",
    notes: "Reached 25m late",
  },
];

const monthlyData = [
  { name: "Present Days", value: 21, color: "bg-green-500" },
  { name: "Absent Days", value: 3, color: "bg-red-500" },
  { name: "Late Days", value: 2, color: "bg-yellow-500" },
];

const calendarDays = [
  { date: 1, status: "present" },
  { date: 2, status: "present" },
  { date: 3, status: "absent" },
  { date: 4, status: "present" },
  { date: 5, status: "present" },
  { date: 6, status: "present" },
  { date: 7, status: "late" },
  { date: 8, status: "present" },
  { date: 9, status: "present" },
  { date: 10, status: "present" },
  { date: 11, status: "holiday" },
  { date: 12, status: "present" },
  { date: 13, status: "present" },
  { date: 14, status: "present" },
  { date: 15, status: "present" },
  { date: 16, status: "present" },
  { date: 17, status: "present" },
  { date: 18, status: "absent" },
  { date: 19, status: "present" },
  { date: 20, status: "present" },
  { date: 21, status: "present" },
  { date: 22, status: "present" },
  { date: 23, status: "present" },
  { date: 24, status: "present" },
  { date: 25, status: "late" },
  { date: 26, status: "present" },
  { date: 27, status: "present" },
  { date: 28, status: "present" },
  { date: 29, status: "present" },
  { date: 30, status: "present" },
  { date: 31, status: "present" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Present":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Present
        </Badge>
      );
    case "Absent":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Absent
        </Badge>
      );
    case "Late":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Late
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getCalendarColor = (status: string) => {
  switch (status) {
    case "present":
      return "bg-green-500 text-white";
    case "absent":
      return "bg-red-500 text-white";
    case "late":
      return "bg-yellow-500 text-white";
    case "holiday":
      return "bg-slate-400 text-white";
    default:
      return "bg-muted";
  }
};

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("May");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentMonth, setCurrentMonth] = useState("May");

  const filteredAttendance = useMemo(() => {
    return attendanceHistory.filter((item) => {
      const matchesSearch =
        item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

  const stats = [
    {
      title: "Attendance Rate",
      value: "91%",
      subtitle: "142 Present",
      icon: Activity,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: { value: "+8%", positive: true },
    },
    {
      title: "Current Streak",
      value: "18 Days",
      subtitle: "Best: 24 Days",
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: { value: "+5 Days", positive: true },
    },
    {
      title: "Total Check-ins",
      value: "284",
      subtitle: "This Year",
      icon: Clock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: { value: "+16%", positive: true },
    },
    {
      title: "Missed Days",
      value: "12",
      subtitle: "This Year",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: { value: "+4", positive: false },
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Member Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button> */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 shrink-0 sm:h-14 sm:w-14">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" />
              <AvatarFallback>RS</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                Rohan Sharma
              </h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                ID: MB-1024 • Gold Plan • Active
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2 md:flex-nowrap">
          <Button variant="outline" className="w-full sm:w-auto">
            Export Attendance
          </Button>
          <Button className="w-full bg-primary text-primary-foreground sm:w-auto">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      <Separator />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={index}
              icon={Icon}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={{ value: stat.trend.value, positive: stat.trend.positive }}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
            />
          );
        })}
      </div>

      {/* Calendar and Analytics */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                Attendance Calendar
              </CardTitle>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>{currentMonth} 2025</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Holiday</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mt-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={`${day}-${i}`}
                    className="flex h-7 items-center justify-center text-[10px] font-semibold text-muted-foreground sm:h-8 sm:text-xs"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => (
                  <div
                    key={day.date}
                    className={`flex h-7 items-center justify-center rounded text-[10px] font-medium cursor-pointer transition-all hover:scale-110 sm:h-8 sm:text-xs ${getCalendarColor(
                      day.status,
                    )}`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        <AttendanceAnalyticsChart data={attendanceData} />
      </section>

      {/* Attendance History */}
      <MemberAttendanceTable initialRecords={initialAttendanceRecords} />

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Monthly Summary
            </CardTitle>
            <CardDescription>May 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {monthlyData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {item.value}
                  </p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.value / 31) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Attendance %</p>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  91%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  18 Days
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Duration</p>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  2h 12m
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Days</p>
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  26
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Attendance Trends
            </CardTitle>
            <CardDescription>Performance insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            {[
              { period: "This Week", percentage: 86 },
              { period: "This Month", percentage: 91 },
              { period: "This Year", percentage: 89 },
            ].map((trend, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {trend.period}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {trend.percentage}%
                  </p>
                </div>
                <Progress value={trend.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid actions={memberDetailsQuickActions} />
    </div>
  );
}
