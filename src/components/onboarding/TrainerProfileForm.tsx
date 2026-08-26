"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Clock,
  Globe,
  Users,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Dumbbell,
  Languages as LanguagesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import ProfileImageUpload from "../ProfileImageUpload";
import {
  DAYS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SESSION_TYPES,
  STATE_OPTIONS,
} from "@/constants/profile-options";
import { CreateTrainerInput, createTrainerSchema } from "@/db/validators";
import { useSingleUpload } from "@/components/ImageUpload";
import LanguagePicker from "../LanguagePicker";
import SpecializationPicker from "../SpecializationPicker";
import { completeTrainerProfileAction } from "@/actions/trainer.action";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";

// Row shape from Supabase is snake_case; the form/schema is camelCase.
// Mapping only the fields this form actually edits — full_name,
// invited_email, employment fields set by the owner stay untouched
// (same merge boundary as the member-profile flow: this UPDATE only
// touches what the trainer themself can provide).
function toDefaultValues(
  trainer: Record<string, unknown> | undefined,
): Partial<CreateTrainerInput> {
  if (!trainer) {
    return {
      country: "India",
      joiningDate: new Date().toISOString().split("T")[0],
    };
  }
  return {
    fullName: trainer.full_name as string,
    contactPhone: trainer.contact_phone as string,
    gender: trainer.gender as CreateTrainerInput["gender"],
    dateOfBirth: trainer.date_of_birth as string,
    professionalTitle: trainer.professional_title as string,
    bio: trainer.bio as string,
    experienceYears: trainer.experience_years as number,
    qualification: trainer.qualification as string,
    certification: trainer.certification as string,
    employmentType:
      trainer.employment_type as CreateTrainerInput["employmentType"],
    specializations: (trainer.specializations as string[]) ?? [],
    workingDays: (trainer.working_days as string[]) ?? [],
    startTime: trainer.start_time as string,
    endTime: trainer.end_time as string,
    maxMembers: trainer.max_members as number,
    maxSessionsPerDay: trainer.max_sessions_per_day as number,
    acceptingNewMembers: (trainer.accepting_new_members as boolean) ?? false,
    sessionTypes: (trainer.session_types as string[]) ?? [],
    languages: (trainer.languages as string[]) ?? [],
    websiteUrl: trainer.website_url as string,
    instagram: trainer.instagram as string,
    linkedin: trainer.linkedin as string,
    youtube: trainer.youtube as string,
    trainingPhilosophy: trainer.training_philosophy as string,
    coachingExperience: trainer.coaching_experience as string,
    emergencyContactName: trainer.emergency_contact_name as string,
    emergencyRelationship:
      trainer.emergency_relationship as CreateTrainerInput["emergencyRelationship"],
    emergencyPhone: trainer.emergency_phone as string,
    emergencyAlternatePhone: trainer.emergency_alternate_phone as string,
    addressLine: trainer.address_line as string,
    city: trainer.city as string,
    state: trainer.state as string,
    postalCode: trainer.postal_code as string,
    country: (trainer.country as string) ?? "India",
    additionalNotes: trainer.additional_notes as string,
  };
}

