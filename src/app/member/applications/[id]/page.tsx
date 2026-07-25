"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  Crown,
  FileText,
  Mail,
  Phone,
  QrCode,
  Receipt,
  ShieldCheck,
  Upload,
  Wallet,
  XCircle,
  Ban,
  RefreshCw,
  MessageSquare,
  Headphones,
  Lock,
  Info,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus =
  | "pending_review"
  | "approved_awaiting_payment"
  | "payment_uploaded"
  | "payment_verified"
  | "rejected"
  | "cancelled";

interface GymData {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  hoursWeekend: string;
}

interface MembershipPlan {
  name: string;
  tier: string;
  duration: string;
  price: number;
  currency: string;
  period: string;
  benefits: string[];
}

interface OwnerData {
  name: string;
  role: string;
  avatar: string;
  upiId: string;
  qrCode: string;
  paymentMethod: string;
  note: string;
}

interface ApplicationData {
  id: string;
  status: AppStatus;
  applicationDate: string;
  applicationTime: string;
  approvedDate: string;
  approvedTime: string;
  reviewedBy: string;
  reviewMessage: string;
  paymentUploadedAt?: string;
  paymentVerifiedAt?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  cancelledDate?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const GYM: GymData = {
  id: "gym-1",
  name: "IronForge Fitness",
  logo: "/images/gym-logo.png",
  tagline: "Premium fitness facility since 2019",
  address: "123 Fitness Street, Downtown, Bangalore, Karnataka 560001",
  phone: "+91 98765 43210",
  email: "info@ironforge.com",
  hours: "Mon - Sat: 6:00 AM - 10:00 PM",
  hoursWeekend: "Sun: 7:00 AM - 9:00 PM",
};

const PLAN: MembershipPlan = {
  name: "Annual Gold",
  tier: "Best Value",
  duration: "12 Months Membership",
  price: 14999,
  currency: "₹",
  period: "year",
  benefits: [
    "Unlimited Gym Access",
    "Access to All Equipment",
    "Cardio & Strength Training",
    "Group Classes",
    "Personal Training (2 Sessions)",
    "Locker Access",
    "Steam Bath",
    "Nutrition Guidance",
    "Free Fitness Assessment",
    "Priority Support",
  ],
};

const OWNER: OwnerData = {
  name: "Rahul Sharma",
  role: "Owner · IronForge Fitness",
  avatar: "",
  upiId: "rahul@upi",
  qrCode: "/images/upi-qr.png",
  paymentMethod: "UPI Payment",
  note: `Thank you for your application!\n\nPlease make the payment using the QR code above and upload the receipt. Once verified, your membership will be activated and you can start your fitness journey with us.\n\nRahul Sharma\nOwner, IronForge Fitness`,
};

const APPLICATION: ApplicationData = {
  id: "APP-2026-000245",
  status: "approved_awaiting_payment",
  applicationDate: "20 Jul 2026",
  applicationTime: "10:30 AM",
  approvedDate: "22 Jul 2026",
  approvedTime: "02:45 PM",
  reviewedBy: "Rahul Sharma (Owner)",
  reviewMessage:
    "Application approved. Please proceed with payment to activate membership.",
  paymentUploadedAt: "23 Jul 2026 · 09:15 AM",
  paymentVerifiedAt: "23 Jul 2026 · 11:00 AM",
  rejectedDate: "22 Jul 2026",
  rejectionReason:
    "Membership capacity is currently full. Please try again in 2 weeks or contact us directly.",
  cancelledDate: "21 Jul 2026",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

function getStatusConfig(status: AppStatus) {
  const configs = {
    pending_review: {
      label: "Pending Review",
      color:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    approved_awaiting_payment: {
      label: "Approved · Awaiting Payment",
      color: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
    },
    payment_uploaded: {
      label: "Payment Uploaded",
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      dot: "bg-blue-500",
    },
    payment_verified: {
      label: "Active Member",
      color:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: "Rejected",
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
      dot: "bg-red-500",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground",
    },
  };
  return configs[status];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DevControls({
  status,
  onChange,
}: {
  status: AppStatus;
  onChange: (s: AppStatus) => void;
}) {
  const buttons: { label: string; value: AppStatus }[] = [
    { label: "Pending Review", value: "pending_review" },
    { label: "Approved Awaiting Payment", value: "approved_awaiting_payment" },
    { label: "Payment Uploaded", value: "payment_uploaded" },
    { label: "Payment Verified", value: "payment_verified" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2 flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Development Controls</span>
        </div>
        {buttons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => onChange(btn.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              status === btn.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50 hover:text-primary"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressTimeline({ status }: { status: AppStatus }) {
  const steps = [
    {
      key: "submitted",
      label: "Application Submitted",
      date: "20 Jul 2026",
      sub: null,
    },
    { key: "review", label: "Owner Review", date: "22 Jul 2026", sub: null },
    {
      key: "approved",
      label: "Application Approved",
      date: "22 Jul 2026",
      sub: null,
    },
    {
      key: "payment",
      label: "Payment Pending",
      date: null,
      sub: "Your Action",
    },
    {
      key: "verification",
      label: "Payment Verification",
      date: null,
      sub: "Pending",
    },
    {
      key: "activated",
      label: "Membership Activated",
      date: null,
      sub: "Pending",
    },
  ];

  const completedMap: Record<AppStatus, number> = {
    pending_review: 0,
    approved_awaiting_payment: 3,
    payment_uploaded: 4,
    payment_verified: 6,
    rejected: 2,
    cancelled: 0,
  };

  const activeMap: Record<AppStatus, number> = {
    pending_review: 1,
    approved_awaiting_payment: 3,
    payment_uploaded: 4,
    payment_verified: -1,
    rejected: -1,
    cancelled: -1,
  };

  const completed = completedMap[status];
  const active = activeMap[status];

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 md:justify-between md:overflow-visible scrollbar-hide">
          {steps.map((step, i) => {
            const isCompleted = i < completed;
            const isActive =
              i === active ||
              (status === "approved_awaiting_payment" && i === 3);
            const isFuture = !isCompleted && !isActive;
            const isLast = i === steps.length - 1;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center flex-shrink-0 w-[84px] sm:w-[96px] md:w-auto md:flex-1"
              >
                <div className="flex items-center w-full">
                  {/* Circle */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all z-10 ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary border-primary text-primary-foreground shadow-[0_0_0_4px] shadow-primary/20"
                          : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      status === "rejected" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Clock3 className="w-4 h-4" />
                      )
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 transition-all ${
                        i < completed - 1 || (isCompleted && i < completed)
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
                {/* Labels */}
                <div className="mt-2 text-center w-full px-1">
                  <p
                    className={`text-[11px] sm:text-xs font-medium leading-tight ${
                      isCompleted || isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.date && isCompleted ? (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {step.date}
                    </p>
                  ) : isActive && step.sub ? (
                    <p className="text-[10px] sm:text-xs font-semibold text-primary mt-0.5">
                      {step.sub}
                    </p>
                  ) : step.sub ? (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      {step.sub}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info alert */}
        {(status === "pending_review" ||
          status === "approved_awaiting_payment" ||
          status === "payment_uploaded") && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Application approval does not activate your membership. Your
              membership becomes active only after payment verification by the
              gym owner.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationSummary({ status }: { status: AppStatus }) {
  const statusConfig = getStatusConfig(status);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Application Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Gym row */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
            <div className="flex flex-col items-center justify-center w-full h-full bg-black">
              <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>
              <span className="text-[8px] font-bold text-white mt-1 tracking-widest">
                IRONFORGE
              </span>
              <span className="text-[6px] text-primary tracking-widest">
                FITNESS
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-foreground">{GYM.name}</h3>
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5 gap-1 py-0.5"
              >
                <BadgeCheck className="w-3 h-3" />
                Verified
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Downtown, Bangalore</span>
            </div>
            <div className="flex items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {GYM.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {GYM.email}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: <FileText className="w-4 h-4" />,
              label: "Application ID",
              value: APPLICATION.id,
            },
            {
              icon: <CalendarDays className="w-4 h-4" />,
              label: "Applied On",
              value: APPLICATION.applicationDate,
            },
            {
              icon: <BadgeCheck className="w-4 h-4" />,
              label: "Reviewed By",
              value: APPLICATION.reviewedBy,
            },
            {
              icon: (
                <div
                  className={`w-2 h-2 rounded-full mt-0.5 ${statusConfig.dot}`}
                />
              ),
              label: "Current Status",
              value: (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              ),
            },
            {
              icon: <CalendarDays className="w-4 h-4" />,
              label: "Approved On",
              value: APPLICATION.approvedDate,
            },
            {
              icon: <MessageSquare className="w-4 h-4" />,
              label: "Review Message",
              value: APPLICATION.reviewMessage,
            },
          ].map((item, i) => (
            <div key={i} className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </div>
              {typeof item.value === "string" ? (
                <p className="text-sm font-medium text-foreground break-words">
                  {item.value}
                </p>
              ) : (
                item.value
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MembershipPlanCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Selected Membership Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: plan info */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-lg">
                    {PLAN.name}
                  </span>
                  <Badge className="bg-amber-500 text-white text-xs">
                    {PLAN.tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{PLAN.duration}</span>
                </div>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {PLAN.currency}
                  {formatPrice(PLAN.price)}
                  <span className="text-base font-normal text-muted-foreground">
                    /{PLAN.period}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: benefits */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PLAN.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentSection({
  status,
  uploadedFile,
  onFileChange,
  onSubmit,
  copied,
  onCopy,
}: {
  status: AppStatus;
  uploadedFile: File | null;
  onFileChange: (f: File | null) => void;
  onSubmit: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (status === "pending_review") {
    return (
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <Alert>
            <Clock3 className="w-4 h-4" />
            <AlertDescription>
              <span className="font-semibold block mb-1">
                Application Under Review
              </span>
              Your application is currently under review. You&apos;ll receive
              payment instructions after the gym owner approves your
              application.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (status === "rejected") {
    return (
      <Card className="shadow-sm border-red-200 dark:border-red-900">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Application Rejected
              </p>
              <p className="text-sm text-muted-foreground">
                Your application was not approved
              </p>
            </div>
          </div>
          {APPLICATION.rejectionReason && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {APPLICATION.rejectionReason}
              </p>
            </div>
          )}
          <Button className="w-full" variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Contact Gym
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "cancelled") {
    return (
      <Card className="shadow-sm bg-muted/40">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Ban className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Application Cancelled
              </p>
              <p className="text-sm text-muted-foreground">
                You cancelled this application on {APPLICATION.cancelledDate}
              </p>
            </div>
          </div>
          <Button className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Apply Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "payment_verified") {
    return (
      <Card className="shadow-sm border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6 space-y-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <Badge className="bg-emerald-500 text-white mb-2">
                Active Member
              </Badge>
              <p className="font-bold text-xl text-foreground">
                Membership Activated!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment has been verified. Welcome to IronForge Fitness!
              </p>
            </div>
            {APPLICATION.paymentVerifiedAt && (
              <p className="text-xs text-muted-foreground">
                Verified on {APPLICATION.paymentVerifiedAt}
              </p>
            )}
          </div>
          <Button className="w-full" size="lg">
            Go to Gym Dashboard
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button className="w-full" variant="outline">
            View Membership
          </Button>
        </CardContent>
      </Card>
    );
  }

  // approved_awaiting_payment or payment_uploaded
  const isUploaded = status === "payment_uploaded";

  return (
    <div className="space-y-4">
      {/* Approval banner */}
      <Card className="shadow-sm border-primary/30 bg-primary/5">
        <CardContent className="pt-5 pb-5">
          <p className="font-bold text-base text-foreground">
            Membership Approved{" "}
            <span role="img" aria-label="celebration">
              🎉
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your application has been approved! Please complete your payment and
            upload the receipt for verification. Your membership will be
            activated after payment verification.
          </p>
        </CardContent>
      </Card>

      {/* Payment amount */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment Amount</p>
            <p className="text-3xl font-bold text-foreground">
              {PLAN.currency}
              {formatPrice(PLAN.price)}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Preferred Payment Method
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 rounded bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center">
                <Wallet className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {OWNER.paymentMethod}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code card */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5 space-y-4">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            Scan &amp; Pay
          </p>
          <div className="flex flex-col items-center gap-3">
            {/* Owner avatar */}
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
              RS
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{OWNER.name}</p>
              <p className="text-xs text-muted-foreground">{OWNER.role}</p>
              <p className="text-sm font-medium text-primary mt-0.5">
                {OWNER.upiId}
              </p>
            </div>
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl overflow-hidden border border-border bg-white">
              <Image
                src={OWNER.qrCode}
                alt="UPI QR Code"
                width={176}
                height={176}
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCopy}
            >
              <Copy className="w-3.5 h-3.5 mr-2" />
              {copied ? "Copied!" : "Copy UPI ID"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload receipt */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Upload Payment Receipt
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload clear screenshot or receipt
            </p>
          </div>

          {isUploaded ? (
            <Alert>
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                <span className="font-semibold block mb-0.5">
                  Payment Proof Submitted
                </span>
                Your payment proof has been submitted. The gym owner will verify
                your payment shortly. Your membership will become active once
                payment is approved.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {uploadedFile ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 px-2"
                    onClick={() => onFileChange(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all py-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium text-center px-4">
                    Click to upload or drag &amp; drop
                  </span>
                  <span className="text-xs">PNG, JPG, PDF (Max. 10MB)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 10 * 1024 * 1024) {
                    onFileChange(file);
                  }
                }}
              />
            </>
          )}

          {!isUploaded && (
            <Button
              className="w-full"
              disabled={!uploadedFile}
              onClick={onSubmit}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Submit Payment Proof
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center text-center">
            <Lock className="w-3 h-3 flex-shrink-0" />
            <span>Your payment details are secure and encrypted.</span>
          </div>

          {/* Important note */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary mb-0.5">
                  Important
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your membership will be activated only after payment
                  verification by the gym owner. You will receive a notification
                  once activated.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationTimeline({ status }: { status: AppStatus }) {
  type TimelineEvent = {
    icon: React.ReactNode;
    title: string;
    date: string;
    description: string;
    variant: "completed" | "current" | "pending";
    badge?: string;
    highlight?: boolean;
  };

  const events: TimelineEvent[] = [
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Application Submitted",
      date: "20 Jul 2026 · 10:30 AM",
      description:
        "You have successfully submitted your membership application.",
      variant: "completed",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Owner Review",
      date: "22 Jul 2026 · 11:15 AM",
      description: "Owner is reviewing your application details.",
      variant:
        status === "pending_review"
          ? "current"
          : [
                "approved_awaiting_payment",
                "payment_uploaded",
                "payment_verified",
              ].includes(status)
            ? "completed"
            : "pending",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Application Approved",
      date: "22 Jul 2026 · 02:45 PM",
      description:
        "Congratulations! Your application has been approved by the gym owner.",
      variant: [
        "approved_awaiting_payment",
        "payment_uploaded",
        "payment_verified",
      ].includes(status)
        ? "completed"
        : "pending",
      highlight: [
        "approved_awaiting_payment",
        "payment_uploaded",
        "payment_verified",
      ].includes(status),
    },
    {
      icon: <Clock3 className="w-4 h-4" />,
      title: "Payment Pending",
      date:
        status === "approved_awaiting_payment"
          ? "Current Step"
          : status === "payment_uploaded" || status === "payment_verified"
            ? "23 Jul 2026"
            : "",
      description:
        "Please complete the payment and upload receipt for verification.",
      variant:
        status === "approved_awaiting_payment"
          ? "current"
          : ["payment_uploaded", "payment_verified"].includes(status)
            ? "completed"
            : "pending",
      badge:
        status === "approved_awaiting_payment" ? "Current Step" : undefined,
    },
    {
      icon: <ShieldCheck className="w-4 h-4" />,
      title: "Payment Verification",
      date:
        status === "payment_verified"
          ? APPLICATION.paymentVerifiedAt || ""
          : "",
      description: "Your payment will be verified by the gym owner.",
      variant:
        status === "payment_uploaded"
          ? "current"
          : status === "payment_verified"
            ? "completed"
            : "pending",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      title: "Membership Activation",
      date:
        status === "payment_verified"
          ? APPLICATION.paymentVerifiedAt || ""
          : "",
      description:
        "Your membership will be activated after payment verification.",
      variant: status === "payment_verified" ? "completed" : "pending",
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, i) => {
            const isLast = i === events.length - 1;
            return (
              <div key={i} className="flex gap-3 sm:gap-4">
                {/* Timeline column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      event.variant === "completed"
                        ? "bg-primary border-primary text-primary-foreground"
                        : event.variant === "current"
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {event.variant === "pending" ? (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    ) : (
                      event.icon
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[1.5rem] ${
                        event.variant === "completed"
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
                {/* Content */}
                <div className={`pb-5 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p
                      className={`text-sm font-semibold ${event.variant === "pending" ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {event.title}
                    </p>
                    {event.badge && (
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30 text-xs py-0"
                      >
                        {event.badge}
                      </Badge>
                    )}
                  </div>
                  {event.date && (
                    <p
                      className={`text-xs mb-1 ${event.variant === "current" ? "text-primary font-medium" : "text-muted-foreground"}`}
                    >
                      {event.date}
                    </p>
                  )}
                  <p
                    className={`text-sm leading-relaxed ${
                      event.highlight
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded px-2 py-1"
                        : "text-muted-foreground"
                    }`}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function OwnerNotes() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Owner Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {OWNER.note}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function HelpCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" />
          Need Help?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Contact the gym for any assistance.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground">{GYM.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground">{GYM.email}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-foreground">{GYM.hours}</p>
              <p className="text-foreground">{GYM.hoursWeekend}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-2">
          <Phone className="w-4 h-4 mr-2" />
          Contact Gym
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplicationDetailsPage() {
  const [status, setStatus] = useState<AppStatus>("approved_awaiting_payment");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(OWNER.upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSubmitPayment() {
    setStatus("payment_uploaded");
  }

  return (
    <div className="min-h-screen bg-background">
      <DevControls status={status} onChange={setStatus} />

      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Back + header */}
        <div>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Application Details
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track your membership application and complete the remaining
                steps.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground">Application ID</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-sm font-mono font-semibold text-foreground">
                  {APPLICATION.id}
                </p>
                <button
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Copy application ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress timeline — full width */}
        <ProgressTimeline status={status} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-6">
            <ApplicationSummary status={status} />
            <MembershipPlanCard />
            <ApplicationTimeline status={status} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OwnerNotes />
              <HelpCard />
            </div>
          </div>

          {/* Right column — sticky on large screens only */}
          <div className="lg:sticky lg:top-[60px] space-y-4">
            <PaymentSection
              status={status}
              uploadedFile={uploadedFile}
              onFileChange={setUploadedFile}
              onSubmit={handleSubmitPayment}
              copied={copied}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
