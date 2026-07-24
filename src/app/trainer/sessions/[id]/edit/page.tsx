"use client";

import { Bell, ClipboardCopy, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateSessionForm, {
  MOCK_MEMBERS,
  MOCK_TEMPLATES,
} from "@/components/trainer/CreateSessionForm";
import {
  QuickActionsCard,
  createRowId,
} from "@/components/trainer/TrainingSessionFields";
import { bigSquareButton } from "@/lib/styles";

const EDIT_SESSION_FORM_ID = "edit-session-form";

const EDITING_TIPS: string[] = [
  "Place compound exercises first.",
  "Balance workout volume.",
  "Adjust weights to member ability.",
  "Track RPE consistently.",
  "Keep realistic rest intervals.",
];

// In a real app this would come from the session being edited (e.g. loaded
// by id from the API). Reuses the same mock members/templates as the
// Create Session form so both pages stay in sync.
const initialTemplate = MOCK_TEMPLATES.find((t) => t.id === "tpl-pull")!;
const initialMember = MOCK_MEMBERS[0];

const initialExercises = initialTemplate.exercises.map((exercise) => ({
  ...exercise,
  rowId: createRowId(),
}));

export default function EditTrainingSessionPage() {
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
            <Button variant="outline" className={bigSquareButton}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={EDIT_SESSION_FORM_ID}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <CreateSessionForm
          mode="edit"
          formId={EDIT_SESSION_FORM_ID}
          tipsTitle="Editing Tips"
          tips={EDITING_TIPS}
          defaultValues={{
            sessionName: "Pull Day – Strength Focus",
            templateId: initialTemplate.id,
            memberId: initialMember.id,
            sessionDate: "2026-07-22",
            startTime: "07:00 AM",
            endTime: "08:00 AM",
            sessionType: "Strength",
            location: "Main Floor",
          }}
          defaultExercises={initialExercises}
          sidebarExtra={
            <QuickActionsCard
              actions={[
                { icon: ClipboardCopy, label: "Duplicate Session" },
                { icon: Bell, label: "Assign Homework" },
                { icon: FileDown, label: "Export PDF" },
              ]}
              destructiveAction={{ icon: Trash2, label: "Delete Session" }}
            />
          }
        />
      </main>
    </div>
  );
}
