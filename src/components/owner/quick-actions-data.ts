import {
  UserPlus,
  UserCog,
  Zap,
  ClipboardCheck,
  Activity,
  Plus,
  CreditCard,
  Users,
  Calendar,
  Edit3,
  LucideIcon,
  CheckCircle,
  Download,
  MessageSquare,
  FileText,
  Copy,
  Wallet,
  Receipt,
  Bell,
} from "lucide-react";

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  desc: string;
  bg: string;
  color: string;
  route?: string;
  onClick?: () => void;
}

// Used on the main Owner dashboard
export const dashboardQuickActions: QuickAction[] = [
  {
    icon: UserPlus,
    label: "Add Member",
    desc: "Register a new member",
    bg: "bg-violet-100",
    color: "text-violet-600",
    route: "/owner/members/new",
  },
  {
    icon: UserCog,
    label: "Add Trainer",
    desc: "Onboard a new trainer",
    bg: "bg-blue-100",
    color: "text-blue-600",
    route: "/owner/trainers/new",
  },
  {
    icon: Zap,
    label: "Create Plan",
    desc: "Set up a membership plan",
    bg: "bg-amber-100",
    color: "text-amber-600",
    route: "/owner/plans/new",
  },
  {
    icon: ClipboardCheck,
    label: "Mark Attendance",
    desc: "Log today's attendance",
    bg: "bg-green-100",
    color: "text-green-600",
    route: "/owner/attendance/scan",
  },
];

// Used on a Member detail / profile page
export const memberQuickActions: QuickAction[] = [
  {
    icon: Activity,
    label: "Mark Attendance",
    desc: "Log today's check-in",
    bg: "bg-green-100",
    color: "text-green-600",
    route: "/owner/attendance/scan",
  },
  {
    icon: Plus,
    label: "Renew Membership",
    desc: "Extend current plan",
    bg: "bg-violet-100",
    color: "text-violet-600",
    route: "/owner/members/renew",
  },
  {
    icon: CreditCard,
    label: "View Payments",
    desc: "View member payments",
    bg: "bg-amber-100",
    color: "text-amber-600",
    route: "/owner/payments",
  },
  {
    icon: Users,
    label: "Assign Trainer",
    desc: "Link a trainer to member",
    bg: "bg-blue-100",
    color: "text-blue-600",
    route: "/owner/trainers",
  },
  {
    icon: Calendar,
    label: "Schedule Session",
    desc: "Book a workout session",
    bg: "bg-pink-100",
    color: "text-pink-600",
    route: "/owner/trainers",
  },
  {
    icon: Edit3,
    label: "Edit Member",
    desc: "Update member details",
    bg: "bg-slate-100",
    color: "text-slate-600",
    route: "/owner/members",
  },
];

export function getMemberQuickActions(
  memberId: string,
  onMarkAttendance?: () => void,
  onAssignTrainer?: () => void,
): QuickAction[] {
  return [
    {
      icon: Activity,
      label: "Mark Attendance",
      desc: "Log today's check-in",
      bg: "bg-green-100",
      color: "text-green-600",
      // If a callback is provided, open the dialog instead of navigating
      ...(onMarkAttendance
        ? { onClick: onMarkAttendance }
        : { route: `/owner/attendance/scan?memberId=${memberId}` }),
    },
    {
      icon: Plus,
      label: "Renew Membership",
      desc: "Extend current plan",
      bg: "bg-violet-100",
      color: "text-violet-600",
      route: `/owner/members/renew?memberId=${memberId}`,
    },
    // {
    //   icon: CreditCard,
    //   label: "Record Payment",
    //   desc: "Log a cash payment",
    //   bg: "bg-amber-100",
    //   color: "text-amber-600",
    //   route: `/owner/members/${memberId}/payments`,
    // },
    {
      icon: Users,
      label: "Assign Trainer",
      desc: "Link a trainer to member",
      bg: "bg-blue-100",
      color: "text-blue-600",
      ...(onAssignTrainer
        ? { onClick: onAssignTrainer }
        : { route: `/owner/members/${memberId}` }),
    },
    // {
    //   icon: Calendar,
    //   label: "Schedule Session",
    //   desc: "Book a workout session",
    //   bg: "bg-pink-100",
    //   color: "text-pink-600",
    //   route: `/owner/members/${memberId}`,
    // },
    // {
    //   icon: Edit3,
    //   label: "Edit Member",
    //   desc: "Update member details",
    //   bg: "bg-slate-100",
    //   color: "text-slate-600",
    //   route: `/owner/members/${memberId}`,
    // },
  ];
}

