"use client";

import { Eye } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase/client";
import { getMyTrainerProfile } from "@/services/trainer.query";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import TrainerSettingsForm, {
  TRAINER_SETTINGS_FORM_ID,
} from "@/components/trainer/TrainerSettingsForm";
import { useTrainerStore } from "@/stores/trainer-store";
import { useMyTrainerProfile } from "@/hooks/queries/trainer.query";

export default function TrainerSettingsPage() {
  const activeTrainerId = useTrainerStore((state) => state.activeTrainerId);

  const profile = useMyTrainerProfile();

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-6">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Trainer Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your public trainer profile and professional information
              that members will see.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button variant="outline" className={`gap-2 ${bigSquareButton}`}>
              <Eye className="w-4 h-4" />
              Preview Public Profile
            </Button>
            <Button
              type="submit"
              form={TRAINER_SETTINGS_FORM_ID}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <main className="py-4">
        <TrainerSettingsForm
          trainerId={activeTrainerId!}
          initialData={profile.data as Record<string, unknown>}
        />
      </main>
    </div>
  );
}
