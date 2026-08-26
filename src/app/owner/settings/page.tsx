import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Settings as SettingsIcon } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { getMyGymSettings } from "@/services/owner.query";
import { Button } from "@/components/ui/button";
import SettingsForm, {
  SETTINGS_FORM_ID,
} from "@/components/owner/SettingsForm";
import { bigSquareButton } from "@/lib/styles";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createServerClient();
  const gym = await getMyGymSettings(supabase, userId);

  // An owner account with no gym row means registration was never
  // finished — send them to finish it rather than rendering a settings
  // form with nothing to edit.
  if (!gym.success) {
    redirect("/onboarding/register-gym");
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <SettingsIcon className="w-6 h-6 text-primary shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  Settings
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your gym information, branding, business details, and GST
                settings.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-3">
            {/* Reset lives inside SettingsForm (mobile footer + desktop
                sidebar), where `reset`/`isDirty` are actually in scope.
                A header button in a server component has no way to call
                RHF's reset — that's what was broken before. */}
            <Button
              type="submit"
              form={SETTINGS_FORM_ID}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <main className="py-4">
        <SettingsForm gymId={gym.data.id as string} initialData={gym.data} />
      </main>
    </div>
  );
}
