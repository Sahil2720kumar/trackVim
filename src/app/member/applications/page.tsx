import { ApplicationsList } from "@/components/member/ApplicationsList";
import { getMyApplications } from "@/services/member.query";

export default async function ApplicationsPage() {
  const { success, data } = await getMyApplications();
  const applications = success && data ? data : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your gym membership requests and their approval status.
          </p>
        </div>
        <ApplicationsList applications={applications} />{" "}
      </div>
    </div>
  );
}
