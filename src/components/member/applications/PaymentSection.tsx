"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Copy,
  Check,
  IndianRupee,
  FileText,
  BadgeCheck,
  Maximize2,
  Download,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppStatus } from "@/types";
import { SingleImageUpload, useSingleUpload } from "@/components/ImageUpload";
import { submitPaymentAction } from "@/actions/member.action";
import { FormInput, FormTextarea } from "@/components/GymFormFields";

interface ReceiptInfo {
  url: string;
  uploadedAt?: string;
  amount?: number;
  method?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface PaymentSectionProps {
  owner: {
    name: string;
    role: string;
    upiId: string;
    qrCode: string;
    paymentMethod: string;
  };
  status: AppStatus;
  plan: { name: string; price: number; currency: string };
  gymId: string;
  gymMembershipId: string | null;
  pendingPaymentId: string | null;
  remainingAmount: number;
  joiningFee?: number;
  receipt?: ReceiptInfo | null;
}

const paymentFormSchema = z.object({
  transactionRef: z.string().min(1, "Transaction reference is required"),
  notes: z.string().optional(),
});

type PaymentFormInput = z.infer<typeof paymentFormSchema>;

// Statuses where the member should see the "pay now" form.
const PAYABLE_STATUSES: AppStatus[] = [
  "approved_awaiting_payment",
  "payment_pending",
  "payment_rejected",
];

function ReceiptPreview({
  receipt,
  currency,
}: {
  receipt: ReceiptInfo;
  currency: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative w-full h-56 rounded-lg overflow-hidden border border-border bg-muted/20">
        <Image
          src={receipt.url}
          alt="Uploaded payment receipt"
          fill
          className="object-contain"
        />
      </div>
      <div className="rounded-lg border border-border divide-y divide-border overflow-hidden text-sm">
        {receipt.amount != null && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium text-foreground">
              {currency}
              {receipt.amount.toLocaleString("en-IN")}
            </span>
          </div>
        )}
        {receipt.method && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium text-foreground">
              {receipt.method}
            </span>
          </div>
        )}
        {receipt.uploadedAt && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-muted-foreground">Uploaded</span>
            <span className="font-medium text-foreground">
              {receipt.uploadedAt}
            </span>
          </div>
        )}
        {receipt.verifiedAt && (
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Verified
            </span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {receipt.verifiedAt}
            </span>
          </div>
        )}
        {receipt.rejectedAt && (
          <div className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-950/30">
            <span className="text-red-700 dark:text-red-400 font-medium">
              Rejected
            </span>
            <span className="font-medium text-red-700 dark:text-red-400">
              {receipt.rejectedAt}
            </span>
          </div>
        )}
      </div>
      <a
        href={receipt.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
      >
        <FileText className="w-3.5 h-3.5" />
        View full receipt
      </a>
    </div>
  );
}

