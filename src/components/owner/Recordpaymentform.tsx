// components/owner/RecordPaymentForm.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
  Loader2,
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
import { renewMembershipAction } from "@/actions/owner.action";
import type { Membership, Plan } from "@/services/owner.query";
import { formatDateStr } from "@/lib/utils";

interface RenewMembershipFormProps {
  memberships: Membership[];
  plans: Plan[];
  ownerName?: string;
}

// ---------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------
const renewMembershipSchema = z.object({
  gymMembershipId: z.string().min(1, "Please select a member"),
  planId: z.string().min(1, "Please select a membership plan"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  transactionRef: z.string().optional(),
  collectedBy: z.string().optional(),
  notes: z.string().optional(),
});

type RenewMembershipFormData = z.infer<typeof renewMembershipSchema>;

const paymentMethods = [
  { value: "UPI", label: "UPI ₹" },
  { value: "Card", label: "Card 💳" },
  { value: "Net Banking", label: "Net Banking 🏦" },
  { value: "Cash", label: "Cash 💵" },
];

const paymentStatuses = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

export const RENEW_MEMBERSHIP_FORM_ID = "renew-membership-form";

export default function RenewMembershipForm({
  memberships,
  plans,
  ownerName,
}: RenewMembershipFormProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const [newMembershipId, setNewMembershipId] = useState<string | null>(null);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RenewMembershipFormData>({
    resolver: zodResolver(renewMembershipSchema),
    defaultValues: {
      gymMembershipId: "",
      planId: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "UPI",
      paymentStatus: "pending",
      transactionRef: "",
      collectedBy: ownerName ?? "",
      notes: "",
    },
  });

  const gymMembershipId = watch("gymMembershipId");
  const planId = watch("planId");
  const paymentDate = watch("paymentDate");
  const paymentMethod = watch("paymentMethod");
  const transactionRef = watch("transactionRef") || "";
  const notes = watch("notes") || "";

  const selectedMembership = useMemo(
    () => memberships.find((m) => m.id === gymMembershipId) || null,
    [memberships, gymMembershipId],
  );
  const selectedMember = selectedMembership?.members ?? null;

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === planId) || null,
    [plans, planId],
  );

  const filteredMemberships = useMemo(() => {
    if (!memberSearch) return [];
    const q = memberSearch.toLowerCase();
    return memberships.filter(
      (m) =>
        m.members?.full_name?.toLowerCase().includes(q) ||
        m.members?.member_code?.toLowerCase().includes(q) ||
        m.members?.contact_phone?.includes(memberSearch),
    );
  }, [memberships, memberSearch]);

  const filteredPlans = useMemo(() => {
    if (!planSearch) return [];
    return plans.filter((p) =>
      p.plan_name.toLowerCase().includes(planSearch.toLowerCase()),
    );
  }, [plans, planSearch]);

  // Renewals never re-charge a joining fee — renew_membership() hardcodes
  // joining_fee to 0 on the new row.
  const finalAmount = useMemo(() => {
    if (!selectedPlan) return 0;
    const price = Number(selectedPlan.plan_price);
    const discountValue = Number(selectedPlan.discount_value ?? 0);
    const discount =
      selectedPlan.discount_type === "Percentage"
        ? (price * discountValue) / 100
        : selectedPlan.discount_type === "Amount"
          ? discountValue
          : 0;
    return Math.round(Math.max(price - discount, 0));
  }, [selectedPlan]);

  const onSubmit = (formData: RenewMembershipFormData) => {
    if (isPending) return;
    if (!selectedMembership) {
      toast.error("Select a member before recording payment.");
      return;
    }

    const planIdToSend =
      selectedPlan && selectedPlan.id !== selectedMembership.plan_id
        ? selectedPlan.id
        : undefined;

    startTransition(async () => {
      const result = await renewMembershipAction(selectedMembership.id, {
        planId: planIdToSend,
        paymentStatus: formData.paymentStatus === "paid" ? "Paid" : "Pending",
        paymentMethod: formData.paymentMethod,
        transactionRef: formData.transactionRef || undefined,
        notes: formData.notes || undefined,
        paymentDate: formData.paymentDate,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to record payment.");
        return;
      }

      toast.success("Membership renewed successfully.");
      setNewMembershipId(result.data.membershipId);
      router.refresh();
      setShowDialog(true);
    });
  };

  return (
    <>
      <form
        id={RENEW_MEMBERSHIP_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Member Information */}
          <SectionCard title="Member Information" icon={UserRound}>
            <p className="text-sm text-muted-foreground -mt-2">
              Search and select a member with an active membership.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search member by name, phone number or member code..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {memberSearch && filteredMemberships.length > 0 && (
              <div className="space-y-2 border border-border rounded-lg max-h-48 overflow-y-auto">
                {filteredMemberships.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setValue("gymMembershipId", row.id, {
                        shouldValidate: true,
                      });
                      setValue("planId", row.plan_id, { shouldValidate: true });
                      setMemberSearch("");
                    }}
                    className="w-full text-left p-3 hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={row.members?.photo_url ?? undefined} />
                      <AvatarFallback>
                        {row.members?.full_name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{row.members?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.members?.member_code} •{" "}
                        {row.membership_plans?.plan_name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        row.status === "Expired" ? "destructive" : "secondary"
                      }
                      className="shrink-0"
                    >
                      {row.status}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedMember ? (
              <div className="p-4 rounded-xl bg-muted/50 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedMember.photo_url ?? undefined} />
                    <AvatarFallback>
                      {selectedMember.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold">
                        {selectedMember.full_name}
                      </h3>
                      {selectedMember.member_code && (
                        <Badge variant="outline">
                          {selectedMember.member_code}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          selectedMembership?.status === "Expired"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {selectedMembership?.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      {selectedMember.contact_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {selectedMember.contact_phone}
                        </div>
                      )}
                      {selectedMember.contact_email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {selectedMember.contact_email}
                        </div>
                      )}
                    </div>
                    {selectedMembership?.status === "Expired" &&
                      (() => {
                        const gracePeriodDays =
                          selectedMembership.membership_plans
                            ?.grace_period_days ?? 0;
                        const endDate = new Date(selectedMembership.end_date);
                        const graceDeadline = new Date(endDate);
                        graceDeadline.setDate(
                          graceDeadline.getDate() + gracePeriodDays,
                        );

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const withinGracePeriod = today <= graceDeadline;

                        const newStartDate = new Date(endDate);
                        if (withinGracePeriod) {
                          newStartDate.setDate(newStartDate.getDate() + 1);
                        } else {
                          newStartDate.setTime(today.getTime());
                        }

                        const formattedNewStart = formatDateStr(newStartDate);

                        return (
                          <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            This membership lapsed on{" "}
                            {selectedMembership.end_date}
                            {gracePeriodDays > 0 &&
                              ` (grace period: ${gracePeriodDays} days)`}
                            .{" "}
                            {withinGracePeriod
                              ? `Still within grace period — the new cycle will continue from ${formattedNewStart} with no gap.`
                              : `Grace period has ended — the new cycle will start from today (${formattedNewStart}).`}
                          </p>
                        );
                      })()}
                  </div>
                </div>
              </div>
            ) : (
              errors.gymMembershipId && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.gymMembershipId.message}</span>
                </div>
              )
            )}
          </SectionCard>

          {/* 2. Membership Plan */}
          <SectionCard title="Membership Plan" icon={Package}>
            <p className="text-sm text-muted-foreground -mt-2">
              Defaults to the member&apos;s current plan. Change it here to
              renew onto a different plan.
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
                    <p className="font-medium">{plan.plan_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.membership_duration} • ₹{plan.plan_price}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedPlan ? (
              <div className="p-4 rounded-xl bg-muted/50 border border-primary/20">
                <p className="text-sm font-semibold mb-3">Plan Details</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Membership Plan
                    </p>
                    <p className="font-medium">{selectedPlan.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Duration
                    </p>
                    <p className="font-medium">
                      {selectedPlan.membership_duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Plan Price
                    </p>
                    <p className="font-medium">₹{selectedPlan.plan_price}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Discount
                    </p>
                    <p className="font-medium">
                      {selectedPlan.discount_type === "Percentage"
                        ? `${selectedPlan.discount_value ?? 0}%`
                        : selectedPlan.discount_type === "Amount"
                          ? `₹${selectedPlan.discount_value ?? 0}`
                          : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">
                      Joining Fee
                    </p>
                    <p className="font-medium text-muted-foreground">
                      Waived (renewal)
                    </p>
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
              the selected plan.
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
                    disabled
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
                    {...register("paymentDate")}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment date is fixed to today.
                </p>
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
                disabled
                {...register("collectedBy")}
              />
              <p className="text-xs text-muted-foreground -mt-1">
                Recorded automatically as you, the logged-in owner.
              </p>
            </div>
          </SectionCard>

          {/* 4. Internal Notes */}
          <SectionCard title="Internal Notes" icon={StickyNote}>
            <p className="text-sm text-muted-foreground -mt-2">
              These notes are visible only to gym staff.
            </p>
            <FormTextarea
              label="Notes"
              placeholder="Add internal notes about this payment..."
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
                      value={selectedMember.full_name ?? "—"}
                    />
                    {selectedMember.member_code && (
                      <SummaryRow
                        label="Member Code"
                        value={selectedMember.member_code}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a member</p>
                )}

                <Separator />

                {selectedPlan ? (
                  <>
                    <SummaryRow
                      label="Membership Plan"
                      value={selectedPlan.plan_name}
                    />
                    <SummaryRow
                      label="Duration"
                      value={selectedPlan.membership_duration}
                    />
                    <SummaryRow
                      label="Plan Price"
                      value={`₹${selectedPlan.plan_price}`}
                    />
                    <SummaryRow
                      label="Joining Fee"
                      value="Waived"
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
                <Button
                  type="submit"
                  className={`w-full ${bigSquareButton}`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Renewing...
                    </>
                  ) : (
                    "Renew Membership"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className={`w-full ${bigSquareButton}`}
                  onClick={() => reset()}
                  disabled={isPending}
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
              Membership Renewed Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              The membership has been renewed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    New Membership ID:
                  </span>
                  <span className="font-medium">{newMembershipId ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">
                    {selectedMember?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{selectedPlan?.plan_name}</span>
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
              Renew Another
            </Button>
            <Button onClick={() => setShowDialog(false)} className="flex-1">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