export default function TrainerProfileForm({
  trainerId,
  initialData,
}: {
  trainerId: string;
  initialData?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { session } = useClerk();

  const [existingPhotoUrl] = useState<string | null>(
    (initialData?.photo_url as string) || null,
  );

  const photo = useSingleUpload(undefined, undefined, 2 * 1024 * 1024);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTrainerInput>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: toDefaultValues(initialData),
    mode: "onBlur",
  });

  const specializations = watch("specializations") || [];
  const workingDays = watch("workingDays") || [];
  const sessionTypes = watch("sessionTypes") || [];
  const languages = watch("languages") || [];
  const bio = watch("bio") || "";
  const philosophy = watch("trainingPhilosophy") || "";
  const experience = watch("coachingExperience") || "";
  const notes = watch("additionalNotes") || "";

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
      {
        shouldDirty: true,
      },
    );
  };

  const addCustomLanguage = (value: string) => {
    const current = watch("languages") || [];
    if (current.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    setValue("languages", [...current, value], { shouldDirty: true });
  };

  const onSubmit = (data: CreateTrainerInput) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await completeTrainerProfileAction(
          trainerId,
          data,
          photo.file,
        );
        if (!result.success) {
          toast.error(result.error ?? "Failed to save profile.");
          return;
        }

        await session?.reload();
        toast.success("Profile saved successfully");
        router.replace("/trainer/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const handleSkip = () => {
    toast.error("Please fill all the required fields");
    // router.push("/trainer/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 py-6 pb-32"
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Complete Your Trainer Profile
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete your professional profile so gym owners and members can learn
          more about your expertise, schedule, and coaching style.
          <br />
          You can update this later from Settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <SectionCard title="Personal Information" icon={User}>
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
              placeholder="Enter full name"
              required
              {...register("fullName")}
              error={errors.fullName}
            />

            <FormInput
              label="Phone"
              placeholder="+91 98765 43210"
              required
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
            <FormSelect
              label="Gender"
              required
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
              placeholder="e.g., Strength Coach"
              required
              {...register("professionalTitle")}
              error={errors.professionalTitle}
            />
          </div>

          <div className="space-y-1.5">
            <FormTextarea
              label="Bio"
              placeholder="Tell members about yourself..."
              rows={4}
              maxLength={500}
              {...register("bio")}
              error={errors.bio}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length} / 500 characters
            </p>
          </div>
        </SectionCard>

        {/* Professional Information */}
        <SectionCard title="Professional Information" icon={Briefcase}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Years of Experience"
              type="number"
              placeholder="6"
              {...register("experienceYears")}
              error={errors.experienceYears}
            />
            <FormInput
              label="Qualification"
              placeholder="e.g., B.Sc. in Sports Science"
              {...register("qualification")}
              error={errors.qualification}
            />
            <FormInput
              label="Certification"
              placeholder="e.g., ACE Certified"
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
        </SectionCard>

        {/* Specializations */}
        <SectionCard
          title="Specializations"
          icon={Dumbbell}
          // className="lg:col-span-2"
        >
          <p className="text-xs text-muted-foreground -mt-2">
            Select the areas you train clients in. Grouped by discipline to make
            it easier to find what applies to you.
          </p>
          <SpecializationPicker
            selected={specializations}
            onToggle={(value) => toggleListValue("specializations", value)}
          />
        </SectionCard>

        {/* Availability & Working Hours */}
        <SectionCard title="Availability & Working Hours" icon={Clock}>
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
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isSelected
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
              label="Max Members"
              type="number"
              placeholder="25"
              {...register("maxMembers")}
              error={errors.maxMembers}
            />
            <FormInput
              label="Max Sessions Per Day"
              type="number"
              placeholder="8"
              {...register("maxSessionsPerDay")}
              error={errors.maxSessionsPerDay}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={watch("acceptingNewMembers")}
              onCheckedChange={(checked) =>
                setValue("acceptingNewMembers", checked, { shouldDirty: true })
              }
            />
            <label className="text-sm font-medium cursor-pointer">
              Accepting New Members
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Session Types</p>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => {
                const isSelected = sessionTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
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

        {/* Languages */}
        <SectionCard title="Languages" icon={LanguagesIcon}>
          <p className="text-xs text-muted-foreground -mt-2">
            Languages you can coach in. Tap to select, or add one that isn't
            listed.
          </p>
          <LanguagePicker
            selected={languages}
            onToggle={(value) => toggleListValue("languages", value)}
            onAdd={addCustomLanguage}
          />
        </SectionCard>

        {/* Social Links */}
        <SectionCard title="Social Links" icon={Globe}>
          <FormInput
            label="Website"
            type="url"
            placeholder="https://example.com"
            {...register("websiteUrl")}
            error={errors.websiteUrl}
          />
          <FormInput
            label="Instagram"
            type="url"
            placeholder="https://instagram.com/username"
            {...register("instagram")}
            error={errors.instagram}
          />
          <FormInput
            label="LinkedIn"
            type="url"
            placeholder="https://linkedin.com/in/username"
            {...register("linkedin")}
            error={errors.linkedin}
          />
          <FormInput
            label="YouTube"
            type="url"
            placeholder="https://youtube.com/@username"
            {...register("youtube")}
            error={errors.youtube}
          />
        </SectionCard>

        {/* Coaching Profile */}
        <SectionCard
          title="Coaching Profile"
          icon={Users}
          className="lg:col-span-2"
        >
          <div className="space-y-1.5">
            <FormTextarea
              label="Training Philosophy"
              placeholder="Your training philosophy..."
              rows={3}
              maxLength={500}
              {...register("trainingPhilosophy")}
              error={errors.trainingPhilosophy}
            />
            <p className="text-xs text-muted-foreground text-right">
              {philosophy.length} / 500 characters
            </p>
          </div>

          <div className="space-y-1.5">
            <FormTextarea
              label="Coaching Experience"
              placeholder="Describe your coaching experience..."
              rows={3}
              maxLength={500}
              {...register("coachingExperience")}
              error={errors.coachingExperience}
            />
            <p className="text-xs text-muted-foreground text-right">
              {experience.length} / 500 characters
            </p>
          </div>

          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              This information is visible to members viewing your trainer
              profile.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon={AlertCircle}>
          <FormInput
            label="Contact Name"
            placeholder="Enter name"
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
            placeholder="+91 98765 11111"
            required
            {...register("emergencyPhone")}
            error={errors.emergencyPhone}
          />
          <FormInput
            label="Alternate Phone"
            placeholder="+91 91254 56789"
            {...register("emergencyAlternatePhone")}
            error={errors.emergencyAlternatePhone}
          />
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" icon={MapPin}>
          <FormInput
            label="Address Line"
            placeholder="Enter address"
            {...register("addressLine")}
            error={errors.addressLine}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="City"
              placeholder="Enter city name"
              {...register("city")}
              error={errors.city}
            />
            <FormSelect
              label="State"
              placeholder="Enter state name"
              options={STATE_OPTIONS}
              {...register("state")}
              error={errors.state}
            />
            <FormInput
              label="Postal Code"
              placeholder="Enter pin code"
              {...register("postalCode")}
              error={errors.postalCode}
            />
          </div>
          <FormInput
            placeholder="Enter country name"
            label="Country"
            disabled
            defaultValue="India"
            {...register("country")}
          />
        </SectionCard>

        {/* Additional Notes */}
        <SectionCard
          title="Additional Notes"
          icon={FileText}
          className="lg:col-span-2"
        >
          <FormTextarea
            label="Additional Notes (Optional)"
            placeholder="Anything else you'd like your gym owner to know?"
            rows={4}
            maxLength={500}
            {...register("additionalNotes")}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length} / 500 characters
          </p>
        </SectionCard>
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Your information is safe and secure</AlertTitle>
        <AlertDescription>
          We respect your privacy and will never share your data with third
          parties.
        </AlertDescription>
      </Alert>

      {/*  Footer — Skip / Save & Continue */}
      <div className="flex items-end justify-end">
        <div className="flex gap-2 items-end justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className={`${bigSquareButton} flex-1`}
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={`${bigSquareButton} flex-1 bg-primary hover:bg-primary/90`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Save &amp; Continue
                <span className="ml-2">→</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