export function PaymentSection({
  owner,
  status,
  plan,
  gymId,
  gymMembershipId,
  remainingAmount,
  joiningFee = 0,
  receipt,
}: PaymentSectionProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [qrZoomOpen, setQrZoomOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    file,
    preview,
    error: uploadError,
    clear,
    dropzone,
  } = useSingleUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { transactionRef: "", notes: "" },
  });

  const hasJoiningFee = joiningFee > 0;
  const planPortion = hasJoiningFee
    ? remainingAmount - joiningFee
    : remainingAmount;

  function handleCopy() {
    navigator.clipboard.writeText(owner.upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadQr() {
    if (!owner.qrCode) return;
    setIsDownloading(true);
    try {
      const res = await fetch(owner.qrCode);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${owner.name.replace(/\s+/g, "-").toLowerCase()}-payment-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading QR:", err);
      window.open(owner.qrCode, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  const onSubmit = (data: PaymentFormInput) => {
    if (!gymMembershipId) return;
    setError(null);

    if (!file) {
      setError("Please upload a payment screenshot.");
      return;
    }

    startTransition(async () => {
      const result = await submitPaymentAction(
        {
          gymMembershipId,
          gymId,
          amount: remainingAmount,
          method: "UPI",
          transactionRef: data.transactionRef || undefined,
          notes: data.notes || undefined,
        },
        { receipt: file },
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  };

  if (status === "payment_verified") {
    return (
      <Card className="shadow-sm border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <BadgeCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-foreground">Membership Active</p>
            <p className="text-sm text-muted-foreground">
              Your payment has been verified.
            </p>
          </div>
          {receipt && (
            <ReceiptPreview receipt={receipt} currency={plan.currency} />
          )}
        </CardContent>
      </Card>
    );
  }

  // Just-submitted this session, or the server says a payment is awaiting
  // owner review. Rejection resets this — a resubmission after rejection
  // should go straight back to this "waiting" state, not stay on the form.
  if (
    (status === "payment_uploaded" || success) &&
    status !== "payment_rejected"
  ) {
    const localReceipt: ReceiptInfo | null =
      success && preview
        ? { url: preview, amount: remainingAmount, method: "UPI" }
        : (receipt ?? null);

    return (
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <BadgeCheck className="w-8 h-8 text-primary mx-auto" />
            <p className="font-semibold text-foreground">Payment Submitted</p>
            <p className="text-sm text-muted-foreground">
              Waiting for the owner to verify your payment.
            </p>
          </div>
          {localReceipt && (
            <ReceiptPreview receipt={localReceipt} currency={plan.currency} />
          )}
        </CardContent>
      </Card>
    );
  }

  if (!PAYABLE_STATUSES.includes(status)) return null;

  const isRejectedFlow = status === "payment_rejected" && !success;

  return (
    <div className="space-y-4">
      {isRejectedFlow && (
        <Card className="shadow-sm border-red-200 dark:border-red-800">
          <CardContent className="pt-6 space-y-3">
            <div className="text-center space-y-1">
              <XCircle className="w-8 h-8 text-red-600 mx-auto" />
              <p className="font-semibold text-foreground">Payment Rejected</p>
              <p className="text-sm text-muted-foreground">
                {`The gym owner rejected this payment. Please review and submit a new one below.${
                  receipt?.rejectionReason
                    ? ` Reason: ${receipt.rejectionReason}`
                    : ""
                }`}
              </p>
            </div>
            {receipt && (
              <ReceiptPreview receipt={receipt} currency={plan.currency} />
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isRejectedFlow ? "Resubmit Payment" : "Complete Payment"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {hasJoiningFee ? (
              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Plan Price</span>
                  <span className="font-medium text-foreground">
                    {plan.currency}
                    {planPortion.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Joining Fee</span>
                  <span className="font-medium text-foreground">
                    {plan.currency}
                    {joiningFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 text-sm bg-muted/30">
                  <span className="font-semibold text-foreground">
                    Amount Remaining
                  </span>
                  <span className="flex items-center gap-0.5 font-bold text-foreground">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {remainingAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                <span className="text-sm text-muted-foreground">
                  Amount Remaining
                </span>
                <span className="flex items-center gap-0.5 font-bold text-foreground">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {owner.qrCode && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border group">
                  <Image
                    src={owner.qrCode}
                    alt="Payment QR"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setQrZoomOpen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                    aria-label="Zoom QR code"
                  >
                    <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQrZoomOpen(true)}
                    className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Zoom
                  </button>
                  <span className="text-muted-foreground/40">·</span>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    disabled={isDownloading}
                    className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    {isDownloading ? "Downloading…" : "Download"}
                  </button>
                </div>
              </div>
            )}

            {owner.upiId && (
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm font-mono text-foreground">
                  {owner.upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            <FormInput
              label="Transaction Reference *"
              placeholder="UPI transaction ID"
              {...register("transactionRef")}
              error={errors.transactionRef}
            />

            <SingleImageUpload
              label="Payment Screenshot"
              preview={preview}
              error={uploadError}
              hint="PNG or JPG, up to 2MB"
              previewClass="h-40 w-full"
              previewAlt="Payment receipt"
              dropzone={dropzone}
              onRemove={clear}
              removeLabel="Remove"
            />

            <FormTextarea
              label="Notes (optional)"
              {...register("notes")}
              error={errors.notes}
              rows={2}
            />

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !gymMembershipId}
            >
              {isPending
                ? "Submitting…"
                : isRejectedFlow
                  ? "Resubmit for Verification"
                  : "I've Paid — Submit for Verification"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Dialog open={qrZoomOpen} onOpenChange={setQrZoomOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>
              Scan to pay {owner.name}, then upload your receipt below.
            </DialogDescription>
          </DialogHeader>

          {owner.qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-72 w-72 bg-white rounded-md overflow-hidden border border-border">
                <Image
                  src={owner.qrCode}
                  alt="Payment QR"
                  fill
                  className="object-contain"
                />
              </div>

              <Button
                type="button"
                onClick={handleDownloadQr}
                disabled={isDownloading}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Downloading…" : "Download QR"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
