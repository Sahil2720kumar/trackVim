import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import { getMembersAndPlans } from "@/services/owner.query";
import RenewMembershipForm, {
  RENEW_MEMBERSHIP_FORM_ID,
} from "@/components/owner/Recordpaymentform";
import Link from "next/link";

export default async function CreateRenewMembershipPage() {
  const user = await currentUser();
  const ownerName = user?.fullName ?? user?.username ?? "";
  const { sessionClaims } = await auth();
  const gymId = (sessionClaims?.publicMetadata as { gymId?: string })?.gymId;

  if (!gymId) {
    throw new Error("No gym found for this user.");
  }

  const result = await getMembersAndPlans(gymId);

  if (!result.success) {
    return (
      <div className="px-4 py-8 max-w-[1400px] mx-auto">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load members and plans: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                Renew Membership
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Renew a membership for your gym members.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-3">
            <Button variant="outline" className={bigSquareButton} asChild>
              <Link href="/owner/members">Cancel</Link>
            </Button>
            <Button
              type="submit"
              form={RENEW_MEMBERSHIP_FORM_ID}
              className={bigSquareButton}
            >
              Renew Membership
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <RenewMembershipForm
          memberships={result.data.memberships}
          plans={result.data.plans}
          ownerName={ownerName}
        />
      </main>
    </div>
  );
}
