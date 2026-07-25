"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  BadgeCheck,
  Clock3,
  CircleCheckBig,
  CircleX,
  Ban,
  CalendarDays,
  MapPin,
  ChevronRight,
  ClipboardCheck,
  Info,
  CreditCard,
  Timer,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Types ──────────────────────────────────────────────────────────────────────

type AppStatus =
  | "pending"
  | "approved"
  | "payment_pending"
  | "payment_verified"
  | "rejected"
  | "cancelled";

interface Application {
  id: string;
  gymId: string;
  gymName: string;
  gymLogo: string;
  gymLocation: string;
  verified: boolean;
  membershipPlan: string;
  price: string;
  duration: string;
  applicationDate: string;
  reviewDate?: string;
  paymentDate?: string;
  status: AppStatus;
  ownerMessage?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    gymId: "1",
    gymName: "IronForge Fitness",
    gymLogo: "/images/gym-1.png",
    gymLocation: "Downtown, Bangalore",
    verified: true,
    membershipPlan: "Annual Gold",
    price: "₹14,999",
    duration: "12 Months",
    applicationDate: "22 Jul 2026",
    status: "pending",
    ownerMessage: undefined,
  },
  {
    id: "app-2",
    gymId: "2",
    gymName: "Peak Performance Gym",
    gymLogo: "/images/gym-2.png",
    gymLocation: "Koramangala, Bangalore",
    verified: true,
    membershipPlan: "Monthly Plan",
    price: "₹1,499",
    duration: "1 Month",
    applicationDate: "10 Jul 2026",
    reviewDate: "12 Jul 2026",
    status: "payment_pending",
    ownerMessage:
      "Your application has been approved. Please complete the payment to activate your membership.",
  },
  {
    id: "app-3",
    gymId: "3",
    gymName: "Flex Fitness Studio",
    gymLogo: "/images/gym-3.png",
    gymLocation: "HSR Layout, Bangalore",
    verified: true,
    membershipPlan: "Quarterly Plan",
    price: "₹3,999",
    duration: "3 Months",
    applicationDate: "05 Jul 2026",
    reviewDate: "15 Jul 2026",
    status: "rejected",
    ownerMessage:
      "Application was rejected because membership capacity is currently full.",
  },
  {
    id: "app-4",
    gymId: "4",
    gymName: "PowerHouse Gym",
    gymLogo: "/images/gym-4.png",
    gymLocation: "Indiranagar, Bangalore",
    verified: true,
    membershipPlan: "Annual Silver",
    price: "₹9,999",
    duration: "12 Months",
    applicationDate: "28 Jun 2026",
    status: "cancelled",
    ownerMessage: undefined,
  },
  {
    id: "app-5",
    gymId: "5",
    gymName: "Form Fitness",
    gymLogo: "/images/gym-5.png",
    gymLocation: "Jayanagar, Bangalore",
    verified: false,
    membershipPlan: "Monthly Plan",
    price: "₹1,199",
    duration: "1 Month",
    applicationDate: "18 Jun 2026",
    status: "rejected",
    ownerMessage: "We are not accepting new memberships at this time.",
  },
  {
    id: "app-6",
    gymId: "6",
    gymName: "Elevate Fitness Club",
    gymLogo: "/images/gym-6.png",
    gymLocation: "Whitefield, Bangalore",
    verified: true,
    membershipPlan: "Quarterly Plan",
    price: "₹3,499",
    duration: "3 Months",
    applicationDate: "02 Jun 2026",
    reviewDate: "04 Jun 2026",
    paymentDate: "05 Jun 2026",
    status: "payment_verified",
    ownerMessage: "Welcome aboard! Your membership is now active.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const DEV_FILTERS: { label: string; value: "all" | AppStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Payment Verified", value: "payment_verified" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_META: Record<
  AppStatus,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ReactNode;
    iconBg: string;
    summaryLabel: string;
    summaryDesc: string;
  }
