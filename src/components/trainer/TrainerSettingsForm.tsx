"use client";

import * as React from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  Clock,
  Globe,
  Users,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Dumbbell,
  Languages as LanguagesIcon,
  Star,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Eye,
  Users as UsersIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";

import { useSingleUpload } from "@/components/ImageUpload";

import {
  DAYS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SESSION_TYPES,
  STATE_OPTIONS,
} from "@/constants/profile-options";
import { CreateTrainerInput, createTrainerSchema } from "@/db/validators";
import { updateMyTrainerProfile } from "@/actions/trainer.action";
import ProfileImageUpload from "../ProfileImageUpload";
import LanguagePicker from "../LanguagePicker";
import SpecializationPicker from "../SpecializationPicker";
import { getInitials } from "@/lib/utils";

export const TRAINER_SETTINGS_FORM_ID = "trainer-settings-form";

// Row shape is snake_case; the form/schema is camelCase. Only the fields a
// trainer can self-edit are mapped here — maxMembers and employmentType's
// gym-side implications stay driven by whatever the owner sets.
function toDefaultValues(
  trainer: Record<string, unknown> | undefined,
): Partial<CreateTrainerInput> {
  if (!trainer) return {};
  return {
    fullName: (trainer.full_name as string) ?? "",
    contactPhone: (trainer.contact_phone as string) ?? "",
    gender: trainer.gender as CreateTrainerInput["gender"],
    dateOfBirth: (trainer.date_of_birth as string) ?? "",
    professionalTitle: (trainer.professional_title as string) ?? "",
    bio: (trainer.bio as string) ?? "",
    experienceYears: (trainer.experience_years as number) ?? 0,
    qualification: (trainer.qualification as string) ?? "",
    certification: (trainer.certification as string) ?? "",
    employmentType:
      trainer.employment_type as CreateTrainerInput["employmentType"],
    specializations: (trainer.specializations as string[]) ?? [],
    workingDays: (trainer.working_days as string[]) ?? [],
    startTime: (trainer.start_time as string) ?? "",
    endTime: (trainer.end_time as string) ?? "",
    maxMembers: trainer.max_members as number,
    maxSessionsPerDay: (trainer.max_sessions_per_day as number) ?? 0,
    acceptingNewMembers: (trainer.accepting_new_members as boolean) ?? false,
    sessionTypes: (trainer.session_types as string[]) ?? [],
    languages: (trainer.languages as string[]) ?? [],
    websiteUrl: (trainer.website_url as string) ?? "",
    instagram: (trainer.instagram as string) ?? "",
    linkedin: (trainer.linkedin as string) ?? "",
    youtube: (trainer.youtube as string) ?? "",
    trainingPhilosophy: (trainer.training_philosophy as string) ?? "",
    coachingExperience: (trainer.coaching_experience as string) ?? "",
    emergencyContactName: (trainer.emergency_contact_name as string) ?? "",
    emergencyRelationship:
      trainer.emergency_relationship as CreateTrainerInput["emergencyRelationship"],
    emergencyPhone: (trainer.emergency_phone as string) ?? "",
    emergencyAlternatePhone:
      (trainer.emergency_alternate_phone as string) ?? "",
    addressLine: (trainer.address_line as string) ?? "",
    city: (trainer.city as string) ?? "",
    state: (trainer.state as string) ?? "",
    postalCode: (trainer.postal_code as string) ?? "",
    country: (trainer.country as string) ?? "India",
    additionalNotes: (trainer.additional_notes as string) ?? "",
  };
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-24 w-24 -rotate-90"
      role="img"
      aria-label={`${value}% profile complete`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="stroke-muted"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="stroke-primary transition-all duration-500"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-foreground text-[22px] font-semibold"
        style={{ transformOrigin: "50px 50px" }}
      >
        {value}%
      </text>
    </svg>
  );
}

