"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Copy, Check, IndianRupee, FileText, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppStatus } from "@/types";
import { SingleImageUpload, useSingleUpload } from "@/components/ImageUpload";
import { submitPaymentAction } from "@/actions/member.action";

interface ReceiptInfo {
  url: string;
  uploadedAt?: string;
  amount?: number;
  method?: string;
  verifiedAt?: string;
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
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    file,
    preview,
    error: uploadError,
    clear,
    dropzone,
  } = useSingleUpload();

  const hasJoiningFee = joiningFee > 0;
  const planPortion = hasJoiningFee
    ? remainingAmount - joiningFee
    : remainingAmount;

  function handleCopy() {
    navigator.clipboard.writeText(owner.upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSubmit() {
    if (!gymMembershipId) return;
    setError(null);
    startTransition(async () => {
      const result = await submitPaymentAction(
        {
          gymMembershipId,
          gymId,
          amount: remainingAmount,
          method: "UPI",
          transactionRef: transactionRef || undefined,
          notes: notes || undefined,
        },
        { receipt: file },
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

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

  if (status === "payment_uploaded" || success) {
    // just-submitted in this session: we have the local preview, not a server URL yet
    const localReceipt: ReceiptInfo | null =
      success && preview
        ? { url: preview, amount: remainingAmount, method: "UPI" }
        : (receipt ?? null);

    return (
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <Check className="w-8 h-8 text-primary mx-auto" />
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

  if (status !== "approved_awaiting_payment") return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Complete Payment</CardTitle>
      </CardHeader>
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
          <div className="flex justify-center">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
              <Image
                src={owner.qrCode}
                alt="Payment QR"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {owner.upiId && (
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-sm font-mono text-foreground">
              {owner.upiId}
            </span>
            <button
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

        <div className="space-y-1.5">
          <Label htmlFor="txn-ref">Transaction Reference (optional)</Label>
          <Input
            id="txn-ref"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="UPI transaction ID"
          />
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="payment-notes">Notes (optional)</Label>
          <Textarea
            id="payment-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          className="w-full"
          disabled={!file || isPending || !gymMembershipId}
          onClick={handleSubmit}
        >
          {isPending ? "Submitting…" : "I've Paid — Submit for Verification"}
        </Button>
      </CardContent>
    </Card>
  );
}
