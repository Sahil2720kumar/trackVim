"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  BadgeCheck,
  MapPin,
  Users,
  UserCheck,
  Phone,
  Mail,
  CalendarDays,
  Crown,
  CircleCheckBig,
  ChevronLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  Lock,
  Loader2,
  Star,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Gym {
  id: string;
  name: string;
  logo: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  trainerCount: number;
  memberCount: string;
  yearsInBusiness: number;
  isVerified: boolean;
}

interface MembershipPlan {
  id: string;
  name: string;
  durationLabel: string;
  durationMonths: number;
  price: number;
  priceUnit: string;
  description: string;
  benefits: string[];
  icon: "crown" | "calendar" | "star";
}

interface Member {
  name: string;
  phone: string;
  email: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockGym: Gym = {
  id: "1",
  name: "IronForge Fitness",
  logo: "/images/gym-logo.png",
  city: "Bangalore",
  address: "123 Fitness Street, Downtown, Bangalore, Karnataka 560001",
  rating: 4.8,
  reviewCount: 326,
  trainerCount: 12,
  memberCount: "1,250+",
  yearsInBusiness: 5,
  isVerified: true,
};

const mockPlan: MembershipPlan = {
  id: "annual-gold",
  name: "Annual Gold",
  durationLabel: "12 Months Membership",
  durationMonths: 12,
  price: 14999,
  priceUnit: "/year",
  description:
    "The most complete plan for serious fitness enthusiasts. Enjoy all premium facilities and exclusive member benefits.",
  benefits: [
    "Unlimited Gym Access",
    "Group Classes",
    "Cardio Area Access",
    "Personal Training (2 Sessions)",
    "Strength Training Zone",
    "Free Fitness Assessment",
    "Locker Access",
    "Nutrition Guidance",
  ],
  icon: "crown",
};

const mockMember: Member = {
  name: "Rohit Sharma",
  phone: "+91 98765 43210",
  email: "rohit.sharma@example.com",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressStep({
  step,
  label,
  status,
}: {
  step: number;
  label: string;
  status: "done" | "active" | "upcoming";
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
          status === "done"
            ? "bg-primary/10 border-primary text-primary"
            : status === "active"
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-muted border-border text-muted-foreground"
        }`}
      >
        {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-xs font-medium ${
          status === "active"
            ? "text-primary"
            : status === "done"
              ? "text-primary"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="flex  gap-0 w-full ">
      <ProgressStep step={1} label="Choose Plan" status="done" />
      <div className="flex-1 h-0.5 bg-primary mt-[18px] mx-1" />
      <ProgressStep step={2} label="Review Application" status="active" />
      <div className="flex-1 h-0.5 bg-border mt-[18px] mx-1" />
      <ProgressStep step={3} label="Submitted" status="upcoming" />
    </div>
  );
}

function GymLogo({ name }: { name: string }) {
  return (
    <div className="w-16 h-16 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0 overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center p-1">
        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center mb-0.5">
          <Building2 className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[6px] font-bold text-white leading-tight uppercase tracking-wide">
          {name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
      </div>
    </div>
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────

function SuccessDialog({ open, gymName }: { open: boolean; gymName: string }) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex justify-center mb-4 mt-2">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <DialogHeader className="text-center items-center">
          <DialogTitle className="text-xl font-bold">
            Application Submitted Successfully
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your membership request has been sent to{" "}
            <span className="font-medium text-foreground">{gymName}</span>. The
            gym owner will review your application and contact you if additional
            information or payment is required.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Link href="/discover">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              View Applications
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" className="w-full">
              Discover More Gyms
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const gym = mockGym;
  const plan = mockPlan;
  const member = mockMember;

  const [emergencyContact, setEmergencyContact] = useState("+91 91234 56789");
  const [fitnessGoal, setFitnessGoal] = useState("muscle-gain");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [termOne, setTermOne] = useState(false);
  const [termTwo, setTermTwo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = termOne && termTwo && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsSubmitting(false);
    setIsSuccess(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* ── Progress ── */}
        <div className="border-b border-border bg-card/60 py-4 px-4">
          <ProgressBar />
        </div>

        {/* ── Back link + header ── */}
        <div>
          {/* <Link
            href={`/discover/${gym.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Gym Details
          </Link> */}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Review Membership Application
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Please review your application before sending it to the gym
                owner.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5 border border-border">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  Secure &amp; Safe
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  Your information is encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Gym Summary ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Gym Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <GymLogo name={gym.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">
                    {gym.name}
                  </h2>
                  {gym.isVerified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-primary border-primary/20 bg-primary/10"
                    >
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{gym.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({gym.reviewCount} Reviews)
                  </span>
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {gym.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {gym.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {gym.memberCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {gym.trainerCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Trainers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {gym.yearsInBusiness}+
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Years in Business
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Selected Membership Plan ── */}
        <Card className="shadow-sm border-primary/30 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-primary">
                Selected Membership Plan
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                <CircleCheckBig className="w-3 h-3" />
                Selected Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-start">
              {/* Plan icon */}
              <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-8 h-8 text-primary" />
              </div>

              {/* Plan info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground">
                  {plan.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{plan.durationLabel}</span>
                </div>
                <p className="text-xl font-bold text-foreground mt-2">
                  {formatINR(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {plan.priceUnit}
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="hidden md:block flex-1 min-w-0">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {plan.description}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {plan.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-1.5">
                      <CircleCheckBig className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Benefits on mobile */}
            <div className="md:hidden mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {plan.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-1.5">
                    <CircleCheckBig className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Member Information ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={member.name}
                    readOnly
                    className="pl-9 bg-muted text-foreground cursor-default"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Emergency Contact{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Phone (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={member.phone}
                    readOnly
                    className="pl-9 bg-muted text-foreground cursor-default"
                  />
                </div>
              </div>

              {/* Fitness Goal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Fitness Goal
                </label>
                <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                    <SelectItem value="general-fitness">
                      General Fitness
                    </SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="sports-performance">
                      Sports Performance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={member.email}
                    readOnly
                    className="pl-9 bg-muted text-foreground cursor-default"
                  />
                </div>
              </div>

              {/* Medical Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Medical Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <Textarea
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    maxLength={500}
                    placeholder="Mention any injuries, allergies or medical conditions..."
                    className="min-h-[80px] resize-none text-sm"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {medicalNotes.length}/500
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Message to Gym Owner ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Message to Gym Owner
              </CardTitle>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Write any additional information or message you'd like to share..."
                className="min-h-[100px] resize-none text-sm"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {message.length}/500
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Before You Submit ── */}
        <Alert className="border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0 mr-1">
            <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-semibold">
            Before You Submit
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm mt-2 space-y-1">
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Submitting this application does not activate your membership.
              </li>
              <li>Your request will be reviewed by the gym owner.</li>
              <li>
                The gym owner may contact you regarding payment, verification
                and membership activation.
              </li>
              <li>Your membership becomes active only after approval.</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* ── Terms ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Terms &amp; Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="term-one"
                checked={termOne}
                onCheckedChange={(v) => setTermOne(Boolean(v))}
                className="mt-0.5"
              />
              <label
                htmlFor="term-one"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                I confirm that the information provided above is correct.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="term-two"
                checked={termTwo}
                onCheckedChange={(v) => setTermTwo(Boolean(v))}
                className="mt-0.5"
              />
              <label
                htmlFor="term-two"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                I understand that submitting this application does not guarantee
                membership approval.
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sticky Footer ── */}
      <div className=" bg-background/95 backdrop-blur-sm border-t border-border">
        <div className=" px-4 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Link href={`/discover/${gym.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Gym Details
            </Button>
          </Link>

          <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Request Membership
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Your application will be sent to the gym owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Dialog ── */}
      <SuccessDialog open={isSuccess} gymName={gym.name} />
    </div>
  );
}
