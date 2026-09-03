// components/ConfirmDialog.tsx
"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sync or async. Throw to signal failure (dialog stays open); resolve/return to close it. */
  onConfirm: () => Promise<void> | void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  /** "default" uses the primary color, "destructive" uses red — pick based on the action's severity */
  variant?: "default" | "destructive";
  /**
   * Shorthand for variant="destructive" / variant="default". If both
   * `destructive` and `variant` are passed, `destructive` wins.
   */
  destructive?: boolean;
}

/**
 * Reusable yes/no confirmation dialog. Use for any single-step confirmation
 * (approve, delete, activate, etc). Supports both sync and async onConfirm —
 * while an async onConfirm is pending, the dialog shows a spinner, disables
 * both buttons, and blocks closing until it settles. For actions that need
 * a text input before confirming, use PromptDialog instead.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
  variant = "default",
  destructive,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isDestructive = destructive ?? variant === "destructive";

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              isDestructive
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-primary hover:bg-primary/90",
            )}
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault(); // stop AlertDialog auto-closing before the async action resolves
              handleConfirm();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {confirmLabel}…
              </>
            ) : (
              <>
                {icon}
                {confirmLabel}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Convenience hook for the common "target row to delete" pattern —
 * holds which item is pending confirmation so you don't need local
 * open/target state wired up by hand at every call site.
 *
 * Usage:
 *   const dialog = useConfirmDialog<Row>();
 *   ...
 *   <ConfirmDialog
 *     open={dialog.isOpen}
 *     onOpenChange={(open) => !open && dialog.close()}
 *     onConfirm={() => deleteRow(dialog.target!.id)}
 *     ...
 *   />
 */
export function useConfirmDialog<T>() {
  const [target, setTarget] = useState<T | null>(null);

  return {
    target,
    isOpen: target !== null,
    request: (item: T) => setTarget(item),
    close: () => setTarget(null),
  };
}
