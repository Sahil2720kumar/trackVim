import { auth } from "@clerk/nextjs/server";
import { getApplications } from "@/services/owner.query";
import { ApplicationsList } from "@/components/owner/ApplicationsList";

export default async function ApplicationsPage() {
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;

  if (!gymId) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 max-w-[1400px] mx-auto">
        <p className="text-muted-foreground">
          No gym associated with this account.
        </p>
      </div>
    );
  }

  const result = await getApplications(gymId);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 max-w-[1400px] mx-auto">
        <p className="text-destructive">
          Failed to load applications: {result.error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* Static header content — server-rendered, no state */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
            Membership Applications
          </h1>
          <p className="text-muted-foreground text-sm">
            Review and manage membership requests from members who want to join
            your gym.
          </p>
        </header>

        {/* Everything dynamic/interactive moves to the client component */}
        <ApplicationsList initialApplications={result.data} />
      </div>
    </div>
  );
}
