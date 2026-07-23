// ============================================================================
// Shared types
// ============================================================================

export type MemberStatus = "Active" | "On Leave" | "Inactive" | "Pause";

export interface Member {
  id: string;
  memberId: string;
  name: string;
  avatarUrl: string;
  initials: string;
  membershipPlan: string;
  planValidity?: string;
  planIcon?: string;
  phone?: string;
  attendance: number;
  lastSession: string;
  lastSessionTime?: string;
  nextSession: string;
  nextSessionTime?: string;
  status: MemberStatus;
}

// ============================================================================
// Shared mock data
// ============================================================================

const AVATAR_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png";

export const Members: Member[] = [
  {
    id: "1",
    memberId: "TM-1024",
    name: "Rohan Mehta",
    avatarUrl: AVATAR_URL,
    initials: "RM",
    membershipPlan: "Premium Plan",
    planValidity: "Valid till 12 Dec 2026",
    planIcon: "💎",
    phone: "+91 98765 43210",
    attendance: 92,
    lastSession: "Yesterday",
    lastSessionTime: "7:00 AM",
    nextSession: "Tomorrow",
    nextSessionTime: "7:00 AM",
    status: "Active",
  },
  {
    id: "2",
    memberId: "AS-0897",
    name: "Ananya Singh",
    avatarUrl: AVATAR_URL,
    initials: "AS",
    membershipPlan: "Gold Plan",
    planValidity: "Valid till 18 Sep 2026",
    planIcon: "✨",
    phone: "+91 91234 56789",
    attendance: 88,
    lastSession: "2 days ago",
    lastSessionTime: "6:00 PM",
    nextSession: "Today",
    nextSessionTime: "9:00 AM",
    status: "Active",
  },
  {
    id: "3",
    memberId: "VP-0761",
    name: "Vikram Patel",
    avatarUrl: AVATAR_URL,
    initials: "VP",
    membershipPlan: "Basic Plan",
    planValidity: "Valid till 30 Jul 2026",
    planIcon: "📘",
    phone: "+91 99887 66554",
    attendance: 75,
    lastSession: "3 days ago",
    lastSessionTime: "7:00 AM",
    nextSession: "Today",
    nextSessionTime: "11:00 AM",
    status: "On Leave",
  },
  {
    id: "4",
    memberId: "NK-1122",
    name: "Neha Kapoor",
    avatarUrl: AVATAR_URL,
    initials: "NK",
    membershipPlan: "Premium Plan",
    planValidity: "Valid till 05 Aug 2026",
    planIcon: "💎",
    phone: "+91 98123 44321",
    attendance: 60,
    lastSession: "5 days ago",
    lastSessionTime: "6:00 PM",
    nextSession: "Tomorrow",
    nextSessionTime: "7:00 AM",
    status: "Active",
  },
  {
    id: "5",
    memberId: "AV-3345",
    name: "Arjun Verma",
    avatarUrl: AVATAR_URL,
    initials: "AV",
    membershipPlan: "Gold Plan",
    planValidity: "Valid till 22 Nov 2026",
    planIcon: "✨",
    phone: "+91 90123 45678",
    attendance: 45,
    lastSession: "1 week ago",
    lastSessionTime: "8:00 AM",
    nextSession: "-",
    nextSessionTime: "-",
    status: "Inactive",
  },
  {
    id: "6",
    memberId: "PN-5567",
    name: "Priya Nair",
    avatarUrl: AVATAR_URL,
    initials: "PN",
    membershipPlan: "Platinum Plan",
    planValidity: "Valid till 15 Feb 2027",
    planIcon: "👑",
    phone: "+91 98901 23456",
    attendance: 96,
    lastSession: "Yesterday",
    lastSessionTime: "5:30 PM",
    nextSession: "Today",
    nextSessionTime: "6:30 PM",
    status: "Active",
  },
  {
    id: "7",
    memberId: "KM-7788",
    name: "Karan Malhotra",
    avatarUrl: AVATAR_URL,
    initials: "KM",
    membershipPlan: "Basic Plan",
    planValidity: "Valid till 11 Oct 2026",
    planIcon: "📘",
    phone: "+91 91223 34455",
    attendance: 70,
    lastSession: "4 days ago",
    lastSessionTime: "7:15 AM",
    nextSession: "Tomorrow",
    nextSessionTime: "8:00 AM",
    status: "On Leave",
  },
  {
    id: "8",
    memberId: "SI-8899",
    name: "Sneha Iyer",
    avatarUrl: AVATAR_URL,
    initials: "SI",
    membershipPlan: "Gold Plan",
    planValidity: "Valid till 03 Jan 2027",
    planIcon: "✨",
    phone: "+91 98701 22334",
    attendance: 90,
    lastSession: "Yesterday",
    lastSessionTime: "7:00 PM",
    nextSession: "Today",
    nextSessionTime: "5:00 PM",
    status: "Active",
  },
  {
    id: "9",
    memberId: "PR-3345",
    name: "Priya Sharma",
    avatarUrl: AVATAR_URL,
    initials: "PS",
    membershipPlan: "Gold Plan",
    planValidity: "Valid till 09 Sep 2026",
    planIcon: "✨",
    phone: "+91 90011 22334",
    attendance: 85,
    lastSession: "Today",
    lastSessionTime: "6:00 PM",
    nextSession: "Tomorrow",
    nextSessionTime: "8:00 AM",
    status: "Active",
  },
];