> = {
  pending: {
    label: "Pending Review",
    badgeBg:
      "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    badgeText: "text-amber-700 dark:text-amber-400",
    icon: <Clock3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    summaryLabel: "Pending Review",
    summaryDesc: "Awaiting gym owner review",
  },
  approved: {
    label: "Approved",
    badgeBg:
      "bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800",
    badgeText: "text-green-700 dark:text-green-400",
    icon: (
      <CircleCheckBig className="w-5 h-5 text-green-600 dark:text-green-400" />
    ),
    iconBg: "bg-green-100 dark:bg-green-900/40",
    summaryLabel: "Approved",
    summaryDesc: "Membership approved",
  },
  payment_pending: {
    label: "Payment Pending",
    badgeBg:
      "bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    badgeText: "text-blue-700 dark:text-blue-400",
    icon: <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    summaryLabel: "Payment Pending",
    summaryDesc: "Complete payment to activate",
  },
  payment_verified: {
    label: "Membership Active",
    badgeBg:
      "bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800",
    badgeText: "text-green-700 dark:text-green-400",
    icon: (
      <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
    ),
    iconBg: "bg-green-100 dark:bg-green-900/40",
    summaryLabel: "Payment Verified",
    summaryDesc: "Membership activated",
  },
  rejected: {
    label: "Rejected",
    badgeBg:
      "bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800",
    badgeText: "text-red-700 dark:text-red-400",
    icon: <CircleX className="w-5 h-5 text-red-500 dark:text-red-400" />,
    iconBg: "bg-red-100 dark:bg-red-900/40",
    summaryLabel: "Rejected",
    summaryDesc: "Applications not approved",
  },
  cancelled: {
    label: "Cancelled",
    badgeBg: "bg-muted border border-border",
    badgeText: "text-muted-foreground",
    icon: <Ban className="w-5 h-5 text-muted-foreground" />,
    iconBg: "bg-muted",
    summaryLabel: "Cancelled",
    summaryDesc: "Applications cancelled",
  },
};

function summaryCounts(apps: Application[]) {
  return {
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    payment_pending: apps.filter((a) => a.status === "payment_pending").length,
    payment_verified: apps.filter((a) => a.status === "payment_verified")
      .length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    cancelled: apps.filter((a) => a.status === "cancelled").length,
  };
}

// ── Timeline ───────────────────────────────────────────────────────────────────

