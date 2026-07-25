"use client";

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit,
  Copy,
  ChevronRight,
  ChevronLeft,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Target,
  UserCircle2,
  ClipboardEdit,
  Download,
  ListChecks,
  LogIn,
  LogOut,
  UserCog,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type AttendanceStatus = "Present" | "Absent" | "Late" | "Holiday";

interface MemberDetail {
  id: string;
  name: string;
  memberId: string;
  status: "Active" | "On Leave" | "Inactive";
  joinDate: string;
  age: number;
  gender: string;
  membershipPlan: string;
  membershipStartDate: string;
  membershipExpiryDate: string;
  membershipRenewalDate: string;
  remainingDays: number;
  phone: string;
  email: string;
  location: string;
  personalInfo: {
    dateOfBirth: string;
    height: string;
    weight: string;
    bmi: string;
    bloodGroup: string;
  };
  goals: string[];
  trainerNotes: string;
  lastUpdated: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  insights: {
    bestAttendanceMonth: string;
    averageCheckInTime: string;
    totalMissedSessions: number;
    consistencyScore: string;
    consistencyLabel: string;
  };
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  session: string;
  duration: string;
  status: AttendanceStatus;
  trainer: string;
  notes: string;
}

type MarkedBy = "Member" | "Trainer";

interface TodayCheckState {
  date: string; // YYYY-MM-DD — the day this check-in state belongs to
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInBy: MarkedBy | null;
  checkOutBy: MarkedBy | null;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_MEMBER: MemberDetail = {
  id: "1",
  name: "Rahul Sharma",
  memberId: "TM-1024",
  status: "Active",
  joinDate: "12 Aug 2024",
  age: 27,
  gender: "Male",
  membershipPlan: "Premium Plan",
  membershipStartDate: "12 Aug 2024",
  membershipExpiryDate: "12 Dec 2026",
  membershipRenewalDate: "12 Dec 2026",
  remainingDays: 144,
  phone: "+91 98765 43210",
  email: "rahul.sharma@gmail.com",
  location: "Guwahati, Assam, India",
  personalInfo: {
    dateOfBirth: "14 Apr 1997",
    height: "175 cm",
    weight: "74 kg",
    bmi: "24.2 (Normal)",
    bloodGroup: "O+",
  },
  goals: ["Weight Loss", "Muscle Gain", "Strength"],
  trainerNotes:
    "Rahul is very consistent with his workouts and maintains good discipline. Focus on increasing strength training and improving lower body endurance.",
  lastUpdated: "20 Jul 2026, 8:45 AM",
  emergencyContact: {
    name: "Priya Sharma",
    relation: "Sister",
    phone: "+91 91234 56789",
  },
  insights: {
    bestAttendanceMonth: "June 2026 (96%)",
    averageCheckInTime: "7:08 AM",
    totalMissedSessions: 6,
    consistencyScore: "88%",
    consistencyLabel: "Good",
  },
};

const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "1",
    date: "2026-07-22",
    checkIn: "7:00 AM",
    checkOut: "8:05 AM",
    session: "Morning Strength",
    duration: "1h 05m",
    status: "Present",
    trainer: "Rahul Sharma",
    notes: "−",
  },
  {
    id: "2",
    date: "2026-07-21",
    checkIn: "7:05 AM",
    checkOut: "8:10 AM",
    session: "Morning Strength",
    duration: "1h 05m",
    status: "Present",
    trainer: "Rahul Sharma",
    notes: "−",
  },
  {
    id: "3",
    date: "2026-07-20",
    checkIn: "−",
    checkOut: "−",
    session: "Morning Strength",
    duration: "−",
    status: "Absent",
    trainer: "−",
    notes: "Sick",
  },
  {
    id: "4",
    date: "2026-07-19",
    checkIn: "7:20 AM",
    checkOut: "8:15 AM",
    session: "HIIT Cardio",
    duration: "55m",
    status: "Late",
    trainer: "Rahul Sharma",
    notes: "Traffic",
  },
  {
    id: "5",
    date: "2026-07-18",
    checkIn: "7:00 AM",
    checkOut: "8:00 AM",
    session: "Upper Body",
    duration: "1h 00m",
    status: "Present",
    trainer: "Rahul Sharma",
    notes: "−",
  },
  {
    id: "6",
    date: "2026-07-01",
    checkIn: "7:00 AM",
    checkOut: "8:00 AM",
    session: "Upper Body",
    duration: "1h 00m",
    status: "Present",
    trainer: "Rahul Sharma",
    notes: "−",
  },
];

