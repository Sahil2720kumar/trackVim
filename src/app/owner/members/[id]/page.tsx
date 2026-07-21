import { AttendanceAnalyticsChart } from "@/components/owner/AttendanceAnalyticsChart";
import { memberQuickActions } from "@/components/owner/quick-actions-data";
import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { StatCard } from "@/components/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Crown,
  Edit3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Shield,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

// Mock Data
const memberData = {
  id: "MB-1024",
  name: "Rohan Sharma",
  age: 26,
  gender: "Male",
  email: "rohan@email.com",
  phone: "+91 98765 43210",
  address: "221B Baker Street, London",
  avatar: "",
  occupation: "Software Engineer",
  bloodGroup: "B+",
  height: 175,
  weight: 72,
  fitnessGoal: "Muscle Building",
  memberSince: "12 Jan 2025",
  joinedDate: "12 Jan 2025",
  status: "Active",
  membershipTier: "Gold Member",
  plan: "Gold Plan",
  planAmount: 2000,
  startDate: "12 Jan 2025",
  expiryDate: "12 Aug 2026",
  daysRemaining: 18,
  membershipProgress: 72,
  monthsCompleted: "8.5 / 12 Months Completed",
  attendance: 91,
  checkIns: 142,
  sessionsCompleted: 84,
  totalPayments: 28500,
  emergencyContactName: "Neha Sharma",
  emergencyContactRelation: "Sister",
  emergencyContactPhone: "+91 91234 56789",
  trainer: {
    name: "Rahul Sharma",
    role: "Senior Trainer",
    specialization: "Strength & Conditioning",
    experience: "7+ Years",
    membersAssigned: 320,
    phone: "+91 98765 12345",
    email: "rahul@gym.com",
  },
  healthNotes: {
    medicalConditions: "None",
    allergies: "Peanuts",
    injuries: "Knee pain (mild)",
    doctorNotes: "Avoid heavy squats",
  },
  autoRenewal: true,
  paymentStatus: "Paid",
  lastPayment: "12 May 2026",
  nextDue: "12 Aug 2026",
  outstanding: "\u20b90",
};

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

const upcomingSessions = [
  {
    id: 1,
    date: "23 May",
    day: "Tomorrow",
    workout: "Strength Training",
    focus: "Upper Body Focus",
    time: "10:00 AM - 11:00 AM",
  },
  {
    id: 2,
    date: "24 May",
    day: "Fri",
    workout: "Cardio",
    focus: "Treadmill & HIIT",
    time: "6:00 PM - 7:00 PM",
  },
  {
    id: 3,
    date: "27 May",
    day: "Mon",
    workout: "HIIT Training",
    focus: "Full Body Workout",
    time: "7:30 PM - 8:30 PM",
  },
];

const recentActivity = [
  {
    id: 1,
    title: "Membership Renewed",
    description: "Gold Plan renewed for 12 months",
    timestamp: "12 May 2026, 10:30 AM",
    icon: Activity,
  },
  {
    id: 2,
    title: "Payment Received",
    description: "\u20b92,000 received for membership",
    timestamp: "12 May 2026, 10:28 AM",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Trainer Assigned",
    description: "Assigned to Rahul Sharma",
    timestamp: "5 days ago",
    icon: Users,
  },
];