function TimelineDot({
  color,
}: {
  color: "amber" | "green" | "red" | "muted" | "primary" | "blue";
}) {
  const map = {
    amber: "border-amber-400 bg-amber-400",
    green: "border-green-500 bg-green-500",
    red: "border-red-400 bg-red-400",
    muted: "border-border bg-border",
    primary: "border-primary bg-primary",
    blue: "border-blue-400 bg-blue-400",
  };
  return (
    <div
      className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${map[color]}`}
    />
  );
}

function TimelineLine({
  color,
}: {
  color: "amber" | "green" | "red" | "muted" | "primary" | "blue";
}) {
  const map = {
    amber: "bg-amber-200 dark:bg-amber-800",
    green: "bg-green-300 dark:bg-green-700",
    red: "bg-red-200 dark:bg-red-800",
    muted: "bg-border",
    primary: "bg-primary/30",
    blue: "bg-blue-200 dark:bg-blue-800",
  };
  return <div className={`w-0.5 h-5 ml-[5px] flex-shrink-0 ${map[color]}`} />;
}

function OwnerMessage({
  message,
  tone,
}: {
  message: string;
  tone: "green" | "red" | "blue";
}) {
  const styles = {
    green:
      "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
  };
  return (
    <div
      className={`mt-3 flex items-start gap-1.5 rounded-lg border px-3 py-2 ${styles[tone]}`}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <p className="text-xs">
        <span className="font-semibold">Owner Message: </span>
        {message}
      </p>
    </div>
  );
}

function ApplicationTimeline({ app }: { app: Application }) {
  if (app.status === "cancelled") {
    return (
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <TimelineDot color="muted" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Application Cancelled
            </p>
            <p className="text-xs text-muted-foreground">
              {app.applicationDate}
            </p>
          </div>
        </div>
        <div className="ml-1.5 mt-2 text-xs text-muted-foreground">
          You cancelled this application.
        </div>
      </div>
    );
  }

  if (app.status === "pending") {
    return (
      <div className="flex flex-col min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="primary" />
            <TimelineLine color="amber" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">
              Application Submitted
            </p>
            <p className="text-xs text-muted-foreground">
              {app.applicationDate}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TimelineDot color="amber" />
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Waiting for Owner Review
            </p>
            <p className="text-xs text-muted-foreground">
              We will notify you once there is an update.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (app.status === "approved" || app.status === "payment_pending") {
    return (
      <div className="flex flex-col min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="green" />
            <TimelineLine color="green" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">
              Application Submitted
            </p>
            <p className="text-xs text-muted-foreground">
              {app.applicationDate}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="green" />
            <TimelineLine color="blue" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Approved
            </p>
            <p className="text-xs text-muted-foreground">{app.reviewDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TimelineDot color="blue" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Waiting for Payment
            </p>
            <p className="text-xs text-muted-foreground">
              Complete your payment to activate the membership.
            </p>
          </div>
        </div>
        {app.ownerMessage && (
          <OwnerMessage message={app.ownerMessage} tone="blue" />
        )}
      </div>
    );
  }

  if (app.status === "payment_verified") {
    return (
      <div className="flex flex-col min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="green" />
            <TimelineLine color="green" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">
              Application Submitted
            </p>
            <p className="text-xs text-muted-foreground">
              {app.applicationDate}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="green" />
            <TimelineLine color="green" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Approved
            </p>
            <p className="text-xs text-muted-foreground">{app.reviewDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <TimelineDot color="green" />
            <TimelineLine color="green" />
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Payment Verified
            </p>
            <p className="text-xs text-muted-foreground">{app.paymentDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TimelineDot color="green" />
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Membership Activated
            </p>
            <p className="text-xs text-muted-foreground">{app.paymentDate}</p>
          </div>
        </div>
        {app.ownerMessage && (
          <OwnerMessage message={app.ownerMessage} tone="green" />
        )}
      </div>
    );
  }

  // rejected
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center">
          <TimelineDot color="red" />
          <TimelineLine color="red" />
        </div>
        <div className="pb-1">
          <p className="text-sm font-medium text-foreground">
            Application Submitted
          </p>
          <p className="text-xs text-muted-foreground">{app.applicationDate}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <TimelineDot color="red" />
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Rejected
          </p>
          <p className="text-xs text-muted-foreground">{app.reviewDate}</p>
        </div>
      </div>
      {app.ownerMessage && (
        <OwnerMessage message={app.ownerMessage} tone="red" />
      )}
    </div>
  );
}

// ── Action Buttons ─────────────────────────────────────────────────────────────

function ApplicationActions({
  app,
  onCancel,
}: {
  app: Application;
  onCancel: (id: string) => void;
}) {
  if (app.status === "pending") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center text-primary border-primary hover:bg-primary/5"
          asChild
        >
          <Link href={`/applications/${app.id}`}>View Details</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              Cancel Application
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Application?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your membership application for{" "}
                <span className="font-semibold text-foreground">
                  {app.gymName}
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Application</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onCancel(app.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (app.status === "approved" || app.status === "payment_pending") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          asChild
        >
          <Link href={`/applications/${app.id}`} className="flex flex-row">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Make Payment
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          asChild
        >
          <Link href={`/applications/${app.id}`}>View Details</Link>
        </Button>
      </div>
    );
  }

  if (app.status === "payment_verified") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90"
          asChild
        >
          <Link href="/home" className="flex flex-row">
            Go to Gym
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          asChild
        >
          <Link href={`/applications/${app.id}`}>View Membership</Link>
        </Button>
      </div>
    );
  }

  if (app.status === "rejected") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90"
          asChild
        >
          <Link href={`/discover/${app.gymId}`}>Apply Again</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          asChild
        >
          <Link href={`/applications/${app.id}`}>View Details</Link>
        </Button>
      </div>
    );
  }

  // cancelled
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        size="sm"
        className="w-full bg-primary hover:bg-primary/90"
        asChild
      >
        <Link href={`/discover/${app.gymId}`}>Apply Again</Link>
      </Button>
    </div>
  );
}

// ── Application Card ───────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  onCancel,
}: {
  app: Application;
  onCancel: (id: string) => void;
}) {
  const router = useRouter();
  const meta = STATUS_META[app.status];

  return (
    // NOTE: this is a plain div + router.push, not a <Link>, on purpose.
    // ApplicationActions renders Links/Buttons internally — wrapping the
    // whole card in a <Link> nests <a> inside <a>, which is invalid HTML.
    // Browsers silently repair that nested-anchor markup after hydration,
    // which is what was causing the "shrinks then snaps to full width" glitch.
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/applications/${app.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/applications/${app.id}`);
      }}
      className="block group cursor-pointer"
    >
      <Card className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            {/* Left: Gym Info */}
            <div className="flex-1 min-w-0 p-5 lg:border-r border-border">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border">
                  <img
                    src={app.gymLogo}
                    alt={app.gymName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Name & details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground text-base leading-tight">
                      {app.gymName}
                    </h3>
                    {app.verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5">
                        <BadgeCheck className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {app.gymLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <ClipboardCheck className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Plan</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {app.membershipPlan}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <CreditCard className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Price</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {app.price}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Timer className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Duration
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {app.duration}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <CalendarDays className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Applied On
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {app.applicationDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Timeline */}
            <div
              className="w-full lg:w-80 flex-shrink-0 p-5 border-t lg:border-t-0 lg:border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <ApplicationTimeline app={app} />
            </div>

            {/* Right: Status + Actions */}
            <div
              className="w-full lg:w-52 flex-shrink-0 p-5 flex flex-col items-start gap-3 border-t lg:border-t-0 border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Status badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${meta.badgeBg}`}
              >
                <span className={`${meta.icon ? "w-4 h-4" : ""}`}>
                  {meta.icon}
                </span>
                <span className={`text-sm font-semibold ${meta.badgeText}`}>
                  {meta.label}
                </span>
              </div>

              {/* Action buttons */}
              <div className="w-full">
                <ApplicationActions app={app} onCancel={onCancel} />
              </div>
            </div>

            {/* Chevron — only shown on large screens where the row is a single horizontal band */}
            <div className="hidden lg:flex items-center px-3 text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Skeleton Cards ─────────────────────────────────────────────────────────────

function ApplicationSkeleton() {
  return (
    <Card className="rounded-2xl border border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-5 lg:border-r border-border space-y-3">
            <div className="flex gap-4">
              <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-80 p-5 border-t lg:border-t-0 lg:border-r border-border space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="w-full lg:w-52 p-5 border-t lg:border-t-0 border-border space-y-3">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Empty States ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  if (filter === "all") {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          No Applications Yet
        </h3>
        <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
          You haven&apos;t applied to any gyms yet. Discover gyms and submit
          your first membership application.
        </p>
        <Button className="bg-primary hover:bg-primary/90" asChild>
          <Link href="/discover">Discover Gyms</Link>
        </Button>
      </div>
    );
  }

  const labels: Record<string, string> = {
    pending: "No pending applications.",
    approved: "No approved applications yet.",
    payment_pending: "No applications awaiting payment.",
    payment_verified: "No active memberships yet.",
    rejected: "No rejected applications found.",
    cancelled: "No cancelled applications.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardCheck className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        {labels[filter] ?? "No applications found."}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>(MOCK_APPLICATIONS);
  const [devFilter, setDevFilter] = useState<"all" | AppStatus>("all");
  const [tabFilter, setTabFilter] = useState("all");
  const [loading] = useState(false);

  const counts = summaryCounts(applications);

  // Apply dev filter (replaces all statuses) then tab filter
  const devFiltered =
    devFilter === "all"
      ? applications
      : applications.map((a) => ({ ...a, status: devFilter as AppStatus }));

  const tabFiltered =
    tabFilter === "all"
      ? devFiltered
      : devFiltered.filter((a) => a.status === tabFilter);

  const totalCount = devFiltered.length;

  const tabCounts = summaryCounts(devFiltered);

  function handleCancel(id: string) {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "cancelled" as AppStatus } : a,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your gym membership requests and their approval status.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm self-start">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                <span className="text-primary">{totalCount}</span> Applications
              </p>
              <p className="text-xs text-muted-foreground">
                Total Applications
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {(
            [
              "pending",
              "payment_pending",
              "payment_verified",
              "rejected",
              "cancelled",
            ] as AppStatus[]
          ).map((status) => {
            const meta = STATUS_META[status];
            const count = tabCounts[status];
            return (
              <Card
                key={status}
                className="rounded-2xl border border-border bg-card shadow-sm cursor-pointer hover:border-primary/30 transition-all duration-200"
                onClick={() => setTabFilter(status)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {meta.summaryLabel}
                      </p>
                      <p className="text-2xl font-bold text-foreground leading-tight">
                        {count}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {meta.summaryDesc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-px -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {[
              {
                label: "All Applications",
                value: "all",
                count: totalCount,
                icon: <Building2 className="w-4 h-4" />,
              },
              {
                label: "Pending",
                value: "pending",
                count: tabCounts.pending,
                icon: <Clock3 className="w-4 h-4" />,
              },
              {
                label: "Payment Pending",
                value: "payment_pending",
                count: tabCounts.payment_pending,
                icon: <Wallet className="w-4 h-4" />,
              },
              {
                label: "Payment Verified",
                value: "payment_verified",
                count: tabCounts.payment_verified,
                icon: <ShieldCheck className="w-4 h-4" />,
              },
              {
                label: "Rejected",
                value: "rejected",
                count: tabCounts.rejected,
                icon: <CircleX className="w-4 h-4" />,
              },
              {
                label: "Cancelled",
                value: "cancelled",
                count: tabCounts.cancelled,
                icon: <Ban className="w-4 h-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTabFilter(tab.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-px ${
                  tabFilter === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      tabFilter === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Application Cards */}
        <div className="space-y-4">
          {loading ? (
            <>
              <ApplicationSkeleton />
              <ApplicationSkeleton />
              <ApplicationSkeleton />
            </>
          ) : tabFiltered.length === 0 ? (
            <EmptyState filter={tabFilter} />
          ) : (
            tabFiltered.map((app) => (
              <ApplicationCard key={app.id} app={app} onCancel={handleCancel} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
