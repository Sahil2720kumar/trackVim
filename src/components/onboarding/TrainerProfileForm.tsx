"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useSingleUpload } from "@/components/ImageUpload"; // adjust path as needed
import LanguagePicker from "../LanguagePicker";
import SpecializationPicker from "../SpecializationPicker";

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
export default function TrainerProfileForm() {
  const [isPending, startTransition] = useTransition();
  const photo = useSingleUpload(undefined, 2 * 1024 * 1024);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTrainerInput>({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      country: "India",
      joiningDate: new Date().toISOString().split("T")[0],
    },
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
    if (current.includes(value)) {
      setValue(
        field,
        current.filter((v) => v !== value),
        { shouldDirty: true },
      );
    } else {
      setValue(field, [...current, value], { shouldDirty: true });
    }
  };

  const addCustomLanguage = (value: string) => {
    const current = watch("languages") || [];
    const alreadyAdded = current.some(
      (v) => v.toLowerCase() === value.toLowerCase(),
    );
    if (alreadyAdded) return;
    setValue("languages", [...current, value], { shouldDirty: true });
  };

  const onSubmit = (data: CreateTrainerInput) => {
    startTransition(async () => {
      try {
        console.log("Trainer profile submitted:", {
          ...data,
          photoFile: photo.file,
        });
        // await saveTrainerProfileAction(...)
        // window.location.href = "/trainer/home";
      } catch (error) {
        console.error("Error saving profile:", error);
        alert("Error saving profile. Please try again.");
      }
    });
  };

  const handleSkip = () => {
    window.location.href = "/trainer/home";
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log(errors);
      })}
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
            image={photo.preview}
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
              label="Email"
              type="email"
              placeholder="email@example.com"
              required
              {...register("contactEmail")}
              error={errors.contactEmail}
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
          className="lg:col-span-2"
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
            placeholder="123, Street name"
            {...register("addressLine")}
            error={errors.addressLine}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="City"
              placeholder="Bangalore"
              {...register("city")}
              error={errors.city}
            />
            <FormSelect
              label="State"
              options={STATE_OPTIONS}
              {...register("state")}
              error={errors.state}
            />
            <FormInput
              label="Postal Code"
              placeholder="560034"
              {...register("postalCode")}
              error={errors.postalCode}
            />
          </div>
          <FormInput label="Country" disabled {...register("country")} />
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