export default function MemberProfilePage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-indigo-100 sm:h-24 sm:w-24">
            <AvatarImage
              src={memberData.avatar || undefined}
              alt={memberData.name}
            />
            <AvatarFallback className="bg-indigo-50 text-lg font-bold text-indigo-600 sm:text-xl">
              {memberData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">
              {memberData.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                <Crown className="h-3 w-3" />
                {memberData.membershipTier}
              </Badge>
              <Badge className="gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                <Check className="h-3 w-3" />
                {memberData.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>ID #{memberData.id}</span>
              <span className="hidden sm:inline">&bull;</span>
              <span>Joined {memberData.joinedDate}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {memberData.age} Years
              </span>
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {memberData.gender}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Member
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Calendar className="mr-2 h-4 w-4" />
            Attendance
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <CreditCard className="mr-2 h-4 w-4" />
            Payments
          </Button>
          <Button
            size="sm"
            className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Renew Membership
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Profile & Membership Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Member Information */}
            <Card className="border-gray-100 ">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Member Information</CardTitle>
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{memberData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate font-medium">{memberData.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{memberData.address}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation</p>
                    <p className="font-medium">{memberData.occupation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{memberData.bloodGroup}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">{memberData.height} cm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{memberData.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-xs font-medium">
                      {memberData.fitnessGoal}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Emergency Contact
                  </p>
                  <p className="font-medium">
                    {memberData.emergencyContactName} (
                    {memberData.emergencyContactPhone})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Membership Summary */}
            <Card className="border-gray-100 ">
              <CardHeader>
                <CardTitle className="text-base">Membership Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                  <span className="flex items-center gap-1.5 text-base font-semibold text-amber-800">
                    <Crown className="h-4 w-4" />
                    {memberData.plan}
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    ₹{memberData.planAmount}
                    <span className="text-sm font-medium text-muted-foreground">
                      {" "}
                      / month
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">{memberData.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{memberData.expiryDate}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium">
                    {memberData.daysRemaining} Days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Assigned Trainer
                  </span>
                  <span className="font-medium text-indigo-600">
                    {memberData.trainer.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auto Renewal</span>
                  <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                    {memberData.paymentStatus}
                  </Badge>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Membership Duration</p>
                    <p className="text-sm font-semibold">
                      {memberData.membershipProgress}%
                    </p>
                  </div>
                  <Progress
                    value={memberData.membershipProgress}
                    className="h-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {memberData.monthsCompleted}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Attendance"
              value={`${memberData.attendance}%`}
              subtitle={`${memberData.checkIns} Check-ins`}
              icon={Activity}
              trend={{ value: "8%", positive: true }}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              title="Total Payments"
              value={`₹${memberData.totalPayments.toLocaleString("en-IN")}`}
              icon={Wallet}
              trend={{ value: "12%", positive: true }}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatCard
              title="Sessions Completed"
              value={memberData.sessionsCompleted}
              subtitle="This year"
              icon={Users}
              trend={{ value: "16%", positive: true }}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Days Remaining"
              value={memberData.daysRemaining}
              subtitle="Until expiry"
              icon={Calendar}
              trend={{ value: "16%", positive: true }}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* Attendance Chart */}
          <AttendanceAnalyticsChart data={attendanceData} />

          {/* Trainer & Sessions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-100 ">
              <CardHeader>
                <CardTitle className="text-base">Assigned Trainer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-indigo-100">
                    <AvatarFallback className="bg-indigo-50 text-base font-bold text-indigo-600">
                      {memberData.trainer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{memberData.trainer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {memberData.trainer.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {memberData.trainer.specialization}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {memberData.trainer.experience}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    {memberData.trainer.membersAssigned} Members Assigned
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    {memberData.trainer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    {memberData.trainer.email}
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Trainer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Change Trainer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 ">
              <CardHeader>
                <CardTitle className="text-base">Upcoming Sessions</CardTitle>
                <CardDescription>Next scheduled workouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="min-w-[64px] rounded-lg bg-indigo-50 px-3 py-2 text-center">
                        <p className="text-xs font-medium text-muted-foreground">
                          {session.day}
                        </p>
                        <p className="font-bold text-indigo-600">
                          {session.date}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {session.workout}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.focus}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {session.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments & Recent Activity */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-100 ">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Payment Summary</CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-indigo-600"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid This Year</span>
                  <span className="font-bold">
                    ₹{memberData.totalPayments.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                    ₹0
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Due</span>
                  <span className="font-medium">{memberData.nextDue}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Payment</span>
                  <span className="font-medium">{memberData.lastPayment}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding</span>
                  <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                    {memberData.outstanding}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 ">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription>Latest member updates</CardDescription>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-indigo-600"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50">
                          <ActivityIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Notes */}
          <Card className="border-gray-100 ">
            <CardHeader>
              <CardTitle className="text-base">Health Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Medical Conditions
                  </p>
                  <p className="mt-1 font-medium">
                    {memberData.healthNotes.medicalConditions}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Allergies
                  </p>
                  <p className="mt-1 font-medium">
                    {memberData.healthNotes.allergies}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Injuries
                  </p>
                  <p className="mt-1 font-medium">
                    {memberData.healthNotes.injuries}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Doctor Notes
                  </p>
                  <p className="mt-1 font-medium">
                    {memberData.healthNotes.doctorNotes}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Emergency Contact
                </p>
                <p className="mt-1 font-medium">
                  {memberData.emergencyContactName} (
                  {memberData.emergencyContactRelation}) &bull;{" "}
                  {memberData.emergencyContactPhone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="border-gray-100 ">
            <CardHeader>
              <CardTitle className="text-base">Member Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                {memberData.status} Member
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 flex-shrink-0 text-amber-600" />
                Gold Plan
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                {memberData.attendance}% Attendance
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                Trainer Assigned
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Renewal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Expires In
                </p>
                <p className="text-2xl font-bold text-orange-600 sm:text-3xl">
                  {memberData.daysRemaining} Days
                </p>
              </div>
              <Progress value={memberData.membershipProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Renewal due on {memberData.expiryDate}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 ">
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: "Record Attendance", checked: true },
                { label: "Payment Reminder", checked: false },
                { label: "Schedule Follow-up", checked: false },
              ].map((task) => (
                <label
                  key={task.label}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    defaultChecked={task.checked}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">{task.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-100 ">
            <CardHeader>
              <CardTitle className="text-base">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <Phone className="h-5 w-5" />
                <span className="text-xs">Call</span>
              </Button>
              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="flex h-16 flex-col gap-1.5 border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Email</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-100  mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActionsGrid actions={memberQuickActions} columns={4} />
        </CardContent>
      </Card>
    </div>
  );
}
