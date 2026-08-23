import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { PaymentDetailsContent } from "@/components/owner/payments/PaymentDetailsContent";

async function PaymentDetailsGate({ paymentId }: { paymentId: string }) {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (!meta.gymId) notFound();

  return (
    <PaymentDetailsContent
      paymentId={paymentId}
      gymId={meta.gymId}
      isOwner={meta.role === "owner"}
    />
  );
}

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paymentId = (await params).id;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <Suspense fallback={null}>
        <PaymentDetailsGate paymentId={paymentId} />
      </Suspense>
    </div>
  );
}
