"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  ClipboardCopy,
  FileDown,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuickActionsCard } from "@/components/trainer/TrainingSessionFields";
import { bigSquareButton } from "@/lib/styles";
import CreateSessionForm, {
  mapSessionForEditForm,
} from "@/components/trainer/CreateSessionForm";
import { useSessionWithExercises } from "@/hooks/queries/trainer.query";
import React from "react";

const EDIT_SESSION_FORM_ID = "edit-session-form";

const EDITING_TIPS: string[] = [
  "Place compound exercises first.",
  "Balance workout volume.",
  "Adjust weights to member ability.",
  "Track RPE consistently.",
  "Keep realistic rest intervals.",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTrainingSessionPage({ params }: PageProps) {
  const router = useRouter();
  const sessionId = React.use(params).id;

  const {
    data: sessionResult,
    isLoading,
    error: queryError,
  } = useSessionWithExercises(sessionId);

  const isReady = !isLoading && sessionResult?.success;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Edit Training Session
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update session details, assigned template, exercises, and workout
              settings.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button
              variant="outline"
              className={bigSquareButton}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={EDIT_SESSION_FORM_ID}
              className={bigSquareButton}
              disabled={!isReady}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading session…
          </div>
        ) : queryError || !sessionResult?.success ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Couldn&apos;t load this session. It may have been deleted, or you
              may not have access to it.
            </AlertDescription>
          </Alert>
        ) : (
          (() => {
            const { defaultValues, defaultExercises } = mapSessionForEditForm(
              sessionResult.data,
            );

            return (
              <CreateSessionForm
                mode="edit"
                formId={EDIT_SESSION_FORM_ID}
                sessionId={sessionId}
                tipsTitle="Editing Tips"
                tips={EDITING_TIPS}
                defaultValues={defaultValues}
                defaultExercises={defaultExercises}
                sidebarExtra={
                  <QuickActionsCard
                    actions={[
                      { icon: ClipboardCopy, label: "Duplicate Session" },
                      { icon: Bell, label: "Assign Homework" },
                      { icon: FileDown, label: "Export PDF" },
                    ]}
                    destructiveAction={{
                      icon: Trash2,
                      label: "Delete Session",
                    }}
                  />
                }
              />
            );
          })()
        )}
      </main>
    </div>
  );
}