export const memberDetailsQuickActions: QuickAction[] = [
  {
    icon: CheckCircle,
    label: "Mark Attendance",
    bg: "bg-blue-50",
    color: "text-blue-600",
    desc: "Mark attendance",
    route: "/owner/attendance/scan",
  },
  {
    icon: Download,
    label: "Export Report",
    bg: "bg-green-50",
    color: "text-green-600",
    desc: "Export report",
    route: "/owner/members",
  },
  {
    icon: Users,
    label: "View Profile",
    bg: "bg-purple-50",
    color: "text-purple-600",
    desc: "View profile",
    route: "/owner/members",
  },
  {
    icon: Activity,
    label: "Notify Member",
    bg: "bg-orange-50",
    color: "text-orange-600",
    desc: "Notify member",
    route: "/owner/members",
  },
];

export function getMemberDetailsQuickActions(memberId: string): QuickAction[] {
  return [
    {
      icon: CheckCircle,
      label: "Mark Attendance",
      bg: "bg-blue-50",
      color: "text-blue-600",
      desc: "Mark attendance",
      route: `/owner/members/${memberId}/attendance`,
    },
    {
      icon: Download,
      label: "Export Report",
      bg: "bg-green-50",
      color: "text-green-600",
      desc: "Export report",
      route: `/owner/members/${memberId}`,
    },
    {
      icon: Users,
      label: "View Profile",
      bg: "bg-purple-50",
      color: "text-purple-600",
      desc: "View profile",
      route: `/owner/members/${memberId}`,
    },
    {
      icon: Activity,
      label: "Notify Member",
      bg: "bg-orange-50",
      color: "text-orange-600",
      desc: "Notify member",
      route: `/owner/members/${memberId}`,
    },
  ];
}

export const memberBillingQuickActions: QuickAction[] = [
  {
    icon: CreditCard,
    label: "Record Payment",
    desc: "Record a new payment for this member",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: FileText,
    label: "Generate Invoice",
    desc: "Create and download an invoice",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/billing",
  },
  {
    icon: Download,
    label: "Download Statement",
    desc: "Download the member's payment statement",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: Bell,
    label: "Send Reminder",
    desc: "Notify the member about pending payments",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: Calendar,
    label: "Renew Membership",
    desc: "Extend or renew the membership plan",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/members/renew",
  },
  {
    icon: Receipt,
    label: "View Profile",
    desc: "Open the member's profile and details",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/members",
  },
];

