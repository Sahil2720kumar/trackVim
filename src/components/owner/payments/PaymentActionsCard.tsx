"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, Wallet } from "lucide-react";
import { verifyPaymentAction } from "@/actions/owner.action";
import { RecordPaymentDialog } from "@/components/owner/payments/RecordPaymentDialog";
import { toast } from "sonner";

export function PaymentActionsCard({
  paymentId,
  gymId,
  status,
  amount,
  isOwner,
}: {
  paymentId: string;
  gymId: string;
  status: string;
  amount: number;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [isVerifying, startVerifying] = useTransition();

  const handleVerify = () => {
    startVerifying(async () => {
      const result = await verifyPaymentAction({ paymentId, gymId });
      if (!result.success) {
        toast.error(result.error ?? "Couldn't verify payment");
        return;
      }
      router.refresh();
    });
  };

  const handleRecorded = () => {
    setRecordDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Payment Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "Pending" && (
            <Button
              className="w-full justify-start"
              size="sm"
              onClick={() => setRecordDialogOpen(true)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}

          {status === "PendingVerification" && isOwner && (
            <Button
              className="w-full justify-start"
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isVerifying ? "Verifying..." : "Verify Payment"}
            </Button>
          )}

          {status === "PendingVerification" && !isOwner && (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed p-3">
              Awaiting owner verification.
            </p>
          )}

          {(status === "Pending" || status === "PendingVerification") && (
            <Separator className="my-1" />
          )}
        </CardContent>
      </Card>

      <RecordPaymentDialog
        gymId={gymId}
        paymentId={paymentId}
        amount={amount}
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onRecorded={handleRecorded}
      />
    </>
  );
}
