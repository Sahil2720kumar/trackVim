"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bigSquareButton } from "@/lib/styles";
import CreateTemplateForm, {
  TEMPLATE_FORM_ID,
} from "@/components/trainer/CreateTemplateForm";
import { useWorkoutTemplateById } from "@/hooks/queries/trainer.query";

function formatRestLabel(seconds: number): string {
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds} sec`;
}

export function mapTemplateRowToEditForm(row: any) {
  const sortedTE = [...(row.template_exercises ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
  );

  const initialExercises = sortedTE.map((te: any) => ({
    rowId: te.id, // existing DB row id — stable key, unlike createRowId()
    id: te.exercise_id,
    name: te.exercise?.name ?? "Unknown exercise",
    muscle_group: te.exercise?.muscle_group,
    equipment: te.exercise?.equipment ?? "—",
    sets: te.sets,
    reps: te.reps,
    weight: te.weight || "—",
    rest: te.rest_seconds ? formatRestLabel(te.rest_seconds) : "60 sec",
  }));

  const initialValues = {
    name: row.name,
    type: row.workout_type ?? row.category ?? "",
    goal: row.primary_goal ?? "",
    difficulty: row.difficulty_level ?? "",
    duration: row.duration_minutes ?? 0,
    muscleGroups: row.target_muscles ?? [],
    description: row.description ?? "",
    // No column backs this — see equipment/restBetweenSets flag above.
    // Defaulting rather than inventing storage.
    restBetweenSets: "60 sec",
    equipment: [] as string[],
    notes: row.additional_notes ?? "",
  };

  const meta = {
    id: row.id,
    status: row.status,
    createdBy: row.trainers?.full_name ?? "Unknown trainer",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return { initialValues, initialExercises, meta };
}

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const templateId = params?.id ?? null;
  console.log("templateId", templateId);
  const { data: result, isLoading, error } = useWorkoutTemplateById(templateId);
  console.log("result", result);
  const loadError = error
    ? "Failed to load template. Please try again."
    : result && !result.success
      ? result.error
      : undefined;

  const mapped = result?.success ? mapTemplateRowToEditForm(result.data) : null;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Edit Template
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update the workout template, exercises, and training
              configuration.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/trainer/templates">
              <Button
                type="button"
                variant="outline"
                className={bigSquareButton}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              form={TEMPLATE_FORM_ID}
              className={bigSquareButton}
              disabled={isLoading || !!loadError}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && loadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{loadError}</AlertDescription>
          </Alert>
        )}

        {!isLoading && mapped && (
          <CreateTemplateForm
            mode="edit"
            initialValues={mapped.initialValues}
            initialExercises={mapped.initialExercises}
            meta={mapped.meta}
          />
        )}
      </main>
    </div>
  );
}
