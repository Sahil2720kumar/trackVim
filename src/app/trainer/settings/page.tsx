"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import TrainerSettingsForm, {
  TRAINER_SETTINGS_FORM_ID,
  TrainerSettingsSkeleton,
} from "@/components/trainer/TrainerSettingsForm";
import { useMyTrainerProfile } from "@/hooks/queries/trainer.query";

export default function TrainerSettingsPage() {
  const { isPending, isError, error, data } = useMyTrainerProfile();

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
              disabled={isPending || isError || !data}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <main className="py-4">
        {isPending ? (
          <TrainerSettingsSkeleton />
        ) : isError || !data ? (
          <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card text-center px-4">
            <p className="text-sm text-destructive font-medium mb-1">
              Couldn&apos;t load trainer profile
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : (
          <TrainerSettingsForm
            initialData={data as Record<string, unknown>}
          />
        )}
      </main>
    </div>
  );
}
