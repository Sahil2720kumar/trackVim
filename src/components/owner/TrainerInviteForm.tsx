"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserCircle,
  BriefcaseBusiness,
  CalendarClock,
  Mail,
  StickyNote,
  Loader2,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import { useSingleUpload } from "@/components/ImageUpload";
import ProfileImageUpload from "../ProfileImageUpload";
import SpecializationPicker from "../SpecializationPicker";
import { CreateTrainerInput, createTrainerSchema } from "@/db/validators";
import {
  DAYS,
  EMPLOYMENT_TYPE_OPTIONS,
  SESSION_TYPES,
} from "@/constants/profile-options";
import { inviteTrainerAction } from "@/actions/owner.action";
import { toast } from "sonner";

export default function TrainerInviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const photo = useSingleUpload(undefined, 2 * 1024 * 1024);

  // Not a trainers-table field — invite-flow behavior only, so it stays
  // outside react-hook-form / CreateTrainerInput.
  const [sendInvitation, setSendInvitation] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTrainerInput>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      fullName: "",
      joiningDate: new Date().toISOString().split("T")[0],
      acceptingNewMembers: true,
      
    },
    mode: "onBlur",
  });

  const specializations = watch("specializations") || [];
  const workingDays = watch("workingDays") || [];
  const sessionTypes = watch("sessionTypes") || [];

  const toggleListValue = (
    field: "specializations" | "workingDays" | "sessionTypes",
    value: string,
  ) => {
    const current = watch(field) || [];
    setValue(
      field,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
      { shouldDirty: true },
    );
  };

  const onSubmit = (data: CreateTrainerInput) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await inviteTrainerAction(
          data,
          sendInvitation,
          photo.file ?? undefined,
        );
        if (!result.success) {
          console.log(result.error);
          toast.error(result.error ?? "Failed to invite trainer.");
          return;
        }
  
        toast.success("Trainer invited successfully.");
        router.push("/owner/trainers");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

   
  return (
    <form
      onSubmit={handleSubmit(onSubmit, (e) =>
        console.log("Validation errors:", e),
      )}
      className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8"
    >
      <div className="flex-1 min-w-0 space-y-6">
        {/* ── 1. Personal Information ── */}
        <SectionCard title="Personal Information" icon={UserCircle}>
          <ProfileImageUpload
            image={photo.preview}
            maxSize={2}
            onChange={photo.selectFile}
          />
          {photo.error && (
            <p className="text-xs text-destructive" role="alert">
              {photo.error}
            </p>
          )}

          <FormInput
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            required
            {...register("fullName")}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="trainer@email.com"
              required
              {...register("invitedEmail")}
              error={errors.invitedEmail}
            />
            <FormInput
              label="Phone Number"
              placeholder="+91 98765 43210"
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
          </div>
        </SectionCard>

        {/* ── 2. Professional Details ── */}
        <SectionCard title="Professional Details" icon={BriefcaseBusiness}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Professional Title"
              placeholder="e.g. Strength Coach"
              required
              {...register("professionalTitle")}
              error={errors.professionalTitle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Joining Date"
              type="date"
              required
              {...register("joiningDate")}
              error={errors.joiningDate}
            />
            <FormInput
              label="Years of Experience"
              type="number"
              placeholder="5"
              {...register("experienceYears")}
              error={errors.experienceYears}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Qualification"
              placeholder="e.g. B.Sc. in Fitness Science"
              {...register("qualification")}
              error={errors.qualification}
            />
            <FormInput
              label="Certification"
              placeholder="e.g. ACE, ISSA, NASM"
              {...register("certification")}
              error={errors.certification}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Salary (₹)"
              type="number"
              placeholder="35000"
              required
              {...register("salary")}
              error={errors.salary}
            />
            <FormSelect
              label="Employment Type"
              options={EMPLOYMENT_TYPE_OPTIONS}
              required
              {...register("employmentType")}
              error={errors.employmentType}
            />
          </div>
        </SectionCard>

        {/* ── 3. Specializations ── */}
        <SectionCard title="Specializations" icon={BriefcaseBusiness}>
          <p className="text-xs text-muted-foreground -mt-2">
            Select the areas this trainer will coach members in.
          </p>
          <SpecializationPicker
            selected={specializations}
            onToggle={(value) => toggleListValue("specializations", value)}
          />
          {errors.specializations && (
            <p className="text-xs text-destructive">
              {errors.specializations.message}
            </p>
          )}
        </SectionCard>

        {/* ── 4. Working Schedule ── */}
        <SectionCard title="Working Schedule" icon={CalendarClock}>
          {/* Working Days */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Working Days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isSelected = workingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleListValue("workingDays", day)}
                    className={`h-9 w-9 rounded-lg font-medium text-sm transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border hover:border-primary/50"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {errors.workingDays && (
              <p className="text-xs text-destructive">
                {errors.workingDays.message}
              </p>
            )}
          </div>

          {/* Time + Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Start Time
              </label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="time"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.startTime
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-background hover:border-border/80 focus:border-primary"
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  {...register("startTime")}
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                End Time
              </label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="time"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    errors.endTime
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-background hover:border-border/80 focus:border-primary"
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  {...register("endTime")}
                />
              </div>
              {errors.endTime && (
                <p className="text-xs text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>

            <FormInput
              label="Max Members"
              type="number"
              placeholder="40"
              {...register("maxMembers")}
              error={errors.maxMembers}
            />
            <FormInput
              label="Max Sessions / Day"
              type="number"
              placeholder="8"
              {...register("maxSessionsPerDay")}
              error={errors.maxSessionsPerDay}
            />
          </div>

          {/* Session Types */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Session Types</p>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => {
                const isSelected = sessionTypes.includes(type);
                return (
                  <Badge
                    key={type}
                    variant="outline"
                    onClick={() => toggleListValue("sessionTypes", type)}
                    className={`h-8 rounded-full px-3 flex items-center gap-1.5 cursor-pointer select-none text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    )}
                    {type}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Accepting New Members toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-sm font-medium text-foreground">
                Accepting New Members
              </p>
              <p className="text-xs text-muted-foreground">
                Turn off if this trainer is at capacity and shouldn&apos;t
                appear as available to new members.
              </p>
            </div>
            <Switch
              checked={watch("acceptingNewMembers") ?? true}
              onCheckedChange={(val) =>
                setValue("acceptingNewMembers", val, { shouldDirty: true })
              }
              className="ml-4 shrink-0"
            />
          </div>
        </SectionCard>

        {/* ── 5. Invitation ── */}
        {/* ── 5. Invitation ── */}
        <SectionCard title="Send Invitation" icon={Mail}>
          <p className="text-sm text-muted-foreground -mt-2">
            An invitation email is sent to the trainer with a secure sign-up
            link. Once they create their account, their profile will be linked
            to this gym automatically — no manual steps required.
          </p>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-sm font-medium text-foreground">
                Send invitation email automatically
              </p>
              <p className="text-xs text-muted-foreground">
                The trainer will receive a secure registration link after their
                profile is created.
              </p>
            </div>
            <Switch
              checked={sendInvitation}
              onCheckedChange={setSendInvitation}
              className="ml-4 shrink-0"
            />
          </div>
        </SectionCard>

        {/* ── 6. Additional Notes ── */}
        <SectionCard title="Additional Notes" icon={StickyNote}>
          <FormTextarea
            label="Internal Notes (not visible to trainer)"
            placeholder="Add notes visible only to gym staff..."
            rows={4}
            {...register("additionalNotes")}
          />
        </SectionCard>

        {/* ── Submit ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className={bigSquareButton}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={bigSquareButton}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Invite…
              </>
            ) : (
              "Create Trainer & Send Invitation"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
