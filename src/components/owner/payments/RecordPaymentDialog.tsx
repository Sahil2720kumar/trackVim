"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { recordWalkinPaymentAction } from "@/actions/owner.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const METHODS = ["Cash", "UPI", "Card", "Bank Transfer"] as const;
type Method = (typeof METHODS)[number];

export function RecordPaymentDialog({
  gymId,
  paymentId,
  amount,
  open,
  onOpenChange,
  onRecorded,
}: {
  gymId: string;
  paymentId: string | null;
  amount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded: (paymentId: string, method: Method) => void;
}) {
  const [method, setMethod] = useState<Method | "">("");
  const [transactionRef, setTransactionRef] = useState("");
  const [pending, startTransition] = useTransition();

  const requiresRef =
    method === "UPI" || method === "Card" || method === "Bank Transfer";

  function reset() {
    setMethod("");
    setTransactionRef("");
  }

  function handleSubmit() {
    if (!paymentId || !method || pending) return;
    if (requiresRef && !transactionRef.trim()) {
      toast.error("Enter a transaction reference for this method");
      return;
    }
    startTransition(async () => {
      const result = await recordWalkinPaymentAction({
        paymentId,
        gymId,
        method,
        transactionRef: transactionRef.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.error ?? "Couldn't record payment");
        return;
      }
      onRecorded(paymentId, method);
      onOpenChange(false);
      reset();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {amount
              ? `Confirm how the ₹${amount.toLocaleString()} payment was collected.`
              : "Confirm how this payment was collected."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Payment Method
            </label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as Method)}
            >
              <SelectTrigger
                className={cn(
                  "w-full px-3 py-2 rounded-lg border transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "border-border bg-background",
                  "hover:border-primary",
                  "focus:border-primary outline-none",
                )}
              >
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Transaction Reference{requiresRef ? "" : " (optional)"}
            </label>
            <input
              className={cn(
                "w-full px-3 py-2 rounded-lg border transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "border-border bg-background",
                "hover:border-primary",
                "focus:border-primary outline-none",
              )}
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder={"Transaction Ref No"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !method}>
            {pending ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