export function getMemberBillingQuickActions(memberId: string): QuickAction[] {
  return [
    {
      icon: CreditCard,
      label: "Record Payment",
      desc: "Record a new payment for this member",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/${memberId}/payments`,
    },
    {
      icon: FileText,
      label: "Generate Invoice",
      desc: "Create and download an invoice",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/${memberId}/payments`,
    },
    {
      icon: Download,
      label: "Download Statement",
      desc: "Download the member's payment statement",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/${memberId}/payments`,
    },
    {
      icon: Bell,
      label: "Send Reminder",
      desc: "Notify the member about pending payments",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/${memberId}/payments`,
    },
    {
      icon: Calendar,
      label: "Renew Membership",
      desc: "Extend or renew the membership plan",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/renew?memberId=${memberId}`,
    },
    {
      icon: Receipt,
      label: "View Profile",
      desc: "Open the member's profile and details",
      bg: "bg-muted",
      color: "text-primary",
      route: `/owner/members/${memberId}`,
    },
  ];
}

export const trainerDetailQuickActions: QuickAction[] = [
  {
    icon: Calendar,
    label: "Schedule Session",
    desc: "Book a new training session",
    bg: "bg-violet-100",
    color: "text-violet-600",
    route: "/owner/trainers",
  },
  {
    icon: Users,
    label: "Assign Members",
    desc: "Link members to this trainer",
    bg: "bg-blue-100",
    color: "text-blue-600",
    route: "/owner/members",
  },
  {
    icon: Activity,
    label: "View Sessions",
    desc: "See all past & upcoming sessions",
    bg: "bg-green-100",
    color: "text-green-600",
    route: "/owner/trainers",
  },
  {
    icon: MessageSquare,
    label: "Message Trainer",
    desc: "Send a direct message",
    bg: "bg-amber-100",
    color: "text-amber-600",
    route: "/owner/trainers",
  },
  {
    icon: FileText,
    label: "Export Report",
    desc: "Download trainer performance report",
    bg: "bg-pink-100",
    color: "text-pink-600",
    route: "/owner/trainers",
  },
  {
    icon: Edit3,
    label: "Edit Trainer",
    desc: "Update trainer details",
    bg: "bg-slate-100",
    color: "text-slate-600",
    route: "/owner/trainers",
  },
];

export function getTrainerQuickActions(trainerId: string): QuickAction[] {
  return [
    {
      icon: Calendar,
      label: "Schedule Session",
      desc: "Book a new training session",
      bg: "bg-violet-100",
      color: "text-violet-600",
      route: `/owner/trainers/${trainerId}`,
    },
    {
      icon: Users,
      label: "Assign Members",
      desc: "Link members to this trainer",
      bg: "bg-blue-100",
      color: "text-blue-600",
      route: `/owner/trainers/${trainerId}`,
    },
    {
      icon: Activity,
      label: "View Sessions",
      desc: "See all past & upcoming sessions",
      bg: "bg-green-100",
      color: "text-green-600",
      route: `/owner/trainers/${trainerId}`,
    },
    {
      icon: MessageSquare,
      label: "Message Trainer",
      desc: "Send a direct message",
      bg: "bg-amber-100",
      color: "text-amber-600",
      route: `/owner/trainers/${trainerId}`,
    },
    {
      icon: FileText,
      label: "Export Report",
      desc: "Download trainer performance report",
      bg: "bg-pink-100",
      color: "text-pink-600",
      route: `/owner/trainers/${trainerId}`,
    },
    {
      icon: Edit3,
      label: "Edit Trainer",
      desc: "Update trainer details",
      bg: "bg-slate-100",
      color: "text-slate-600",
      route: `/owner/trainers/${trainerId}`,
    },
  ];
}

// Used on the Plans page
export const plansQuickActions: QuickAction[] = [
  {
    icon: Plus,
    label: "Create New Plan",
    desc: "Add a new membership plan",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/plans/new",
  },
  {
    icon: Copy,
    label: "Duplicate Plan",
    desc: "Copy existing plan",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/plans/new",
  },
  {
    icon: Download,
    label: "Export Plans",
    desc: "Download plan data",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/plans",
  },
  {
    icon: FileText,
    label: "View Revenue Report",
    desc: "Detailed financial report",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
];

export const paymentsQuickActions: QuickAction[] = [
  {
    icon: Wallet,
    label: "Record Payment",
    desc: "Add a new payment for a member",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: Receipt,
    label: "Generate Receipt",
    desc: "Create and download payment receipts",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: Bell,
    label: "Send Reminder",
    desc: "Send payment reminders to members",
    bg: "bg-muted",
    color: "text-primary",
    route: "/owner/payments",
  },
  {
    icon: Download,
    label: "Export Revenue Report",
    desc: "Download detailed financial reports",
    bg: "bg-muted",
    color: "text-primary",
  },
];