const MONTHLY_TREND_DATA = [
  { name: "Feb", value: 58 },
  { name: "Mar", value: 64 },
  { name: "Apr", value: 71 },
  { name: "May", value: 68 },
  { name: "Jun", value: 85 },
  { name: "Jul", value: 92 },
];

const CHART_RANGE_OPTIONS = ["3 Month", "Half Yearly", "Yearly"] as const;

// ============================================================================
// Reusable Components
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    value: number;
    comparison: string;
  };
}

function StatCard({ icon, label, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 min-w-0">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1  wrap-break-word">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === "up" ? (
                <span className="text-green-600 text-xs font-medium">
                  ↑ {trend.value}%
                </span>
              ) : (
                <span className="text-red-600 text-xs font-medium">
                  ↓ {trend.value}%
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {trend.comparison}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function InfoField({ label, value, icon, action }: InfoFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-foreground truncate">
            {value}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

function ChartRangeSelect() {
  return (
    <select className="text-sm px-3 py-1.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
      {CHART_RANGE_OPTIONS.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

// ============================================================================
// Today's Check-in / Check-out Card
// ============================================================================

/**
 * Returns YYYY-MM-DD for a given date, used to key today's check-in state so
 * it naturally resets each day without any extra scheduling logic — a new
 * calendar day simply produces a new key and the card goes back to "pending".
 */
function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TodayCheckInCardProps {
  memberName: string;
  today?: Date;
}

function TodayCheckInCard({
  memberName,
  today = new Date(),
}: TodayCheckInCardProps) {
  const todayKey = toDateKey(today);

  const [checkState, setCheckState] = useState<TodayCheckState>({
    date: todayKey,
    checkInTime: null,
    checkOutTime: null,
    checkInBy: null,
    checkOutBy: null,
  });

  // Day-specific: if the stored state belongs to an earlier day, treat the
  // card as freshly pending for today instead of showing yesterday's data.
  const state =
    checkState.date === todayKey
      ? checkState
      : {
          date: todayKey,
          checkInTime: null,
          checkOutTime: null,
          checkInBy: null,
          checkOutBy: null,
        };

  const handleCheckIn = (by: MarkedBy) => {
    setCheckState({
      ...state,
      checkInTime: formatTime(new Date()),
      checkInBy: by,
    });
  };

  const handleCheckOut = (by: MarkedBy) => {
    setCheckState({
      ...state,
      checkOutTime: formatTime(new Date()),
      checkOutBy: by,
    });
  };

  const status: "pending" | "checked-in" | "checked-out" = state.checkOutTime
    ? "checked-out"
    : state.checkInTime
      ? "checked-in"
      : "pending";

  const statusConfig = {
    pending: {
      label: "Not Checked In",
      cls: "bg-gray-100 text-gray-700 border-gray-200",
    },
    "checked-in": {
      label: "Checked In",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    "checked-out": {
      label: "Session Complete",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
  } as const;

  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">
                Today&apos;s Session
              </p>
              <div
                className={`px-2 py-0.5 border rounded text-xs font-medium whitespace-nowrap ${statusConfig[status].cls}`}
              >
                {statusConfig[status].label}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayLabel}
              {state.checkInTime && (
                <>
                  {" • Checked in "}
                  <span className="font-medium text-foreground">
                    {state.checkInTime}
                  </span>
                  {state.checkInBy && ` (by ${state.checkInBy})`}
                </>
              )}
              {state.checkOutTime && (
                <>
                  {" • Checked out "}
                  <span className="font-medium text-foreground">
                    {state.checkOutTime}
                  </span>
                  {state.checkOutBy && ` (by ${state.checkOutBy})`}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {status === "pending" && (
            <>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => handleCheckIn("Member")}
              >
                <LogIn className="w-4 h-4" />
                {memberName.split(" ")[0]} Check In
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => handleCheckIn("Trainer")}
              >
                <UserCog className="w-4 h-4" />
                Check In (Trainer)
              </Button>
            </>
          )}

          {status === "checked-in" && (
            <>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => handleCheckOut("Member")}
              >
                <LogOut className="w-4 h-4" />
                {memberName.split(" ")[0]} Check Out
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => handleCheckOut("Trainer")}
              >
                <UserCog className="w-4 h-4" />
                Check Out (Trainer)
              </Button>
            </>
          )}

          {status === "checked-out" && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Session logged for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Calendar Card
// ============================================================================

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Monday-first index (0 = Mon ... 6 = Sun)
function getFirstDayOfMonth(date: Date) {
  const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const STATUS_STYLES: Record<
  AttendanceStatus,
  { cell: string; dot: string; label: string }
> = {
  Present: {
    cell: "bg-green-50 text-green-700",
    dot: "bg-green-100",
    label: "Present",
  },
  Late: {
    cell: "bg-amber-50 text-amber-700",
    dot: "bg-amber-100",
    label: "Late",
  },
  Absent: {
    cell: "bg-red-50 text-red-700",
    dot: "bg-red-100",
    label: "Absent",
  },
  Holiday: {
    cell: "bg-gray-100 text-gray-700",
    dot: "bg-gray-200",
    label: "Holiday",
  },
};

interface CalendarCardProps {
  today?: Date;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  today = new Date(2026, 6, 22),
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));

  // Attendance lookup (YYYY-MM-DD -> Status)
  const attendanceMap = useMemo(
    () =>
      Object.fromEntries(
        MOCK_ATTENDANCE_RECORDS.map((record) => [record.date, record.status]),
      ) as Record<string, AttendanceStatus>,
    [],
  );

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDateKey = (day: number) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`;

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const isToday = (day: number) => getDateKey(day) === todayKey;

  const getStatus = (day: number): AttendanceStatus | undefined =>
    attendanceMap[getDateKey(day)];

  const hasAttendance = (day: number) => getDateKey(day) in attendanceMap;

  // Only show legend items that exist in the current month
  const usedStatuses = useMemo(() => {
    return Array.from(
      new Set(
        MOCK_ATTENDANCE_RECORDS.filter((record) => {
          const date = new Date(record.date);

          return (
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear()
          );
        }).map((record) => record.status),
      ),
    );
  }, [currentDate]);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {monthLabel}
          </h3>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} />;
              }

              const status = getStatus(day);
              const todayFlag = isToday(day);
              const highlighted = hasAttendance(day);

              return (
                <div
                  key={index}
                  className={[
                    "aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-colors",

                    todayFlag &&
                      "bg-primary text-primary-foreground ring-2 ring-primary/40",

                    !todayFlag &&
                      highlighted &&
                      status &&
                      STATUS_STYLES[status].cell,

                    !todayFlag &&
                      !highlighted &&
                      "text-muted-foreground hover:bg-muted/50",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {usedStatuses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {usedStatuses.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${STATUS_STYLES[status].dot}`}
                />
                <span className="text-muted-foreground">
                  {STATUS_STYLES[status].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Sidebar cards — persistent across both tabs (right-hand column)
// ============================================================================

function ContactInfoCard({ member }: { member: MemberDetail }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <SectionHeader title="Current Information" />
      <div className="space-y-1">
        <InfoField
          label="Phone"
          value={member.phone}
          icon={<Phone className="w-4 h-4 text-muted-foreground shrink-0" />}
          action={
            <button className="p-2 border border-border rounded-lg hover:bg-gray-50 shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </button>
          }
        />
        <InfoField
          label="Email"
          value={member.email}
          icon={<Mail className="w-4 h-4 text-muted-foreground shrink-0" />}
          action={
            <button className="p-2 border border-border rounded-lg hover:bg-gray-50 shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </button>
          }
        />
        <InfoField
          label="Location"
          value={member.location}
          icon={<MapPin className="w-4 h-4 text-muted-foreground shrink-0" />}
        />
      </div>
    </div>
  );
}

function EmergencyContactCard({ member }: { member: MemberDetail }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <SectionHeader title="Emergency Contact" />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {member.emergencyContact.name}{" "}
            <span className="text-muted-foreground font-normal">
              ({member.emergencyContact.relation})
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {member.emergencyContact.phone}
          </p>
        </div>
        <button className="p-2 border border-border rounded-lg hover:bg-gray-50 shrink-0">
          <Phone className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  );
}

function AttendanceInsightsCard({ member }: { member: MemberDetail }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <SectionHeader title="Attendance Insights" />
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Best Attendance Month</p>
          <p className="text-sm font-medium text-foreground text-right">
            {member.insights.bestAttendanceMonth}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Average Check-in Time</p>
          <p className="text-sm font-medium text-foreground">
            {member.insights.averageCheckInTime}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Total Missed Sessions</p>
          <p className="text-sm font-medium text-foreground">
            {member.insights.totalMissedSessions}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Consistency Score</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {member.insights.consistencyScore}
            </p>
            <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-medium">
              {member.insights.consistencyLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerNotesCard({ member }: { member: MemberDetail }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <SectionHeader
        title="Trainer Notes"
        action={
          <button className="text-sm text-primary hover:underline shrink-0">
            Edit
          </button>
        }
      />
      <p className="text-sm text-foreground leading-relaxed">
        {member.trainerNotes}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        {member.lastUpdated} • By You
      </p>
    </div>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Mark Attendance", icon: CheckCircle2 },
    { label: "Edit Attendance Record", icon: ClipboardEdit },
    { label: "Export Attendance Report", icon: Download },
    { label: "View All Records", icon: ListChecks },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <SectionHeader title="Quick Actions" />
      <div className="space-y-1">
        {actions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between py-2.5 text-sm text-foreground hover:text-primary"
          >
            <span className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              {label}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Overview Tab Component
// ============================================================================

function OverviewTab({ member }: { member: MemberDetail }) {
  return (
    <div className="space-y-6 min-w-0">
      {/* Stats Cards */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard
          icon={<Dumbbell className="w-5 h-5 text-primary" />}
          label="Workout Completion"
          value="85%"
          subtitle="This Month"
          trend={{ direction: "up", value: 12, comparison: "vs last month" }}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          label="Attendance"
          value="92%"
          subtitle="This Month"
          trend={{ direction: "up", value: 8, comparison: "vs last month" }}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-600" />}
          label="Current Streak"
          value="16 days"
          subtitle="Best: 28 days"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          label="Next Session"
          value="Tomorrow, 7:00 AM"
          subtitle="Morning Strength"
        />
      </div>

      {/* Personal Info / Membership Details */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-lg p-6 min-w-0">
          <SectionHeader
            title="Personal Information"
            action={
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg hover:bg-gray-50 shrink-0">
                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Edit
                </span>
              </button>
            }
          />
          <div className="space-y-0">
            <InfoField label="Full Name" value={member.name} />
            <InfoField label="Phone" value={member.phone} />
            <InfoField label="Email" value={member.email} />
            <InfoField
              label="Date of Birth"
              value={member.personalInfo.dateOfBirth}
            />
            <InfoField label="Height" value={member.personalInfo.height} />
            <InfoField label="Weight" value={member.personalInfo.weight} />
            <InfoField label="BMI" value={member.personalInfo.bmi} />
            <InfoField
              label="Blood Group"
              value={member.personalInfo.bloodGroup}
            />
          </div>
        </div>

        {/* Membership Details */}
        <div className="bg-card border border-border rounded-lg p-6 min-w-0">
          <SectionHeader
            title="Membership Details"
            action={
              <button className="text-sm text-primary hover:underline shrink-0">
                View Invoice
              </button>
            }
          />
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Plan</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  {member.membershipPlan}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium text-foreground">
                  {member.membershipStartDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiry Date</p>
                <p className="text-sm font-medium text-foreground">
                  {member.membershipExpiryDate}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Next Renewal</p>
                <p className="text-sm font-medium text-foreground">
                  {member.membershipRenewalDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining Days</p>
                <p className="text-sm font-medium text-green-600">
                  {member.remainingDays} days
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <div className="inline-block px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-medium">
                {member.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-card border border-border rounded-lg p-6">
        <SectionHeader
          title="Goals"
          action={<Target className="w-4 h-4 text-muted-foreground shrink-0" />}
        />
        <div className="flex flex-wrap gap-2">
          {member.goals.map((goal, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded text-xs font-medium"
            >
              {goal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Attendance Tab Component
// ============================================================================

function AttendanceTab({ member }: { member: MemberDetail }) {
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: (info) => (
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "checkIn",
      header: "Check-in",
      cell: (info) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "checkOut",
      header: "Check-out",
      cell: (info) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "session",
      header: "Session",
      cell: (info) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: (info) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as AttendanceStatus;
        const statusConfig: Record<AttendanceStatus, string> = {
          Present: "bg-green-50 text-green-700 border-green-200",
          Absent: "bg-red-50 text-red-700 border-red-200",
          Late: "bg-amber-50 text-amber-700 border-amber-200",
          Holiday: "bg-gray-50 text-gray-700 border-gray-200",
        };
        return (
          <div
            className={`inline-block px-2.5 py-1 border rounded text-xs font-medium whitespace-nowrap ${statusConfig[status] || ""}`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "trainer",
      header: "Trainer",
      cell: (info) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (info) => (
        <span className="text-sm text-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: MOCK_ATTENDANCE_RECORDS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 min-w-0">
      {/* Attendance Stats */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          label="Attendance Rate"
          value="92%"
          subtitle="This Month"
          trend={{ direction: "up", value: 8, comparison: "vs last month" }}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          label="Present Days"
          value="23"
          subtitle="This Month"
          trend={{ direction: "up", value: 5, comparison: "vs last month" }}
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          label="Absent Days"
          value="2"
          subtitle="This Month"
          trend={{ direction: "down", value: 1, comparison: "vs last month" }}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          label="Late Check-ins"
          value="3"
          subtitle="This Month"
          trend={{ direction: "up", value: 2, comparison: "vs last month" }}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-600" />}
          label="Current Streak"
          value="16 days"
          subtitle="Best: 28 days"
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-card border border-border rounded-lg p-6 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Monthly Attendance Trend
          </h3>
          <ChartRangeSelect />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={MONTHLY_TREND_DATA}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.25}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance History + Calendar */}
      <div className="grid xl:grid-cols-3 gap-6 items-start">
        {/* Attendance History */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg p-6 min-w-0">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              Attendance History
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <select className="text-sm px-3 py-1.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>All Sessions</option>
                <option>Morning Strength</option>
                <option>HIIT Cardio</option>
                <option>Upper Body</option>
              </select>
              <button className="p-2 border border-border rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {table.getHeaderGroups()[0]?.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-xs font-semibold text-muted-foreground py-3 px-4"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-gray-50 last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="w-full flex items-center justify-center gap-1.5 mt-4 py-2 text-sm font-medium text-primary hover:underline">
            View All Records
            <ChevronRight className="w-4 h-4 rotate-90" />
          </button>
        </div>

        {/* Attendance Calendar */}
        <CalendarCard />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function MemberDetailPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance">(
    "overview",
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          {/* Member Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                <UserCircle2 className="w-full h-full text-white/90" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-foreground">
                    {MOCK_MEMBER.name}
                  </h1>
                  <div className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-medium">
                    {MOCK_MEMBER.status}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Member ID: {MOCK_MEMBER.memberId}</span>
                  <button className="ml-2 p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Joined on</span>
                    <span className="font-medium text-foreground">
                      {MOCK_MEMBER.joinDate}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {MOCK_MEMBER.age} Years
                  </div>
                  <div className="text-muted-foreground">
                    {MOCK_MEMBER.gender}
                  </div>
                  <div className="text-muted-foreground">
                    {MOCK_MEMBER.membershipPlan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Check-in / Check-out — day-specific, stays active until acted on */}
        <TodayCheckInCard memberName={MOCK_MEMBER.name} />

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border mt-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`py-4 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "attendance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Attendance
          </button>
        </div>

        {/* Content: left column = active tab's content, right column = persistent member sidebar */}
        <div className="grid gap-6 items-start pt-6">
          <div className="xl:col-span-2 min-w-0">
            {activeTab === "overview" && <OverviewTab member={MOCK_MEMBER} />}
            {activeTab === "attendance" && (
              <AttendanceTab member={MOCK_MEMBER} />
            )}
          </div>
        </div>

        <div
          className="grid gap-4 pt-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <ContactInfoCard member={MOCK_MEMBER} />
          <EmergencyContactCard member={MOCK_MEMBER} />
          <AttendanceInsightsCard member={MOCK_MEMBER} />
          <TrainerNotesCard member={MOCK_MEMBER} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
