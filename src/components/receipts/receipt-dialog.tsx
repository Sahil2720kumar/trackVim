"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import { usePaymentById } from "@/hooks/queries/owner.query";
import { PaymentHeaderActions } from "@/components/owner/payments/PaymentHeaderActions";
import { MembershipPaymentReceipt } from "./membership-payment-receipt";

export interface ReceiptDialogProps {
  paymentId: string | null;
  gymId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDialog({
  paymentId,
  gymId,
  open,
  onOpenChange,
}: ReceiptDialogProps) {
  const {
    data: payment,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePaymentById(paymentId && open ? paymentId : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
          <div>
            <DialogTitle className="text-lg font-bold text-foreground sm:text-xl">
              Payment Receipt
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official membership payment document and receipt actions.
            </p>
          </div>
          {!isLoading && !isError && payment && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <PaymentHeaderActions
                payment={payment}
                gym={payment.gym}
                member={payment.member}
                membership={payment.membership}
              />
            </div>
          )}
        </DialogHeader>

        <div className="py-2">
          {isLoading && (
            <div className="space-y-4 p-4">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {isError && (
            <div className="p-6 text-center space-y-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium text-destructive">
                Failed to load receipt:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                {isFetching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Retry Loading
              </Button>
            </div>
          )}

          {!isLoading && !isError && payment && (
            <div className="mt-2">
              <MembershipPaymentReceipt payment={payment} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

