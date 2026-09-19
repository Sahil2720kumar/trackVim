"use client";

import { useMemo } from "react";
import type { PaymentDetailData } from "@/services/owner.query";
import {
  type MembershipPaymentReceiptData,
  mapPaymentToReceiptData,
} from "./types";
import { ReceiptHeader } from "./receipt-header";
import { ReceiptMeta } from "./receipt-meta";
import { ReceiptBillTo } from "./receipt-bill-to";
import { ReceiptMembership } from "./receipt-membership";
import { ReceiptAmountTable } from "./receipt-amount-table";
import { ReceiptPaymentDetails } from "./receipt-payment-details";
import { ReceiptFooter } from "./receipt-footer";

export interface MembershipPaymentReceiptProps {
  data?: MembershipPaymentReceiptData;
  payment?: PaymentDetailData;
  className?: string;
}

export function MembershipPaymentReceipt({
  data: propsData,
  payment,
  className = "",
}: MembershipPaymentReceiptProps) {
  const receiptData = useMemo(() => {
    if (propsData) return propsData;
    if (payment) return mapPaymentToReceiptData(payment);
    return null;
  }, [propsData, payment]);

  if (!receiptData) return null;

  return (
    <div
      id="trackvim-payment-receipt"
      className={`receipt-document bg-card text-card-foreground rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm font-sans ${className}`}
    >
      <ReceiptHeader gym={receiptData.gym} />

      <ReceiptMeta
        receiptNumber={receiptData.receiptNumber}
        paymentDate={receiptData.payment.paymentDate}
        customerFacingStatus={receiptData.payment.customerFacingStatus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
        <ReceiptBillTo member={receiptData.member} />
        {receiptData.membership && (
          <ReceiptMembership membership={receiptData.membership} />
        )}
      </div>

      <ReceiptAmountTable
        membership={receiptData.membership}
        payment={receiptData.payment}
      />

      <ReceiptPaymentDetails payment={receiptData.payment} />

      <ReceiptFooter gymName={receiptData.gym.name} />

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #trackvim-payment-receipt,
          #trackvim-payment-receipt * {
            visibility: visible !important;
          }
          #trackvim-payment-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
