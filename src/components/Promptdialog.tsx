"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: ReactNode;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  /** "default" uses the primary color, "destructive" uses red — pick based on the action's severity */
  variant?: "default" | "destructive";
  /** Require non-empty text before the confirm button is enabled. Defaults to false (optional input). */
  required?: boolean;
}

/**
 * Reusable dialog that collects a short text value before confirming
 * (rejection reason, note, cancellation message, etc). For a plain
 * yes/no confirmation with no input, use ConfirmDialog instead.
 */
export function PromptDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  placeholder = "Type here...",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
  variant = "default",
  required = false,
}: PromptDialogProps) {
  const [value, setValue] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setValue("");
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    onConfirm(value);
    setValue("");
  };

  const isDisabled = required && value.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            disabled={isDisabled}
            className={cn(
              variant === "destructive" &&
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            )}
            variant={variant === "destructive" ? undefined : "default"}
            onClick={handleConfirm}
          >
            {icon}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
