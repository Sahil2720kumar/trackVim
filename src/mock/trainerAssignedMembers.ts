export type AssignedMember = {
  id: string;
  name: string;
  plan: string;
  attendance: number;
  progress: "Excellent" | "Good" | "Average";
  joinDate: string;
  status: "Active" | "Inactive";
  avatar: string;
};

export const initialAssignedMembers: AssignedMember[] = [
  {
    id: "1",
    name: "Rohan Sharma",
    plan: "Gold Plan",
    attendance: 92,
    progress: "Excellent",
    joinDate: "12 Jan 2025",
    status: "Active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
  },
  {
    id: "2",
    name: "Arjun Mehta",
    plan: "Premium Plan",
    attendance: 88,
    progress: "Good",
    joinDate: "18 Feb 2025",
    status: "Active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
  },
  {
    id: "3",
    name: "Neha Patel",
    plan: "Silver Plan",
    attendance: 78,
    progress: "Average",
    joinDate: "05 Mar 2025",
    status: "Active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
  },
  {
    id: "4",
    name: "Vikram Singh",
    plan: "Gold Plan",
    attendance: 95,
    progress: "Excellent",
    joinDate: "20 Mar 2025",
    status: "Active",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
  },
];

export const assignedMemberPlanOptions = [
  "All Plans",
  "Gold Plan",
  "Premium Plan",
  "Silver Plan",
];

export const assignedMemberStatusOptions = [
  "All Status",
  "Active",
  "Inactive",
];

export const assignedMemberProgressOptions = [
  "All Progress",
  "Excellent",
  "Good",
  "Average",
];
