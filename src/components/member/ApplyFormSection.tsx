"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import {
  CheckCircle2,
  Info,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { submitMembershipApplicationAction } from "@/actions/member.action"; // adjust to wherever you put it
import { toast } from "sonner";

interface Member {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface MemberFormValues {
  emergencyContact: string;
  fitnessGoal: string;
  medicalNotes: string;
  message: string;
  termOne: boolean;
  termTwo: boolean;
}

interface ApplyFormSectionProps {
  member: Member;
  gymId: string;
  planId: string;
  gymName: string;
}

const FITNESS_GOALS = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "muscle-gain", label: "Muscle Gain" },
  { value: "general-fitness", label: "General Fitness" },
  { value: "strength", label: "Strength" },
  { value: "sports-performance", label: "Sports Performance" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  gymName,
  onOpenChange,
}: {
  open: boolean;
  gymName: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex justify-center mb-4 mt-2">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <DialogHeader className="text-center items-center">
          <DialogTitle className="text-xl font-bold">
            Application Submitted Successfully
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your membership request has been sent to{" "}
            <span className="font-medium text-foreground">{gymName}</span>. The
            gym owner will review your application and contact you if additional
            information or payment is required.
          </DialogDescription>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/member/applications">View Applications</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/member/discover">Discover More Gyms</Link>
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function ApplyFormSection({
  member,
  gymId,
  planId,
  gymName,
}: ApplyFormSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    defaultValues: {
      emergencyContact: member.phone ?? "",
      fitnessGoal: "",
      medicalNotes: "",
      message: "",
      termOne: false,
      termTwo: false,
    },
  });

  const medicalNotes = watch("medicalNotes") ?? "";
  const message = watch("message") ?? "";
  const termOne = watch("termOne");
  const termTwo = watch("termTwo");

  const canSubmit = termOne && termTwo && !isSubmitting;

  async function onSubmit(data: MemberFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await submitMembershipApplicationAction({
        gymId,
        planId,
        message: data.message || undefined,
        emergencyContactPhone: data.emergencyContact || undefined,
        fitnessGoal: data.fitnessGoal || undefined,
        medicalNotes: data.medicalNotes || undefined,
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setIsSuccess(true);
      toast.success("Application submitted successfully");
    } catch {
      setSubmitError("Could not submit the application. Try again.");
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Member Information */}
        <SectionCard title="Member Information" icon={Info}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              value={member.name ?? ""}
              readOnly
              className="bg-muted cursor-default"
            />
            <FormInput
              label="Emergency Contact"
              placeholder="+91 00000 00000"
              {...register("emergencyContact")}
              error={errors.emergencyContact?.message}
            />
            <FormInput
              label="Phone Number"
              value={member.phone ?? ""}
              readOnly
              className="bg-muted cursor-default"
            />
            <Controller
              name="fitnessGoal"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Fitness Goal"
                  options={FITNESS_GOALS}
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    field.onChange(e.target.value)
                  }
                />
              )}
            />
            <FormInput
              label="Email Address"
              value={member.email ?? ""}
              readOnly
              className="bg-muted cursor-default"
            />
            <div>
              <FormTextarea
                label="Medical Notes"
                placeholder="Mention any injuries, allergies or medical conditions..."
                maxLength={500}
                {...register("medicalNotes")}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {medicalNotes.length}/500
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Message to Gym Owner */}
        <SectionCard
          title="Message to Gym Owner"
          description="Optional"
          icon={Info}
        >
          <FormTextarea
            label=""
            placeholder="Write any additional information or message you'd like to share..."
            maxLength={500}
            {...register("message")}
          />
          <p className="text-xs text-muted-foreground text-right -mt-2">
            {message.length}/500
          </p>
        </SectionCard>

        {/* Before You Submit */}
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10 p-4 sm:p-5 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              Before You Submit
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside">
              <li>
                Submitting this application does not activate your membership.
              </li>
              <li>Your request will be reviewed by the gym owner.</li>
              <li>
                The gym owner may contact you regarding payment, verification
                and membership activation.
              </li>
              <li>Your membership becomes active only after approval.</li>
            </ul>
          </div>
        </div>

        {/* Terms & Confirmation */}
        <SectionCard title="Terms & Confirmation" icon={Info}>
          <div className="flex items-start gap-3">
            <Controller
              name="termOne"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="term-one"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                  className="mt-0.5"
                />
              )}
            />
            <label
              htmlFor="term-one"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I confirm that the information provided above is correct.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Controller
              name="termTwo"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="term-two"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                  className="mt-0.5"
                />
              )}
            />
            <label
              htmlFor="term-two"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I understand that submitting this application does not guarantee
              membership approval.
            </label>
          </div>
        </SectionCard>

        {/* Error */}
        {submitError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Request Membership
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <SuccessDialog
        open={isSuccess}
        gymName={gymName}
        onOpenChange={setIsSuccess}
      />
    </>
  );
}
