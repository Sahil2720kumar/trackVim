import { auth } from "@clerk/nextjs/server";
import { BillingOverview } from "@/components/owner/billing/BillingOverview";

async function GymBillingOverviewGate() {
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;

  if (!gymId) {
    return (
      <p className="text-muted-foreground">
        No gym associated with this account.
      </p>
    );
  }

  return <BillingOverview />;
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
            Billing
          </h1>
          <p className="text-muted-foreground text-sm">
            View your subscription, current invoice, and payment history.
          </p>
        </header>

        <GymBillingOverviewGate />
      </div>
    </div>
  );
}
