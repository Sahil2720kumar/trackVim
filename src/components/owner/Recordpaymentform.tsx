"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar,
  Search,
  AlertCircle,
  CheckCircle2,
  Copy,
  Phone,
  Mail,
  UserRound,
  Package,
  CreditCard,
  StickyNote,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";

// ---------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------
const recordPaymentSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  planId: z.string().min(1, "Please select a membership plan"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  transactionRef: z.string().optional(),
  collectedBy: z.string().optional(),
  notes: z.string().optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

// ---------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------
const mockMembers = [
  {
    id: "MBR-1024",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jul%2019%2C%202026%2C%2005_31_12%20PM-kRu2IsVwGdoIShaiTzIUk0XlfNjqrX.png",
    memberSince: "15 Jan 2026",
    dob: "12 May 1998",
    membershipStatus: "Active",
    currentPlan: "Premium Membership",
    isNewMember: false,
  },
  {
    id: "MBR-1025",
    name: "Priya Verma",
    email: "priya.verma@email.com",
    phone: "+91 91234 56789",
    avatar: "",
    memberSince: "20 Feb 2026",
    dob: "08 Mar 2000",
    membershipStatus: "Active",
    currentPlan: "Gold Plan",
    isNewMember: false,
  },
  {
    id: "MBR-1026",
    name: "Aman Das",
    email: "aman.das@email.com",
    phone: "+91 87654 32101",
    avatar: "",
    memberSince: "10 Jan 2026",
    dob: "25 Jul 1999",
    membershipStatus: "Active",
    currentPlan: "Silver Plan",
    isNewMember: true,
  },
];

const mockPlans = [
  {
    id: "PLAN-001",
    name: "Premium Membership",
    duration: "12 Months",
    category: "Premium",
    price: 2000,
    joiningFee: 500,
    discount: 10,
    startDate: "20 Jul 2026",
    expiryDate: "19 Jul 2027",
    nextDueDate: "20 Aug 2027",
    freezeAllowed: true,
    maxFreezeDays: 30,
    features: [
      "Unlimited Gym Access",
      "Workout Plan",
      "Diet Plan",
      "Locker Facility",
      "Steam Bath",
      "Personal Trainer",
      "Mobile App Access",
      "Nutrition Consultation",
    ],
  },
  {
    id: "PLAN-002",
    name: "Gold Plan",
    duration: "3 Months",
    category: "Premium",
    price: 1500,
    joiningFee: 300,
    discount: 5,
    startDate: "15 Jul 2026",
    expiryDate: "14 Oct 2026",
    nextDueDate: "15 Aug 2026",
    freezeAllowed: true,
    maxFreezeDays: 15,
    features: [
      "Unlimited Gym Access",
      "Workout Plan",
      "Locker Facility",
      "Basic Water Access",
    ],
  },
  {
    id: "PLAN-003",
    name: "Silver Plan",
    duration: "1 Month",
    category: "Standard",
    price: 999,
    joiningFee: 200,
    discount: 0,
    startDate: "10 Jul 2026",
    expiryDate: "09 Aug 2026",
    nextDueDate: "10 Aug 2026",
    freezeAllowed: false,
    maxFreezeDays: 0,
    features: [
      "Gym Access (1 Time/Day)",
      "Locker Facility",
      "Basic App Access",
    ],
  },
];

const paymentMethods = [
  { value: "upi", label: "UPI ₹" },
  { value: "card", label: "Card 💳" },
  { value: "netbanking", label: "Net Banking 🏦" },
  { value: "cash", label: "Cash 💵" },
];

const paymentStatuses = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

const defaultValues: RecordPaymentFormData = {
  memberId: "MBR-1024",
  planId: "PLAN-001",
  paymentDate: "",
  paymentMethod: "upi",
  paymentStatus: "paid",
  transactionRef: "UPI123456789012",
  collectedBy: "Sahil Kumar",
  notes: "Paid via Google Pay at reception.",
};

export const RECORD_PAYMENT_FORM_ID = "record-payment-form";

export default function RecordPaymentForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues,
  });

  const memberId = watch("memberId");
  const planId = watch("planId");
  const paymentDate = watch("paymentDate");
  const paymentMethod = watch("paymentMethod");
  const transactionRef = watch("transactionRef") || "";
  const collectedBy = watch("collectedBy") || "";
  const notes = watch("notes") || "";

  const selectedMember = useMemo(
    () => mockMembers.find((m) => m.id === memberId) || null,
    [memberId],
  );
  const selectedPlan = useMemo(
    () => mockPlans.find((p) => p.id === planId) || null,
    [planId],
  );

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.id.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone.includes(memberSearch),
    );
  }, [memberSearch]);

  const filteredPlans = useMemo(() => {
    if (!planSearch) return [];
    return mockPlans.filter((p) =>
      p.name.toLowerCase().includes(planSearch.toLowerCase()),
    );
  }, [planSearch]);

  // Joining fee only applies to new members
  const isNewMember = selectedMember?.isNewMember ?? false;
  const applicableJoiningFee =
    selectedPlan && isNewMember ? selectedPlan.joiningFee : 0;

  const finalAmount = selectedPlan
    ? Math.round(
        selectedPlan.price +
          applicableJoiningFee -
          (selectedPlan.price * selectedPlan.discount) / 100,
      )
    : 0;

  const onSubmit = (data: RecordPaymentFormData) => {
    console.log("Payment payload:", data, {
      finalAmount,
      joiningFeeCharged: applicableJoiningFee,
    });
    setShowDialog(true);
  };

  return (
    <>
      <form
        id={RECORD_PAYMENT_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Member Information */}
          <SectionCard title="Member Information" icon={UserRound}>
            <p className="text-sm text-muted-foreground -mt-2">
              Search and select a member.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search member by name, phone number or member ID..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {memberSearch && filteredMembers.length > 0 && (
              <div className="space-y-2 border border-border rounded-lg max-h-48 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setValue("memberId", member.id, {
                        shouldValidate: true,
                      });
                      setMemberSearch("");
                    }}
                    className="w-full text-left p-3 hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.id}
                      </p>
                    </div>
                    {member.isNewMember && (
                      <Badge variant="secondary" className="shrink-0">
                        New
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedMember ? (
              <div className="p-4 rounded-xl bg-muted/50 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback>
                      {selectedMember.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold">{selectedMember.name}</h3>
                      <Badge variant="outline">{selectedMember.id}</Badge>
                      <Badge variant="secondary">Active</Badge>
                      {selectedMember.isNewMember ? (
                        <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30">
                          New Member
                        </Badge>
                      ) : (
                        <Badge variant="outline">Existing Member</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {selectedMember.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {selectedMember.email}
                      </div>
                      <p className="text-muted-foreground">
                        Member Since: {selectedMember.memberSince}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              errors.memberId && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.memberId.message}</span>
                </div>
              )
            )}
          </SectionCard>

          {/* 2. Membership Plan */}
          <SectionCard title="Membership Plan" icon={Package}>
            <p className="text-sm text-muted-foreground -mt-2">
              Select the membership plan the member is paying for. Plan details
              will update automatically.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search membership plans..."
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {planSearch && filteredPlans.length > 0 && (
              <div className="space-y-2 border border-border rounded-lg max-h-48 overflow-y-auto">
                {filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setValue("planId", plan.id, { shouldValidate: true });
                      setPlanSearch("");
                    }}
                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                  >
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.duration} • ₹{plan.price}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedPlan ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-primary/20">
                  <p className="text-sm font-semibold mb-3">Plan Details</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Membership Plan
                      </p>
                      <p className="font-medium">{selectedPlan.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Category
                      </p>
                      <p className="font-medium">{selectedPlan.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Duration
                      </p>
                      <p className="font-medium">{selectedPlan.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Plan Price
                      </p>
                      <p className="font-medium">₹{selectedPlan.price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Joining Fee
                      </p>
                      {isNewMember ? (
                        <p className="font-medium">
                          ₹{selectedPlan.joiningFee}
                        </p>
                      ) : (
                        <p className="font-medium text-muted-foreground">
                          Waived (Existing Member)
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Discount
                      </p>
                      <p className="font-medium">{selectedPlan.discount}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Membership Start Date
                      </p>
                      <p className="font-medium">{selectedPlan.startDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Membership Expiry Date
                      </p>
                      <p className="font-medium">{selectedPlan.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Next Due Date
                      </p>
                      <p className="font-medium text-orange-500">
                        {selectedPlan.nextDueDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Membership Freeze
                      </p>
                      <p className="font-medium">
                        {selectedPlan.freezeAllowed ? "Allowed" : "Not Allowed"}
                      </p>
                    </div>
                    {selectedPlan.freezeAllowed && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">
                          Max Freeze Days
                        </p>
                        <p className="font-medium">
                          {selectedPlan.maxFreezeDays} Days
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">
                    Included Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlan.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              errors.planId && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.planId.message}</span>
                </div>
              )
            )}
          </SectionCard>

          {/* 3. Payment Information */}
          <SectionCard title="Payment Information" icon={CreditCard}>
            <p className="text-sm text-muted-foreground -mt-2">
              Enter payment details. Amount is calculated automatically based on
              the selected plan{isNewMember ? " and joining fee" : ""}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Final Payable Amount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={`₹ ${finalAmount}`}
                    readOnly
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    Auto calculated
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Payment Date <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-colors ${
                      errors.paymentDate
                        ? "border-destructive bg-destructive/5"
                        : "border-border bg-background hover:border-border/80 focus:border-primary"
                    } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                    {...register("paymentDate")}
                  />
                </div>
                {errors.paymentDate && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.paymentDate.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Payment Method"
                options={paymentMethods}
                required
                {...register("paymentMethod")}
                error={errors.paymentMethod}
              />
              <FormSelect
                label="Payment Status"
                options={paymentStatuses}
                required
                {...register("paymentStatus")}
                error={errors.paymentStatus}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Transaction Reference (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("transactionRef")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      navigator.clipboard?.writeText(transactionRef)
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <FormInput
                label="Collected By"
                readOnly
                className="bg-muted"
                {...register("collectedBy")}
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {isNewMember
                  ? "This is a new member, so the plan's joining fee has been added to the payable amount."
                  : "This is an existing member, so the joining fee has been waived. Only the plan price (minus discount) is payable."}
              </span>
            </div>
          </SectionCard>

          {/* 4. Internal Notes */}
          <SectionCard title="Internal Notes" icon={StickyNote}>
            <p className="text-sm text-muted-foreground -mt-2">
              These notes are visible only to gym staff.
            </p>
            <FormTextarea
              label="Notes"
              placeholder="Add internal notes about this membership plan..."
              maxLength={500}
              {...register("notes")}
            />
            <p className="text-xs text-muted-foreground text-right -mt-2">
              {notes.length} / 500
            </p>
          </SectionCard>
        </div>

        {/* Sticky Payment Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <SectionCard title="Payment Summary" icon={ClipboardList}>
              <p className="text-xs text-muted-foreground -mt-2">
                Review all payment information before recording the payment.
              </p>

              <div className="space-y-3 text-sm">
                {selectedMember ? (
                  <>
                    <SummaryRow
                      label="Member Name"
                      value={selectedMember.name}
                    />
                    <SummaryRow label="Member ID" value={selectedMember.id} />
                    <SummaryRow
                      label="Member Type"
                      value={isNewMember ? "New Member" : "Existing Member"}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a member</p>
                )}

                <Separator />

                {selectedPlan ? (
                  <>
                    <SummaryRow
                      label="Membership Plan"
                      value={selectedPlan.name}
                    />
                    <SummaryRow
                      label="Duration"
                      value={selectedPlan.duration}
                    />
                    <SummaryRow
                      label="Category"
                      value={selectedPlan.category}
                    />
                    <SummaryRow
                      label="Plan Price"
                      value={`₹${selectedPlan.price}`}
                    />
                    <SummaryRow
                      label="Joining Fee"
                      value={
                        isNewMember ? `₹${selectedPlan.joiningFee}` : "Waived"
                      }
                    />
                    <SummaryRow
                      label="Discount"
                      value={`${selectedPlan.discount}%`}
                      border={false}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a plan</p>
                )}

                <Separator />

                {paymentMethod && (
                  <SummaryRow
                    label="Payment Method"
                    value={
                      paymentMethods.find((m) => m.value === paymentMethod)
                        ?.label
                    }
                  />
                )}
                {paymentDate && (
                  <SummaryRow
                    label="Payment Date"
                    value={paymentDate}
                    border={false}
                  />
                )}

                <Separator />

                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Amount to Record
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{finalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button type="submit" className={`w-full ${bigSquareButton}`}>
                  Record Payment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full ${bigSquareButton}`}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`w-full ${bigSquareButton}`}
                  onClick={() => reset(defaultValues)}
                >
                  Cancel
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">
              Payment Recorded Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              The payment has been recorded and a receipt has been generated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt Number:</span>
                  <span className="font-medium">RCPT-10241</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">{selectedMember?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Fee:</span>
                  <span className="font-medium">
                    {isNewMember ? `₹${selectedPlan?.joiningFee}` : "Waived"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    ₹{finalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">
                    {
                      paymentMethods.find((m) => m.value === paymentMethod)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{paymentDate}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Record Another Payment
            </Button>
            <Button onClick={() => setShowDialog(false)} className="flex-1">
              View Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
