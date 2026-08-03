"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Upload,
  Trash2,
  Loader2,
  Camera,
} from "lucide-react";
import {
  FormInput,
  FormInputWithUnit,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import { STATE_OPTIONS } from "@/constants/gym-options";
import { useSingleUpload } from "@/components/ImageUpload";
import { inviteMemberFormSchema, InviteMemberFormInput } from "@/db/validators";
import { addMemberAction } from "@/actions/owner.action";
import { toast } from "sonner";
import {
  FITNESS_GOAL_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from "@/constants/profile-options";
import { Switch } from "../ui/switch";
import { PaymentMethod } from "@/actions/staff.action";

// Real trainer/plan rows from getTrainersAndPlans — see that file's select()
// for the exact columns fetched.
type TrainerOption = {
  id: string;
  full_name: string | null;
  professional_title: string | null;
};
type PlanOption = {
  id: string;
  plan_name: string;
  plan_price: number;
  joining_fee: number | null;
  discount_type: "Percentage" | "Amount" | null;
  discount_value: number | null;
  membership_duration: string;
  duration_months: number;
};

type InviteMemberFormProps = {
  trainers: TrainerOption[];
  plans: PlanOption[];
};

// What actually counts as a valid transaction ref differs by method — a
// UPI ID (sahil@oksbi) is NOT a transaction ref, it's just an address. The
// real reference is the 12-digit UTR/RRN UPI generates per transaction.
const TRANSACTION_REF_PLACEHOLDER: Record<
  "Cash" | "UPI" | "Card" | "Bank Transfer",
  string
> = {
  Cash: "e.g. CASH-2026-00125",
  UPI: "e.g. 419234567890",
  "Bank Transfer": "e.g. HDFC20260802123456",
  Card: "Reference number",
};

const TRANSACTION_REF_HELP: Record<
  "Cash" | "UPI" | "Card" | "Bank Transfer",
  string
> = {
  Cash: "Optional internal receipt number.",
  UPI: "The UPI transaction ref / UTR — not the UPI ID (e.g. not sahil@oksbi).",
  "Bank Transfer": "The UTR from the transfer, not the account number.",
  Card: "The NEFT/RTGS/IMPS or card processor reference number.",
};

export default function InviteMemberForm({
  trainers,
  plans,
}: InviteMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const photo = useSingleUpload(undefined, 5 * 1024 * 1024);

  // Invite-flow behavior only, not a members-table field.
  const [sendInvitation, setSendInvitation] = useState(true);
  // Also not a schema field — gym_memberships.status is set by the action
  // based on this flag, not submitted directly (see addMemberAction).
  const [markPaidNow, setMarkPaidNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [transactionRef, setTransactionRef] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InviteMemberFormInput>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
    },
    mode: "onBlur",
  });

  const selectedPlanId = watch("planId");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const durationMonths = selectedPlan?.duration_months ?? 0;
  const startDate = watch("startDate");
  const joiningFee = watch("joiningFee") || "0";
  const weight = watch("weightKg");
  const height = watch("heightCm");
  const trainerId = watch("trainerId");

  // Duration/end date/discount are all derived from the selected plan, not
  // free-entry form fields — this keeps planId + the joining-fee default
  // in sync whenever the plan changes. Joining fee stays editable after
  // that (front desk sometimes waives/adjusts it per member).
  const handlePlanChange = (planId: string) => {
    setValue("planId", planId, { shouldValidate: true });
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setValue("joiningFee", String(plan.joining_fee ?? 0), {
        shouldDirty: true,
      });
    }
  };

  const calculateBMI = () => {
    if (!weight || !height) return "";
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    return (w / (h * h)).toFixed(1);
  };

  const calculateTotalAmount = () => {
    if (!selectedPlan) return 0;
    return Number(selectedPlan.plan_price) * durationMonths;
  };

  // Percentage discounts scale with the total (price × duration); flat
  // "Amount" discounts don't — a ₹200-off plan is ₹200 off regardless of
  // how many months are billed.
  const calculateDiscountAmount = () => {
    if (!selectedPlan?.discount_value) return 0;
    const value = Number(selectedPlan.discount_value);
    if (selectedPlan.discount_type === "Percentage") {
      return (calculateTotalAmount() * value) / 100;
    }
    return value; // "Amount"
  };

  const calculateFinalAmount = () => {
    if (!selectedPlan) return "₹0";
    const total = calculateTotalAmount();
    const jf = parseFloat(joiningFee) || 0;
    const disc = calculateDiscountAmount();
    return `₹${(total + jf - disc).toFixed(2)}`;
  };

  const calculateEndDate = () => {
    if (!startDate || !durationMonths) return "";
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + durationMonths);
    return start.toISOString().split("T")[0];
  };

  const onSubmit = (data: InviteMemberFormInput) => {
    if (isPending) return;

    if (markPaidNow && paymentMethod !== "Cash" && !transactionRef.trim()) {
      toast.error(`A transaction reference is required for ${paymentMethod}.`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await addMemberAction(
          data,
          sendInvitation,
          markPaidNow,
          transactionRef.trim() || null,
          photo.file || null,
          paymentMethod,
        );
        if (!result.success) {
          console.log(result.error);
          toast.error(result.error ?? "Failed to add member.");
          return;
        }

        toast.success("Member added successfully.");
        router.push("/owner/members");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (e) =>
        console.log("Validation errors:", e),
      )}
      className="flex flex-col lg:flex-row gap-6 lg:gap-8"
    >
      {/* Left Column - Form */}
      <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
        {/* Member Information */}
        <SectionCard title="Member Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              placeholder="Rohan Sharma"
              required
              {...register("fullName")}
              error={errors.fullName}
            />
            <FormInput
              label="Phone Number"
              placeholder="98765 43210"
              required
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="rohan@gmail.com"
              {...register("invitedEmail")}
              error={errors.invitedEmail}
            />
            <FormInput
              label="Date of Birth"
              type="date"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Gender"
              options={["Male", "Female", "Other"]}
              {...register("gender")}
            />
            <FormInput
              label="Occupation"
              placeholder="Software Engineer"
              {...register("occupation")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Blood Group"
              options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]}
              {...register("bloodGroup")}
            />
            <FormInput
              label="Address"
              placeholder="Enter address"
              {...register("address")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="City"
              placeholder="Enter city name"
              {...register("city")}
            />
            <FormSelect
              label="State"
              options={STATE_OPTIONS}
              {...register("state")}
              error={errors.state}
            />
            <FormInput
              label="PIN Code"
              placeholder="Enter pin code"
              {...register("pinCode")}
            />
          </div>
        </SectionCard>

        {/* Membership Details */}
        <SectionCard title="Membership Details" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Membership Plan"
              options={plans.map((p) => p.plan_name)}
              required
              value={selectedPlan?.plan_name ?? ""}
              onChange={(e) => {
                const plan = plans.find((p) => p.plan_name === e.target.value);
                if (plan) handlePlanChange(plan.id);
              }}
              error={errors.planId}
            />
            <FormSelect
              label="Trainer"
              options={[
                "No Trainer Assigned",
                ...trainers.map((t) => t.full_name),
              ]}
              value={
                trainers.find((t) => t.id === trainerId)?.full_name ??
                "No Trainer Assigned"
              }
              onChange={(e) => {
                const trainer = trainers.find(
                  (t) => t.full_name === e.target.value,
                );
                setValue("trainerId", trainer?.id, { shouldDirty: true });
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              required
              {...register("startDate")}
              error={errors.startDate}
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Duration
              </label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground">
                {selectedPlan
                  ? `${selectedPlan.membership_duration}`
                  : "Select a plan"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="End Date"
              type="date"
              disabled
              value={calculateEndDate()}
            />
            <FormInput
              label="Joining Fee"
              type="number"
              placeholder="₹500"
              {...register("joiningFee")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Discount
              </label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  {selectedPlan?.discount_value
                    ? selectedPlan.discount_type === "Percentage"
                      ? `${selectedPlan.discount_value}% (₹${calculateDiscountAmount().toFixed(2)})`
                      : `₹${calculateDiscountAmount().toFixed(2)} flat`
                    : "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Set on the plan, not editable here.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Total Amount
              </label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  ₹{calculateTotalAmount()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Amount Paybale by Member
              </label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  {calculateFinalAmount()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-sm font-medium text-foreground">
                Payment collected now
              </p>
              <p className="text-xs text-muted-foreground">
                Since you're adding this member as the gym owner, turning this
                on records the payment and activates the membership immediately.
                Turn it off to leave the membership PaymentPending until you
                verify it later.
              </p>
            </div>
            <Switch
              checked={markPaidNow}
              onCheckedChange={setMarkPaidNow}
              className="ml-4 shrink-0"
            />
          </div>

          {markPaidNow && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Payment Method"
                options={["Cash", "UPI", "Card", "Bank Transfer"]}
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as typeof paymentMethod)
                }
              />
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  {paymentMethod === "Cash"
                    ? "Receipt Number"
                    : "Transaction Ref"}
                  {paymentMethod !== "Cash" && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={TRANSACTION_REF_PLACEHOLDER[paymentMethod]}
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  {TRANSACTION_REF_HELP[paymentMethod]}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Physical Information */}
        <SectionCard title="Physical Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInputWithUnit
              label="Height"
              unit="cm"
              type="number"
              placeholder="175"
              {...register("heightCm")}
            />
            <FormInputWithUnit
              label="Weight"
              unit="kg"
              type="number"
              placeholder="70"
              {...register("weightKg")}
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                BMI (Auto)
              </label>
              <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  {calculateBMI() || "—"}
                </span>
              </div>
            </div>
          </div>
          <FormSelect
            label="Fitness Goal"
            options={FITNESS_GOAL_OPTIONS}
            {...register("fitnessGoal")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Medical Conditions"
              placeholder="None"
              {...register("medicalConditions")}
            />
            <FormInput
              label="Allergies"
              placeholder="Peanuts"
              {...register("allergies")}
            />
          </div>
          <FormTextarea
            label="Notes"
            placeholder="Prefers morning sessions."
            {...register("physicalNotes")}
          />
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon={Phone}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Emergency Contact Name"
              placeholder="Neha Sharma"
              {...register("emergencyContactName")}
            />
            <FormSelect
              label="Relationship"
              options={RELATIONSHIP_OPTIONS}
              {...register("emergencyContactRelationship")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Phone Number"
              placeholder="91234 56789"
              {...register("emergencyContactPhone")}
            />
            <FormInput
              label="Address"
              placeholder="2218 Baker Street, London"
              {...register("emergencyContactAddress")}
            />
          </div>
        </SectionCard>

        {/* Invitation */}
        <SectionCard title="Send Invitation" icon={Mail}>
          <p className="text-sm text-muted-foreground -mt-2">
            An invitation email is sent to the member with a secure sign-up
            link, same as trainer invites. Requires an email address above.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-sm font-medium text-foreground">
                Send invitation email automatically
              </p>
              <p className="text-xs text-muted-foreground">
                The member will receive a secure registration link after their
                profile is created.
              </p>
            </div>
            <Switch
              checked={sendInvitation}
              onCheckedChange={setSendInvitation}
              className="ml-4 shrink-0"
            />
          </div>
        </SectionCard>

        {/* Additional Notes */}
        <SectionCard title="Additional Notes" icon={Mail}>
          <FormTextarea
            label="Notes"
            placeholder="Additional information about the member..."
            {...register("additionalNotes")}
          />
        </SectionCard>

        {/* Footer Actions */}
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className={bigSquareButton}
            onClick={() => router.back()}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={bigSquareButton}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Member…
              </>
            ) : (
              "Create Member"
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Upload Photo */}
          <SectionCard title="Upload Photo" icon={Camera}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) photo.selectFile(file);
              }}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/50"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) photo.selectFile(file);
                }}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                {photo.preview ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary/20"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Upload Member Photo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, JPEG (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
            {photo.error && (
              <p className="text-xs text-destructive" role="alert">
                {photo.error}
              </p>
            )}
          </SectionCard>

          {/* Membership Summary */}
          <SectionCard title="Membership Summary" icon={Calendar}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-right">
                  {selectedPlan?.plan_name ?? "Not selected"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {durationMonths || "—"} Months
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Joining Date</span>
                <span className="font-medium">
                  {startDate ? new Date(startDate).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-medium">
                  {calculateEndDate()
                    ? new Date(calculateEndDate()).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Trainer</span>
                <span className="font-medium text-right">
                  {trainers.find((t) => t.id === trainerId)?.full_name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Joining Fee</span>
                <span className="font-medium">₹{joiningFee}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Plan Amount</span>
                <span className="font-medium">₹{calculateTotalAmount()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-destructive">
                  -₹{calculateDiscountAmount().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-foreground font-semibold">
                  Final Amount
                </span>
                <span className="font-bold text-primary text-lg">
                  {calculateFinalAmount()}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Quick Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 space-y-3">
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">
                Quick Tips
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Email is required to send an invite.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Members can update their profile later.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Emergency contact is recommended.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Trainer can be assigned later.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Duration and discount follow the selected plan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
