// ─── Types ───────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "PaymentPending"
  | "PaymentUploaded"
  | "PaymentRejected"
  | "Active";

export type SortOption = "newest" | "oldest" | "name" | "plan";

export type AppliedFrom = "Mobile App" | "Website" | "Walk-in";

export interface MembershipPlan {
  name: string;
  duration: string;
  price: number;
  icon: "crown" | "diamond" | "shield" | "star";
  /** Optional — only populated where the full plan detail is shown */
  durationMonths?: number;
  benefits?: string[];
  gym?: string;
}

// ─── List item (applications table / board) ───────────────────────────────────

export interface Application {
  id: string;
  memberCode: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  plan: MembershipPlan;
  appliedDate: string;
  appliedFrom: AppliedFrom;
  status: ApplicationStatus;
  gymName: string;
  statusMessage?: string;
  ownerReviewDate?: string;
  paymentDate?: string;
}

// ─── Application detail (single application view) ─────────────────────────────

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone: string;
}

export interface FitnessProfile {
  height: string;
  weight: string;
  fitnessGoal: string;
  medicalConditions: string;
  allergies: string;
  emergencyContact: EmergencyContact;
}

export interface PaymentReceipt {
  id: string;
  amount: number;
  method: string;
  transactionId: string;
  uploadedAt: string;
  isCurrent: boolean;
  rejectionReason?: string;
  receiptImageUrl?: string;
}

export interface ActivityEntry {
  id: string;
  label: string;
  timestamp: string;
  by: string;
  iconType:
    | "submitted"
    | "viewed"
    | "approved"
    | "rejected"
    | "payment"
    | "verified"
    | "active"
    | "paymentRejected";
}

export interface ApplicationDetail {
  id: string;
  applicationId: string;
  membershipId: string;
  paymentId?: string;
  memberCode: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  /** Provided directly by the source system — not derived on the client */
  age: number;
  dateOfBirth: string;
  address: string;
  appliedOn: string;
  appliedFrom: AppliedFrom;
  avatarUrl?: string;
  plan: MembershipPlan;
  fitnessProfile: FitnessProfile;
  applicationNote: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  activatedBy?: string;
  activatedAt?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  rejectionReason?: string;
  paymentRejectionReason?: string;
  receipts: PaymentReceipt[];
  activityLog: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
}

// ─── Mock Data — Applications list ─────────────────────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-001",
    memberCode: "MEM-1024",
    name: "Rohit Sharma",
    email: "rohit.sharma@gmail.com",
    phone: "+91 98765 43210",
    avatarUrl: "https://i.pravatar.cc/80?img=11",
    plan: {
      name: "Annual Gold Plan",
      duration: "12 Months",
      price: 19999,
      icon: "crown",
    },
    appliedDate: "2024-05-20",
    appliedFrom: "Mobile App",
    status: "Pending",
    gymName: "TrackVim Fitness",
    statusMessage: "Application submitted by member",
  },
  {
    id: "app-002",
    memberCode: "MEM-1023",
    name: "Priya Singh",
    email: "priya.singh@gmail.com",
    phone: "+91 91234 56789",
    avatarUrl: "https://i.pravatar.cc/80?img=47",
    plan: {
      name: "Premium Plus Plan",
      duration: "6 Months",
      price: 8999,
      icon: "diamond",
    },
    appliedDate: "2024-05-18",
    appliedFrom: "Website",
    status: "Approved",
    gymName: "TrackVim Fitness",
    statusMessage: "Waiting for payment from member",
    ownerReviewDate: "2024-05-18",
  },
  {
    id: "app-003",
    memberCode: "MEM-1022",
    name: "Aman Verma",
    email: "aman.verma@gmail.com",
    phone: "+91 99876 54321",
    avatarUrl: "https://i.pravatar.cc/80?img=12",
    plan: {
      name: "Monthly Basic Plan",
      duration: "1 Month",
      price: 2499,
      icon: "shield",
    },
    appliedDate: "2024-05-17",
    appliedFrom: "Walk-in",
    status: "PaymentUploaded",
    gymName: "TrackVim Fitness",
    statusMessage: "Payment uploaded, waiting for verification",
    ownerReviewDate: "2024-05-17",
    paymentDate: "2024-05-18",
  },
  {
    id: "app-004",
    memberCode: "MEM-1021",
    name: "Neha Patil",
    email: "neha.patil@gmail.com",
    phone: "+91 87654 32109",
    avatarUrl: "https://i.pravatar.cc/80?img=49",
    plan: {
      name: "Quarterly Plan",
      duration: "3 Months",
      price: 5999,
      icon: "star",
    },
    appliedDate: "2024-05-15",
    appliedFrom: "Mobile App",
    status: "PaymentRejected",
    gymName: "TrackVim Fitness",
    statusMessage: "Payment was rejected, waiting for new receipt",
    ownerReviewDate: "2024-05-16",
    paymentDate: "2024-05-17",
  },
  {
    id: "app-005",
    memberCode: "MEM-1020",
    name: "Kiran Mehta",
    email: "kiran.mehta@gmail.com",
    phone: "+91 76543 21098",
    avatarUrl: "https://i.pravatar.cc/80?img=32",
    plan: {
      name: "Annual Gold Plan",
      duration: "12 Months",
      price: 19999,
      icon: "crown",
    },
    appliedDate: "2024-05-14",
    appliedFrom: "Website",
    status: "Active",
    gymName: "TrackVim Fitness",
    statusMessage: "Membership is active",
    ownerReviewDate: "2024-05-14",
    paymentDate: "2024-05-15",
  },
  {
    id: "app-006",
    memberCode: "MEM-1019",
    name: "Suresh Kumar",
    email: "suresh.kumar@gmail.com",
    phone: "+91 65432 10987",
    avatarUrl: "https://i.pravatar.cc/80?img=15",
    plan: {
      name: "Monthly Basic Plan",
      duration: "1 Month",
      price: 2499,
      icon: "shield",
    },
    appliedDate: "2024-05-13",
    appliedFrom: "Walk-in",
    status: "Rejected",
    gymName: "TrackVim Fitness",
    statusMessage: "Application was rejected by owner",
    ownerReviewDate: "2024-05-13",
  },
  {
    id: "app-007",
    memberCode: "MEM-1018",
    name: "Anita Rao",
    email: "anita.rao@gmail.com",
    phone: "+91 54321 09876",
    avatarUrl: "https://i.pravatar.cc/80?img=44",
    plan: {
      name: "Premium Plus Plan",
      duration: "6 Months",
      price: 8999,
      icon: "diamond",
    },
    appliedDate: "2024-05-12",
    appliedFrom: "Mobile App",
    status: "Pending",
    gymName: "TrackVim Fitness",
    statusMessage: "Application submitted by member",
  },
  {
    id: "app-008",
    memberCode: "MEM-1017",
    name: "Vikram Joshi",
    email: "vikram.joshi@gmail.com",
    phone: "+91 43210 98765",
    avatarUrl: "https://i.pravatar.cc/80?img=18",
    plan: {
      name: "Quarterly Plan",
      duration: "3 Months",
      price: 5999,
      icon: "star",
    },
    appliedDate: "2024-05-10",
    appliedFrom: "Website",
    status: "PaymentPending",
    gymName: "TrackVim Fitness",
    statusMessage: "Waiting for payment from member",
    ownerReviewDate: "2024-05-11",
  },
];

