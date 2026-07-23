import {
  Dumbbell,
  HeartPulse,
  Activity,
  Flame,
  Zap,
  StretchHorizontal,
  Clock,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// Shared types
// ============================================================================

export type SessionType =
  | "Personal Training"
  | "Group Session"
  | "Assessment"
  | "Consultation";

export type SessionStatus =
  | "Completed"
  | "Upcoming"
  | "Cancelled"
  | "InProgress";

export interface SessionMember {
  name: string;
  avatarUrl?: string;
  initials?: string;
}

export interface Session {
  id: string;
  name: string;
  /** Workout category, e.g. "Strength Training" */
  category: string;
  icon: LucideIcon;
  iconBg: string;
  member: SessionMember;
  type: SessionType;
  /** ISO date, e.g. "2026-07-23" */
  date: string;
  /** Display range, e.g. "7:00 AM - 8:00 AM" */
  time: string;
  duration: string;
  status: SessionStatus;
}

// ============================================================================
// Shared mock data
// ============================================================================

const AVATAR_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png";

export const Sesssions: Session[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    category: "Strength Training",
    icon: Dumbbell,
    iconBg: "bg-blue-100 text-blue-600",
    member: { name: "Amit Verma", avatarUrl: AVATAR_URL, initials: "AV" },
    type: "Personal Training",
    date: "2026-07-22",
    time: "7:00 AM - 8:00 AM",
    duration: "1h 00m",
    status: "Completed",
  },
  {
    id: "2",
    name: "HIIT Cardio",
    category: "Cardio Training",
    icon: HeartPulse,
    iconBg: "bg-red-100 text-red-600",
    member: { name: "Priya Singh", avatarUrl: AVATAR_URL, initials: "PS" },
    type: "Group Session",
    date: "2026-07-22",
    time: "9:00 AM - 10:00 AM",
    duration: "1h 00m",
    status: "Completed",
  },
  {
    id: "3",
    name: "Yoga Flexibility",
    category: "Flexibility Training",
    icon: StretchHorizontal,
    iconBg: "bg-cyan-100 text-cyan-600",
    member: { name: "Neha Kapoor", avatarUrl: AVATAR_URL, initials: "NK" },
    type: "Group Session",
    date: "2026-07-22",
    time: "6:00 PM - 7:00 PM",
    duration: "1h 00m",
    status: "Completed",
  },
  {
    id: "4",
    name: "Lower Body Strength",
    category: "Strength Training",
    icon: Dumbbell,
    iconBg: "bg-blue-100 text-blue-600",
    member: { name: "Rohan Mehta", avatarUrl: AVATAR_URL, initials: "RM" },
    type: "Personal Training",
    date: "2026-07-23",
    time: "7:00 AM - 8:00 AM",
    duration: "1h 00m",
    status: "Upcoming",
  },
  {
    id: "5",
    name: "Core & Abs",
    category: "Core Training",
    icon: Flame,
    iconBg: "bg-orange-100 text-orange-600",
    member: { name: "Sneha Reddy", avatarUrl: AVATAR_URL, initials: "SR" },
    type: "Personal Training",
    date: "2026-07-23",
    time: "10:00 AM - 11:00 AM",
    duration: "1h 00m",
    status: "Upcoming",
  },
  {
    id: "6",
    name: "Functional Training",
    category: "Functional Training",
    icon: Activity,
    iconBg: "bg-green-100 text-green-600",
    member: { name: "Vikram Das", avatarUrl: AVATAR_URL, initials: "VD" },
    type: "Group Session",
    date: "2026-07-23",
    time: "6:00 PM - 7:00 PM",
    duration: "1h 00m",
    status: "Upcoming",
  },
  {
    id: "7",
    name: "Full Body Workout",
    category: "Strength Training",
    icon: Zap,
    iconBg: "bg-purple-100 text-purple-600",
    member: { name: "Arjun Patel", avatarUrl: AVATAR_URL, initials: "AP" },
    type: "Personal Training",
    date: "2026-07-24",
    time: "7:00 AM - 8:00 AM",
    duration: "1h 00m",
    status: "Upcoming",
  },
  {
    id: "8",
    name: "Cardio Blast",
    category: "Cardio Training",
    icon: Clock,
    iconBg: "bg-red-100 text-red-600",
    member: { name: "Anjali Joshi", avatarUrl: AVATAR_URL, initials: "AJ" },
    type: "Group Session",
    date: "2026-07-21",
    time: "9:00 AM - 10:00 AM",
    duration: "1h 00m",
    status: "Cancelled",
  },
  {
    id: "9",
    name: "Boxing Training",
    category: "Combat Training",
    icon: Dumbbell,
    iconBg: "bg-purple-100 text-purple-600",
    member: { name: "Rahul Sharma", avatarUrl: AVATAR_URL, initials: "RS" },
    type: "Personal Training",
    date: "2026-07-25",
    time: "5:00 PM - 6:00 PM",
    duration: "1h 00m",
    status: "Upcoming",
  },
  {
    id: "10",
    name: "Pilates Session",
    category: "Flexibility Training",
    icon: StretchHorizontal,
    iconBg: "bg-cyan-100 text-cyan-600",
    member: { name: "Divya Nair", avatarUrl: AVATAR_URL, initials: "DN" },
    type: "Group Session",
    date: "2026-07-20",
    time: "10:00 AM - 11:00 AM",
    duration: "1h 00m",
    status: "Completed",
  },
];
