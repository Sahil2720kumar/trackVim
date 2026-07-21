export type Plan = {
  id: number;
  name: string;
  badge: string | null;
  price: number;
  duration: string;
  description: string;
  features: string[];
  planDetails: {
    duration: string;
    members: number;
    joiningFee: number;
    renewalPeriod: string;
  };
  stats: { revenue: number; renewals: number; newMembers: number };
  status: "Active" | "Inactive";
};

export const initialPlans: Plan[] = [
  {
    id: 1,
    name: "Premium Plan",
    badge: "Popular",
    price: 2000,
    duration: "Month",
    description: "Perfect for members looking for unlimited gym access.",
    features: [
      "Unlimited Gym Access",
      "Locker Facility",
      "Free Fitness Assessment",
      "Workout Plan",
      "Trainer Support",
      "Mobile App Access",
    ],
    planDetails: {
      duration: "1 Month",
      members: 248,
      joiningFee: 500,
      renewalPeriod: "Monthly",
    },
    stats: { revenue: 6840000, renewals: 186, newMembers: 32 },
    status: "Active",
  },
  {
    id: 2,
    name: "Gold Plan",
    badge: null,
    price: 4500,
    duration: "3 Months",
    description: "Great for consistent members who want long-term results.",
    features: [
      "Unlimited Gym Access",
      "Locker Facility",
      "Free Fitness Assessment",
      "Workout Plan",
      "Trainer Support",
      "Mobile App Access",
    ],
    planDetails: {
      duration: "3 Months",
      members: 142,
      joiningFee: 750,
      renewalPeriod: "Quarterly",
    },
    stats: { revenue: 6390000, renewals: 98, newMembers: 28 },
    status: "Active",
  },
  {
    id: 3,
    name: "Silver Plan",
    badge: null,
    price: 1200,
    duration: "Month",
    description: "Affordable plan for beginners and enthusiasts.",
    features: [
      "Gym Access (1 Time/Day)",
      "Locker Facility",
      "Basic Workout Access",
    ],
    planDetails: {
      duration: "1 Month",
      members: 156,
      joiningFee: 300,
      renewalPeriod: "Monthly",
    },
    stats: { revenue: 1872000, renewals: 124, newMembers: 24 },
    status: "Active",
  },
  {
    id: 4,
    name: "Student Plan",
    badge: null,
    price: 999,
    duration: "Month",
    description: "Special plan for students with valid ID cards.",
    features: [
      "Gym Access (1 Time/Day)",
      "Locker Facility",
      "Basic App Access",
    ],
    planDetails: {
      duration: "1 Month",
      members: 48,
      joiningFee: 0,
      renewalPeriod: "Monthly",
    },
    stats: { revenue: 47952, renewals: 28, newMembers: 8 },
    status: "Inactive",
  },
];

export const revenueData = [
  { month: "Jun", revenue: 2100000 },
  { month: "Jul", revenue: 2800000 },
  { month: "Aug", revenue: 2400000 },
  { month: "Sep", revenue: 3100000 },
  { month: "Oct", revenue: 2900000 },
  { month: "Nov", revenue: 3200000 },
  { month: "Dec", revenue: 3500000 },
  { month: "Jan", revenue: 3100000 },
  { month: "Feb", revenue: 3400000 },
  { month: "Mar", revenue: 3800000 },
  { month: "Apr", revenue: 4100000 },
  { month: "May", revenue: 3900000 },
];

export const topPlans = [
  {
    rank: 1,
    name: "Premium Plan",
    revenue: 4860000,
    members: 248,
    growth: 13.5,
  },
  { rank: 2, name: "Gold Plan", revenue: 2230000, members: 142, growth: 8.2 },
  { rank: 3, name: "Silver Plan", revenue: 1872000, members: 156, growth: 5.4 },
  { rank: 4, name: "Student Plan", revenue: 47952, members: 48, growth: 3.1 },
  {
    rank: 5,
    name: "Corporate Plan",
    revenue: 260000,
    members: 16,
    growth: -2.3,
  },
];