// ─── Mock Data — Single application detail ─────────────────────────────────────

export const MOCK_APPLICATION: ApplicationDetail = {
  id: "app-001",
  applicationId: "APP-2024-1024",
  membershipId: "GMEM-2024-1024",
  paymentId: "PAY-2024-2056",
  memberCode: "MEM-1024",
  name: "Rohit Sharma",
  email: "rohit.sharma@gmail.com",
  phone: "+91 98765 43210",
  gender: "Male",
  age: 26,
  dateOfBirth: "1998-03-15",
  address: "123, Green Park Avenue, Koramangala, Bangalore, Karnataka - 560034",
  appliedOn: "2024-05-20T10:30:00",
  appliedFrom: "Mobile App",
  avatarUrl: "https://i.pravatar.cc/150?img=11",
  plan: {
    name: "Annual Gold Plan",
    duration: "12 Months",
    durationMonths: 12,
    price: 19999,
    icon: "crown",
    gym: "TrackVim Fitness",
    benefits: [
      "Unlimited Gym Access",
      "Strength Area",
      "Cardio Zone",
      "Locker Access",
      "Group Classes",
    ],
  },
  fitnessProfile: {
    height: "175 cm",
    weight: "68 kg",
    fitnessGoal: "Muscle Gain",
    medicalConditions: "None",
    allergies: "Peanuts",
    emergencyContact: {
      name: "Amit Sharma",
      relationship: "Brother",
      phone: "+91 98765 11111",
      alternatePhone: "+91 91234 56789",
    },
  },
  applicationNote:
    "Looking forward to joining morning strength sessions and improving my overall fitness. I have prior experience with weight training for 2 years.",
  status: "PaymentUploaded",
  reviewedBy: "Sahil Kumar (Owner)",
  reviewedAt: "2024-05-20T11:45:00",
  membershipStartDate: undefined,
  membershipEndDate: undefined,
  rejectionReason: undefined,
  paymentRejectionReason: undefined,
  receipts: [
    {
      id: "rcpt-001",
      amount: 19999,
      method: "UPI",
      transactionId: "UPI/420512341234",
      uploadedAt: "2024-05-22T09:15:00",
      isCurrent: true,
      receiptImageUrl:
        "https://placehold.co/360x480/f5f3ff/6d28d9?text=Payment+Receipt",
    },
  ],
  activityLog: [
    {
      id: "act-001",
      label: "Application Submitted by Member",
      timestamp: "2024-05-20T10:30:00",
      by: "Rohit Sharma (Member)",
      iconType: "submitted",
    },
    {
      id: "act-002",
      label: "Application Viewed by Sahil Kumar",
      timestamp: "2024-05-20T10:35:00",
      by: "Sahil Kumar (Owner)",
      iconType: "viewed",
    },
    {
      id: "act-003",
      label: "Application Approved",
      timestamp: "2024-05-20T11:45:00",
      by: "Sahil Kumar (Owner)",
      iconType: "approved",
    },
    {
      id: "act-004",
      label: "Payment Uploaded by Member",
      timestamp: "2024-05-22T09:15:00",
      by: "Rohit Sharma (Member)",
      iconType: "payment",
    },
  ],
  createdAt: "2024-05-20T10:30:00",
  updatedAt: "2024-05-22T09:15:00",
  lastUpdatedBy: "Rohit Sharma (Member)",
};
