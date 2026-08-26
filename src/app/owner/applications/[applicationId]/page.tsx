import { Suspense } from "react";
import { ApplicationDetails } from "@/components/owner/ApplicationDetails";

async function ApplicationDetail({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Membership Application
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Review member application, verify payment, and activate membership.
          </p>
        </div>

        <ApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ApplicationDetail params={params} />
    </Suspense>
  );
}