function Block({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} rounded-md bg-muted animate-pulse`} />;
}

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4">
      <Block h="h-5" w="w-40" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Block h="h-3" w="w-24" />
            <Block h="h-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrainerSettingsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
        <CardSkeleton rows={2} />
        <CardSkeleton rows={2} />
      </div>
      <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
        <div className="rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <Block h="h-3" w="w-28" />
              <Block h="h-3" w="w-20" />
            </div>
          </div>
          <Block h="h-9" />
        </div>
        <div className="rounded-2xl border border-border p-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function TrainerSettingsForm({
  trainerId,
  initialData,
}: {
  trainerId?: string;
  initialData?: Record<string, unknown>;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [existingPhotoUrl, setExistingPhotoUrl] = React.useState<string | null>(
    (initialData?.photo_url as string) || null,
  );
  const photo = useSingleUpload(undefined, undefined, 2 * 1024 * 1024);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateTrainerInput>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: toDefaultValues(initialData),
    mode: "onBlur",
  });

  // defaultValues only apply at mount — if initialData arrives or changes
  // after that (e.g. the query was disabled/pending on first render, or
  // trainerId changes), sync the form explicitly.
  React.useEffect(() => {
    if (initialData) {
      reset(toDefaultValues(initialData));
      setExistingPhotoUrl((initialData.photo_url as string) || null);
    }
  }, [initialData, reset]);

  const fullName = watch("fullName") || "";
  const professionalTitle = watch("professionalTitle") || "";
  const bio = watch("bio") || "";
  const specializations = watch("specializations") || [];
  const workingDays = watch("workingDays") || [];
  const sessionTypes = watch("sessionTypes") || [];
  const languages = watch("languages") || [];
  const philosophy = watch("trainingPhilosophy") || "";
  const experience = watch("coachingExperience") || "";
  const notes = watch("additionalNotes") || "";
  const experienceYears = watch("experienceYears") || 0;
  const acceptingNewMembers = watch("acceptingNewMembers");
  const instagram = watch("instagram");
  const linkedin = watch("linkedin");
  const youtube = watch("youtube");
  const websiteUrl = watch("websiteUrl");

  const toggleListValue = (
    field: "specializations" | "workingDays" | "sessionTypes" | "languages",
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

  const addCustomLanguage = (value: string) => {
    const current = watch("languages") || [];
    if (current.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    setValue("languages", [...current, value], { shouldDirty: true });
  };

  const hasChanges = isDirty || photo.file != null;

  const checklist = [
    { label: "Profile Photo", complete: !!(photo.preview || existingPhotoUrl) },
    { label: "Bio", complete: bio.trim().length > 0 },
    { label: "Certification", complete: !!watch("certification") },
    { label: "Experience", complete: experienceYears > 0 },
    { label: "Availability", complete: workingDays.length > 0 },
    {
      label: "Social Links",
      complete: !!(instagram || linkedin || youtube || websiteUrl),
    },
  ];
  const completion = Math.round(
    (checklist.filter((c) => c.complete).length / checklist.length) * 100,
  );

  const onSubmit = (data: CreateTrainerInput) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await updateMyTrainerProfile(data, photo.file);
        if (!result.success) {
          toast.error(result.error ?? "Failed to save profile.");
          return;
        }
        toast.success("Profile updated successfully");
        reset(data);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form
      id={TRAINER_SETTINGS_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col lg:flex-row gap-6 lg:gap-8"
    >
      {/* Left Column - Form */}
      <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
        <SectionCard
          title="Personal Information"
          description="Basic information displayed on your trainer profile."
          icon={User}
        >
          <ProfileImageUpload
            image={photo.preview ?? existingPhotoUrl}
            maxSize={2}
            onChange={photo.selectFile}
          />
          {photo.error && (
            <p className="text-xs text-destructive" role="alert">
              {photo.error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              required
              {...register("fullName")}
              error={errors.fullName}
            />
            <FormInput
              label="Phone"
              required
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
            <FormSelect
              label="Gender"
              options={GENDER_OPTIONS}
              {...register("gender")}
              error={errors.gender}
            />
            <FormInput
              label="Date of Birth"
              type="date"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth}
            />
            <FormInput
              label="Professional Title"
              required
              {...register("professionalTitle")}
              error={errors.professionalTitle}
            />
          </div>

          <div className="space-y-1.5">
            <FormTextarea
              label="Bio"
              rows={3}
              maxLength={250}
              {...register("bio")}
              error={errors.bio}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length} / 250 characters
            </p>
          </div>

          <LanguagePicker
            selected={languages}
            onToggle={(v) => toggleListValue("languages", v)}
            onAdd={addCustomLanguage}
          />
        </SectionCard>

        <SectionCard
          title="Professional Information"
          description="Information that helps members choose the right trainer."
          icon={Briefcase}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Years of Experience"
              type="number"
              min={0}
              {...register("experienceYears")}
              error={errors.experienceYears}
            />
            <FormInput
              label="Qualification"
              placeholder="e.g. B.Sc. Sports Science"
              {...register("qualification")}
              error={errors.qualification}
            />
            <FormInput
              label="Certification"
              placeholder="e.g. ACE Certified"
              {...register("certification")}
              error={errors.certification}
            />
            <FormSelect
              label="Employment Type"
              options={EMPLOYMENT_TYPE_OPTIONS}
              {...register("employmentType")}
              error={errors.employmentType}
            />
          </div>

          <SpecializationPicker
            selected={specializations}
            onToggle={(v) => toggleListValue("specializations", v)}
          />

          <FormTextarea
            label="Coaching Experience"
            rows={3}
            maxLength={500}
            {...register("coachingExperience")}
            error={errors.coachingExperience}
          />
          <p className="text-xs text-muted-foreground text-right">
            {experience.length} / 500 characters
          </p>

          <FormTextarea
            label="Training Philosophy"
            rows={3}
            maxLength={500}
            {...register("trainingPhilosophy")}
            error={errors.trainingPhilosophy}
          />
          <p className="text-xs text-muted-foreground text-right">
            {philosophy.length} / 500 characters
          </p>
        </SectionCard>

        <SectionCard
          title="Availability"
          description="Let members know when and how you coach."
          icon={Clock}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleListValue("workingDays", day)}
                    aria-pressed={active}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Start Time"
              type="time"
              {...register("startTime")}
              error={errors.startTime}
            />
            <FormInput
              label="End Time"
              type="time"
              {...register("endTime")}
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Max Sessions Per Day"
              type="number"
              {...register("maxSessionsPerDay")}
              error={errors.maxSessionsPerDay}
            />
            {/* Max Members is owner-controlled — trainers_guard_self_update
                blocks self-edits, so this is read-only here. */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Max Members
              </label>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {(initialData?.max_members as number) ?? "—"}{" "}
                <span className="text-xs">(set by your gym)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={acceptingNewMembers}
              onCheckedChange={(checked) =>
                setValue("acceptingNewMembers", checked, { shouldDirty: true })
              }
            />
            <label className="text-sm font-medium cursor-pointer">
              Accepting New Members
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Session Types
            </label>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => {
                const isSelected = sessionTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleListValue("sessionTypes", type)}
                    className={`px-3 py-1 rounded-full text-sm transition-all border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary"
                    }`}
                  >
                    {type}
                    {isSelected && <span className="ml-1">×</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Social Links" icon={Globe}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Website"
              type="url"
              {...register("websiteUrl")}
              error={errors.websiteUrl}
            />
            <FormInput
              label="Instagram"
              type="url"
              {...register("instagram")}
              error={errors.instagram}
            />
            <FormInput
              label="LinkedIn"
              type="url"
              {...register("linkedin")}
              error={errors.linkedin}
            />
            <FormInput
              label="YouTube"
              type="url"
              {...register("youtube")}
              error={errors.youtube}
            />
          </div>
        </SectionCard>

        <SectionCard title="Emergency Contact" icon={AlertCircle}>
          <FormInput
            label="Contact Name"
            {...register("emergencyContactName")}
            error={errors.emergencyContactName}
          />
          <FormSelect
            label="Relationship"
            options={RELATIONSHIP_OPTIONS}
            {...register("emergencyRelationship")}
            error={errors.emergencyRelationship}
          />
          <FormInput
            label="Phone"
            required
            {...register("emergencyPhone")}
            error={errors.emergencyPhone}
          />
          <FormInput
            label="Alternate Phone"
            {...register("emergencyAlternatePhone")}
            error={errors.emergencyAlternatePhone}
          />
        </SectionCard>

        <SectionCard title="Address" icon={MapPin}>
          <FormInput
            label="Address Line"
            {...register("addressLine")}
            error={errors.addressLine}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="City" {...register("city")} error={errors.city} />
            <FormSelect
              label="State"
              options={STATE_OPTIONS}
              {...register("state")}
              error={errors.state}
            />
            <FormInput
              label="Postal Code"
              {...register("postalCode")}
              error={errors.postalCode}
            />
          </div>
          <FormInput label="Country" disabled {...register("country")} />
        </SectionCard>

        <SectionCard title="Additional Notes" icon={FileText}>
          <FormTextarea
            label="Additional Notes (Optional)"
            rows={4}
            maxLength={500}
            {...register("additionalNotes")}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length} / 500 characters
          </p>
        </SectionCard>

        {hasChanges && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            You have unsaved changes
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-6">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Public Profile Preview
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarImage
                    src={photo.preview ?? existingPhotoUrl ?? undefined}
                    alt={fullName}
                  />
                  <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    {fullName || "—"}
                    <BadgeCheck
                      className="h-3.5 w-3.5 text-primary"
                      aria-label="Verified trainer"
                    />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {professionalTitle || "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {specializations.slice(0, 4).map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{experienceYears} years experience</span>
                {acceptingNewMembers ? (
                  <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    Accepting members
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  >
                    Not accepting
                  </Badge>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 rounded-xl"
              >
                <Eye className="h-4 w-4" />
                View Public Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Profile Completion
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <CircularProgress value={completion} />
              </div>
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {item.complete ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        item.complete
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
