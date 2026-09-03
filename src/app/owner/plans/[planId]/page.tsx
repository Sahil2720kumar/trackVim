import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import PlanDetailsContent from "@/components/owner/PlanDetailsContent";

async function PlanDetailsGate({ planId }: { planId: string }) {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    gymId?: string;
  };
  if (!meta.gymId) notFound();

  return <PlanDetailsContent planId={planId} gymId={meta.gymId} />;
}

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const planId = (await params).planId;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <Suspense fallback={null}>
        <PlanDetailsGate planId={planId} />
      </Suspense>
    </div>
  );
}
