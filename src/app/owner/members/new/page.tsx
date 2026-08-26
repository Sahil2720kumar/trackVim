import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { bigSquareButton } from "@/lib/styles";
import { getTrainersAndPlans } from "@/services/owner.query";
import { auth } from "@clerk/nextjs/server";
import InviteMemberForm from "@/components/owner/InviteMemberForm";
import { createServerClient } from "@/lib/supabase/server";

export default async function AddNewMemberPage() {
  const { sessionClaims } = await auth();

  const gymId = sessionClaims?.publicMetadata?.gymId as string;

  if (!gymId) throw new Error("Gym ID not found");

  const supabase = await createServerClient();
  const { data: trainersAndPlans, error } = await getTrainersAndPlans(
    supabase,
    gymId,
  );
  const trainers = trainersAndPlans?.trainers || [];
  const plans = trainersAndPlans?.plans || [];

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className=" py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button> */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                Add New Member
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Register a new member to your gym.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <InviteMemberForm trainers={trainers} plans={plans} />
      </main>
    </div>
  );
}
