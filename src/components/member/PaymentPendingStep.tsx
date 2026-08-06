// components/member/apply-steps/PaymentPendingStep.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BadgeIndianRupee, QrCode } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
} from "@/components/GymFormFields";
import { SingleImageUpload, useSingleUpload } from "@/components/ImageUpload"; // adjust path as needed
import { bigSquareButton } from "@/lib/styles";
import StatusBanner from "./StatusBanner";
import type { MembershipApplicationByPlanIdPageData } from "@/services/member.query";
import { submitPaymentAction } from "@/actions/member.action";
import { PaymentMethod } from "@/actions/staff.action";

// TODO: align these values with your actual `paymentMethodEnum` in the schema
const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "Cash", label: "Cash (pay at gym)" },
  { value: "Card", label: "Card" },
  { value: "BankTransfer", label: "Bank Transfer" },
] as const;

const paymentSchema = z
  .object({
    method: z.enum(["UPI", "Cash", "Card", "BankTransfer"], {
      required_error: "Select a payment method",
    }),
    transactionRef: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.method === "Cash" || !!data.transactionRef, {
    message: "Transaction / reference ID is required for this method",
    path: ["transactionRef"],
  });

type PaymentFormInput = z.infer<typeof paymentSchema>;

type Props = {
  gym: MembershipApplicationByPlanIdPageData["gym"] & {
    paymentQrUrl?: string; // TODO: add to MembershipApplicationByPlanIdPageData if you want QR shown
  };
  plan: MembershipApplicationByPlanIdPageData["plan"];
  gymMembershipId: string; // needed so the action can link payments.gymMembershipId
};

export default function PaymentPendingStep({
  gym,
  plan,
  gymMembershipId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const receipt = useSingleUpload();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "UPI" },
  });

  const method = watch("method");
  const totalDue = plan.price + plan.joiningFee;

  const onSubmit = (data: PaymentFormInput) => {
    if (isPending) return;

    if (data.method !== "Cash" && !receipt.file) {
      toast.error("Please upload a payment screenshot or receipt.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitPaymentAction(
          {
            gymMembershipId,
            gymId: gym.id,
            amount: totalDue,
            method: data.method as PaymentMethod,
            transactionRef: data.transactionRef,
            notes: data.notes,
          },
          { receipt: receipt.file },
        );

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("Payment submitted — awaiting verification.");
        router.refresh(); // re-run ApplyPage so status flips to PendingVerification view
      } catch (error) {
        console.error("Error submitting payment:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <>
      <StatusBanner variant="approved">
        You're approved at {gym.name}! Complete payment to activate your
        membership.
      </StatusBanner>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Payment Details" icon={BadgeIndianRupee}>
              <FormSelect
                label="Payment Method"
                options={PAYMENT_METHODS}
                required
                {...register("method")}
                error={errors.method}
              />

              {method === "UPI" && gym.paymentQrUrl && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border p-4">
                  <QrCode className="w-4 h-4 text-muted-foreground" />
                  <div className="relative h-40 w-40 bg-white">
                    <Image
                      src={gym.paymentQrUrl}
                      alt="Gym payment QR code"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan to pay {gym.name}, then upload proof below.
                  </p>
                </div>
              )}

              {method !== "Cash" && (
                <FormInput
                  label="Transaction / Reference ID"
                  placeholder="e.g., UPI ref number"
                  required
                  {...register("transactionRef")}
                  error={errors.transactionRef}
                />
              )}

              {method !== "Cash" && (
                <SingleImageUpload
                  label="Payment Screenshot / Receipt"
                  preview={receipt.preview}
                  error={receipt.error}
                  hint="PNG, JPG, JPEG up to 2 MB"
                  previewClass="h-40 w-40"
                  previewAlt="Payment receipt"
                  dropzone={receipt.dropzone}
                  onRemove={receipt.clear}
                  removeLabel="Remove Receipt"
                />
              )}

              {method === "Cash" && (
                <p className="text-xs text-muted-foreground">
                  Pay in person at the gym — the owner will mark this as
                  received once you've paid.
                </p>
              )}

              <FormTextarea
                label="Notes (Optional)"
                placeholder="Anything the gym owner should know about this payment"
                {...register("notes")}
              />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Amount Due" icon={BadgeIndianRupee}>
              <div className="space-y-2">
                <SummaryRow label="Plan Price" value={`₹${plan.price}`} />
                <SummaryRow label="Joining Fee" value={`₹${plan.joiningFee}`} />
                <SummaryRow
                  label="Total Due"
                  value={`₹${totalDue}`}
                  emphasize
                  border={false}
                />
              </div>
            </SectionCard>

            <Button
              type="submit"
              disabled={isPending}
              className={bigSquareButton}
            >
              {isPending ? "Submitting…" : "Submit Payment"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
