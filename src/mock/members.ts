export type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  plan: string;
  planPrice: string;
  trainer: string;
  joined: string;
  expiry: string;
  daysLeft: number;
  attendance: number;
  status: string;
};

export const initialMembers: Member[] = [
  {
    id: 1,
    name: "Rohan Sharma",
    email: "rohan@email.com",
    phone: "+91 98765 43210",
    avatar: "RS",
    plan: "Gold Plan",
    planPrice: "₹2,000/month",
    trainer: "Rahul Sharma",
    joined: "12 Jan 2025",
    expiry: "12 Aug 2025",
    daysLeft: 82,
    attendance: 91,
    status: "Active",
  },
  {
    id: 2,
    name: "Neha Singh",
    email: "neha@email.com",
    phone: "+91 91234 56789",
    avatar: "NS",
    plan: "Silver Plan",
    planPrice: "₹1,500/month",
    trainer: "Priya Mehta",
    joined: "05 Jan 2025",
    expiry: "05 Jul 2025",
    daysLeft: 44,
    attendance: 76,
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@email.com",
    phone: "+91 99887 66554",
    avatar: "AV",
    plan: "Premium Plan",
    planPrice: "₹2,500/month",
    trainer: "Aman Verma",
    joined: "28 Dec 2024",
    expiry: "28 Jun 2025",
    daysLeft: 27,
    attendance: 84,
    status: "Active",
  },
  {
    id: 4,
    name: "Pooja Mehta",
    email: "pooja@email.com",
    phone: "+91 97654 32109",
    avatar: "PM",
    plan: "Silver Plan",
    planPrice: "₹1,500/month",
    trainer: "Priya Mehta",
    joined: "15 Dec 2024",
    expiry: "15 Jun 2025",
    daysLeft: 24,
    attendance: 62,
    status: "Expiring Soon",
  },
  {
    id: 5,
    name: "Vikram Patel",
    email: "vikram@email.com",
    phone: "+91 92345 67890",
    avatar: "VP",
    plan: "Gold Plan",
    planPrice: "₹2,000/month",
    trainer: "Rahul Sharma",
    joined: "10 Dec 2024",
    expiry: "10 May 2025",
    daysLeft: 0,
    attendance: 48,
    status: "Expired",
  },
  {
    id: 6,
    name: "Anjali Gupta",
    email: "anjali@email.com",
    phone: "+91 90011 22334",
    avatar: "AG",
    plan: "Silver Plan",
    planPrice: "₹1,500/month",
    trainer: "Priya Mehta",
    joined: "20 Oct 2025",
    expiry: "20 Apr 2025",
    daysLeft: 0,
    attendance: 0,
    status: "Pending",
  },
  {
    id: 7,
    name: "Sandeep Kumar",
    email: "sandeep@email.com",
    phone: "+91 88991 23456",
    avatar: "SK",
    plan: "Premium Plan",
    planPrice: "₹2,500/month",
    trainer: "Aman Verma",
    joined: "18 Apr 2025",
    expiry: "18 Apr 2025",
    daysLeft: 149,
    attendance: 80,
    status: "Active",
  },
  {
    id: 8,
    name: "Divya Sharma",
    email: "divya@email.com",
    phone: "+91 86543 21098",
    avatar: "DS",
    plan: "Gold Plan",
    planPrice: "₹2,000/month",
    trainer: "Rahul Sharma",
    joined: "02 Mar 2025",
    expiry: "02 Sep 2025",
    daysLeft: 105,
    attendance: 88,
    status: "Active",
  },
];

export const planOptions = [
  "All Plans",
  "Gold Plan",
  "Silver Plan",
  "Premium Plan",
];
export const trainerOptions = [
  "All Trainers",
  "Rahul Sharma",
  "Priya Mehta",
  "Aman Verma",
];
export const statusOptions = [
  "All",
  "Active",
  "Expired",
  "Expiring Soon",
  "Pending",
];
