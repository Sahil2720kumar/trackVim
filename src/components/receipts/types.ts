import type { PaymentDetailData } from "@/services/owner.query";

export type MembershipPaymentReceiptData = {
  receiptNumber: string;
  gym: {
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  member: {
    name: string;
    memberId?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  membership?: {
    planName: string;
    startDate?: string | null;
    endDate?: string | null;
    planPrice?: number;
    discount?: number;
    joiningFee?: number;
    finalAmount?: number;
  } | null;
  payment: {
    paymentDate: string | null;
    amount: number;
    discount?: number;
    method: string | null;
    transactionRef?: string | null;
    status: string; // Internal status (e.g. 'Verified', 'Pending')
    customerFacingStatus: string; // Customer facing status (e.g. 'PAID')
    collectedBy?: string | null;
    verifiedBy?: string | null;
  };
};

export function mapPaymentToReceiptData(
  payment: PaymentDetailData,
): MembershipPaymentReceiptData {
  const addressParts = [
    payment.gym.addressLine1,
    payment.gym.addressLine2,
    payment.gym.city,
    payment.gym.state,
    payment.gym.postalCode,
  ].filter(Boolean);

  const receiptNumber =
    payment.receiptId || `TVM-${payment.id.slice(0, 8).toUpperCase()}`;

  // Customer facing status wording: 'PAID' for verified payments
  const isPaid = payment.status === "Verified";
  const customerFacingStatus = isPaid ? "PAID" : payment.status;

  return {
    receiptNumber,
    gym: {
      name: payment.gym.name,
      logoUrl: payment.gym.logoUrl ?? null,
      address: addressParts.length > 0 ? addressParts.join(", ") : null,
      phone: payment.gym.contactPhone ?? null,
      email: payment.gym.contactEmail ?? null,
    },
    member: {
      name: payment.member.fullName ?? "Member",
      memberId: payment.member.memberCode ?? `ID-${payment.member.id.slice(0, 8)}`,
      phone: payment.member.contactPhone ?? null,
      email: payment.member.contactEmail ?? null,
    },
    membership: payment.membership
      ? {
          planName: payment.membership.plan?.planName ?? "Membership Plan",
          startDate: payment.membership.startDate,
          endDate: payment.membership.endDate,
          planPrice: payment.membership.planPrice,
          discount: payment.membership.discount,
          joiningFee: payment.membership.joiningFee,
          finalAmount: payment.membership.finalAmount,
        }
      : null,
    payment: {
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      discount: payment.membership?.discount ?? 0,
      method: payment.method,
      transactionRef: payment.transactionRef,
      status: payment.status,
      customerFacingStatus,
      collectedBy: payment.collectedByName,
      verifiedBy: payment.verifiedByName,
    },
  };
}
