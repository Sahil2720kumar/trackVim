"use client";

import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Heart,
  AlertTriangle,
  PhoneCall,
  FileText,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import ProfileImageUpload from "../ProfileImageUpload";
import { CreateMemberInput, createMemberSchema } from "@/db/validators";
import { useSingleUpload } from "@/components/ImageUpload"; // adjust path as needed
import {
  BLOOD_GROUP_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STATE_OPTIONS,
} from "@/constants/profile-options";
import { createMemberProfileAction } from "@/actions/member.action";
import { buildMemberFormData } from "@/lib/extractFields";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
export default function MemberProfileForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const photo = useSingleUpload(undefined, 2 * 1024 * 1024);
  const { session } = useClerk(); // add this

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
  });

  const watchedNotes = watch("additionalNotes");

  const isSubmitting = useRef(false);

  const onSubmit = (data: CreateMemberInput) => {
    if (isSubmitting.current) return; // block concurrent calls
    isSubmitting.current = true;

    startTransition(async () => {
      try {
        const result = await createMemberProfileAction(
          buildMemberFormData(data, photo.file),
        );
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Profile saved successfully");
        await session?.reload();
        router.push("/member/home");
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("Error saving profile. Please try again.");
      } finally {
        isSubmitting.current = false;
      }
    });
  };

  const handleSkip = () => {
    window.location.href = "/member/home";
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 py-6 pb-32"
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help your trainers understand your fitness goals and emergency
          information.
          <br />
          You can skip this step and update everything later from Settings.
        </p>
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" icon={User}>
        <ProfileImageUpload
          maxSize={2}
          image={photo.preview}
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
            placeholder="Full name"
            required
            {...register("fullName")}
            error={errors.fullName}
          />
          <FormInput
            label="Contact Phone"
            type="tel"
            placeholder="+91 98765 43210"
            required
            {...register("contactPhone")}
            error={errors.contactPhone}
          />
          <FormInput
            label="Date of Birth"
            type="date"
            {...register("dateOfBirth")}
            error={errors.dateOfBirth}
          />
          <FormSelect
            label="Gender"
            options={GENDER_OPTIONS}
            required
            {...register("gender")}
            error={errors.gender}
          />
          <FormInput
            label="Occupation"
            placeholder="Software Engineer"
            {...register("occupation")}
            error={errors.occupation}
          />
          <FormSelect
            label="Blood Group"
            options={BLOOD_GROUP_OPTIONS}
            {...register("bloodGroup")}
            error={errors.bloodGroup}
          />
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address" icon={MapPin}>
        <FormInput
          label="Address"
          placeholder="123, Green Park Avenue, Near City Center"
          {...register("address")}
          error={errors.address}
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
            label="PIN Code"
            placeholder="560034"
            {...register("pinCode")}
            error={errors.pinCode}
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Information */}
        <SectionCard title="Fitness Information" icon={Heart}>
          <FormInput
            label="Height (cm)"
            type="number"
            placeholder="175"
            {...register("heightCm")}
            error={errors.heightCm}
          />
          <FormInput
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="68.5"
            {...register("weightKg")}
            error={errors.weightKg}
          />
          <FormSelect
            label="Fitness Goal"
            options={FITNESS_GOAL_OPTIONS}
            {...register("fitnessGoal")}
            error={errors.fitnessGoal}
          />
        </SectionCard>

        {/* Medical Information */}
        <SectionCard title="Medical Information" icon={AlertTriangle}>
          <Badge variant="outline" className="text-xs -mt-2 w-fit">
            Only visible to authorized trainers and gym staff
          </Badge>
          <FormTextarea
            label="Medical Conditions (if any)"
            placeholder="No known medical conditions"
            rows={2}
            {...register("medicalConditions")}
            error={errors.medicalConditions}
          />
          <FormTextarea
            label="Allergies (if any)"
            placeholder="None"
            rows={2}
            {...register("allergies")}
            error={errors.allergies}
          />
          <FormTextarea
            label="Physical Notes (if any)"
            placeholder="Occasional lower back discomfort"
            rows={2}
            {...register("physicalNotes")}
            error={errors.physicalNotes}
          />
        </SectionCard>
      </div>

      {/* Emergency Contact */}
      <SectionCard title="Emergency Contact" icon={PhoneCall}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Contact Name"
            placeholder="Amit Sharma"
            {...register("emergencyContactName")}
            error={errors.emergencyContactName}
          />
          <FormSelect
            label="Relationship"
            options={RELATIONSHIP_OPTIONS}
            {...register("emergencyContactRelationship")}
            error={errors.emergencyContactRelationship}
          />
          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="+91 99876 54321"
            {...register("emergencyContactPhone")}
            error={errors.emergencyContactPhone}
          />
          <FormInput
            label="Emergency Address"
            placeholder="456, Green Park Avenue, Bangalore, Karnataka - 560034"
            {...register("emergencyContactAddress")}
            error={errors.emergencyContactAddress}
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription>
            This information will be used only in case of an emergency.
          </AlertDescription>
        </Alert>
      </SectionCard>

      {/* Additional Notes */}
      <SectionCard title="Additional Notes" icon={FileText}>
        <FormTextarea
          label="Additional Notes (Optional)"
          placeholder="Anything else you'd like your trainer to know? (e.g., preferred workout time, diet restrictions, previous training experience)"
          rows={5}
          {...register("additionalNotes")}
        />
        <p className="text-xs text-muted-foreground text-right">
          {watchedNotes?.length || 0} / 500 characters
        </p>
      </SectionCard>

      <Alert>
        <Info className="h-4 w-4" />
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
            disabled={isPending} // add this
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
