// src/components/owner/import/ImportProgressModal.tsx
"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ImportProgressModalProps {
  isOpen: boolean;
  processedCount: number;
  totalCount: number;
  currentStage?: "validating" | "members" | "memberships" | "payments" | "qrcodes" | "invitations" | "complete";
  entityType?: "member" | "trainer";
  trainerCurrentStage?: "validating" | "processed" | "records" | "invitations" | "complete";
}

export function ImportProgressModal({
  isOpen,
  processedCount,
  totalCount,
  currentStage = "validating",
  entityType = "member",
  trainerCurrentStage = "validating",
}: ImportProgressModalProps) {
  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((processedCount / (totalCount || 1)) * 100));

  const memberStages = [
    { id: "validating", label: "File validated" },
    { id: "members", label: "Members processed" },
    { id: "memberships", label: "Memberships created" },
    { id: "payments", label: "Payments processing" },
    { id: "qrcodes", label: "QR cards generated" },
    { id: "invitations", label: "Invitations prepared" },
  ];

  const trainerStages = [
    { id: "validating", label: "File validated" },
    { id: "processed", label: "Trainers processed" },
    { id: "records", label: "Creating trainer records" },
    { id: "invitations", label: "Sending invitations" },
    { id: "complete", label: "Finalizing import" },
  ];

  const stages = entityType === "trainer" ? trainerStages : memberStages;

  const getStageStatus = (stageId: string) => {
    if (entityType === "trainer") {
      const order = ["validating", "processed", "records", "invitations", "complete"];
      const currentIndex = order.indexOf(trainerCurrentStage);
      const stageIndex = order.indexOf(stageId);

      if (stageIndex < currentIndex) return "completed";
      if (stageIndex === currentIndex) return "active";
      return "pending";
    }

    const order = ["validating", "members", "memberships", "payments", "qrcodes", "invitations", "complete"];
    const currentIndex = order.indexOf(currentStage);
    const stageIndex = order.indexOf(stageId);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border shadow-2xl bg-card">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {entityType === "trainer" ? "Importing your trainers..." : "Importing your members..."}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {entityType === "trainer"
                ? "Please wait while TrackVim safely migrates your trainers into the database."
                : "Please wait while TrackVim safely migrates your members into the database."}
            </p>
          </div>

          {/* Progress Counter & Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Progress</span>
              <span className="font-mono text-foreground">
                {processedCount.toLocaleString()} / {totalCount.toLocaleString()} ({percentage}%)
              </span>
            </div>
            <Progress value={percentage} className="h-3 rounded-full bg-muted" />
          </div>

          {/* Stages Checklist */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            {stages.map((stage) => {
              const status = getStageStatus(stage.id);

              return (
                <div key={stage.id} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    {status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {status === "active" && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    )}
                    {status === "pending" && (
                      <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}

                    <span
                      className={
                        status === "completed"
                          ? "font-medium text-foreground"
                          : status === "active"
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {stage.label}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {status === "completed" ? "Done" : status === "active" ? "Processing..." : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-muted-foreground italic pt-2">
            Do not refresh or close this browser window while import is in progress.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
