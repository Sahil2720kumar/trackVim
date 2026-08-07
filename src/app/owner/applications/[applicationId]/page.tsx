import { ApplicationDetails } from "@/components/owner/ApplicationDetails";
import { getApplicationById } from "@/services/owner.query";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const result = await getApplicationById(applicationId);

  if (!result.success || !result.data)
    throw new Error("Failed to fetch application details");

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
        <ApplicationDetails initialData={result.data} />
      </div>
    </div>
  );
}
