"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Upload,
  X,
  Clock,
  Users,
  Check,
  UserCircle,
  BriefcaseBusiness,
  CalendarClock,
  PhoneCall,
  MapPin,
  Mail,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";

// ---------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------
const trainerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phoneCode: z.string().min(1, "Required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  employeeId: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  experience: z.string().min(1, "Experience is required"),
  qualification: z.string().optional(),
  certification: z.string().optional(),
  salary: z.string().min(1, "Salary is required"),
  specializations: z
    .array(z.string())
    .min(1, "At least one specialization is required"),
  workingDays: z.array(z.string()).min(1, "Select at least one working day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  maxMembers: z.string().optional(),
  maxSessions: z.string().optional(),
  emergencyContactPerson: z.string().min(1, "Contact person is required"),
  emergencyRelationship: z.string().min(1, "Relationship is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  emergencyAlternatePhone: z.string().optional(),
  addressLine: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  sendInvitation: z.boolean().optional(),
  personalMessage: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

// ---------------------------------------------------------------------
// Static options
// ---------------------------------------------------------------------
const SPECIALIZATIONS = [
  "Strength Training",
  "Weight Loss",
  "Yoga",
  "CrossFit",
  "Cardio",
  "Powerlifting",
  "Bodybuilding",
  "Nutrition",
  "HIIT",
];

const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PHONE_CODES = ["+91", "+1", "+44"].map((v) => ({ value: v, label: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map((v) => ({
  value: v,
  label: v,
}));
const EXPERIENCE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? "Year" : "Years"}`,
}));
const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"].map((v) => ({
  value: v,
  label: v,
}));
const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Spouse",
  "Sibling",
  "Friend",
  "Other",
].map((v) => ({ value: v, label: v }));
const COUNTRY_OPTIONS = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
].map((v) => ({ value: v, label: v }));

const defaultValues: TrainerFormData = {
  fullName: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phoneCode: "+91",
  phoneNumber: "98765 43210",
  dateOfBirth: "1992-08-12",
  gender: "Male",
  employeeId: "TRN-1024",
  joiningDate: "2024-05-20",
  experience: "5",
  qualification: "B.Sc. in Fitness Science",
  certification: "ACE, ISSA, NASM",
  salary: "35000",
  specializations: [
    "Strength Training",
    "Weight Loss",
    "CrossFit",
    "Nutrition",
    "HIIT",
  ],
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  startTime: "09:00",
  endTime: "18:00",
  employmentType: "Full Time",
  maxMembers: "40",
  maxSessions: "8",
  emergencyContactPerson: "Ramesh Sharma",
  emergencyRelationship: "Father",
  emergencyPhone: "98765 12345",
  emergencyAlternatePhone: "91234 56789",
  addressLine: "123 Fitness Street, Near City Center",
  city: "Guwahati",
  state: "Assam",
  country: "India",
  postalCode: "781001",
  sendInvitation: true,
  personalMessage: "Welcome to our gym! We're excited to have you on our team.",
  additionalNotes: "",
};

// Stable id so the header's "Create Trainer" button — rendered outside this
// component in the server component — can submit this form via the HTML
// `form="..."` attribute, without needing access to react-hook-form's
// handleSubmit.
export const TRAINER_FORM_ID = "add-trainer-form";

export default function TrainerForm() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues,
  });

  // Watched fields — drive the sticky summary / live preview
  const fullName = watch("fullName");
  const employeeId = watch("employeeId");
  const specializations = watch("specializations") || [];
  const workingDays = watch("workingDays") || [];
  const experience = watch("experience");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const maxMembers = watch("maxMembers");
  const employmentType = watch("employmentType");
  const sendInvitation = watch("sendInvitation");
  const personalMessage = watch("personalMessage") || "";

  const toggleSpecialization = (spec: string) => {
    const next = specializations.includes(spec)
      ? specializations.filter((s) => s !== spec)
      : [...specializations, spec];
    setValue("specializations", next, { shouldValidate: true });
  };

  const toggleWorkingDay = (day: string) => {
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day];
    setValue("workingDays", next, { shouldValidate: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleImageUpload({ target: input } as any);
    }
  };

  const removeImage = () => setSelectedImage(null);

  // Completion progress
  const completionChecks = [
    !!fullName,
    !!employeeId,
    specializations.length > 0,
    workingDays.length > 0,
    !!watch("emergencyContactPerson"),
    !!watch("addressLine"),
    !!selectedImage,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onSubmit = (data: TrainerFormData) => {
    console.log("Trainer payload:", data, { photo: selectedImage });
  };

  return (
    <form
      id={TRAINER_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8"
    >
      <div className="flex-1 min-w-0 space-y-6">
        {/* Personal Information */}
        <SectionCard title="Personal Information" icon={UserCircle}>
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Trainer Photo
            </label>

            {!selectedImage ? (
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-lg bg-muted p-3">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Click to upload or drag and drop
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG or JPG up to 2 MB
                    </p>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="secondary" size="sm" asChild>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      Browse
                    </label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={selectedImage}
                    alt="Trainer"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                >
                  Remove Photo
                </Button>
              </div>
            )}
          </div>

          <FormInput
            label="Full Name"
            placeholder="Enter full name"
            required
            {...register("fullName")}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="Enter email"
              required
              {...register("email")}
              error={errors.email}
            />

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  className="w-24 shrink-0 px-2 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("phoneCode")}
                >
                  {PHONE_CODES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Phone number"
                  className={`flex-1 min-w-0 px-3 py-2 rounded-lg border transition-colors ${
                    errors.phoneNumber
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-background hover:border-border/80 focus:border-primary"
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  {...register("phoneNumber")}
                />
              </div>
              {errors.phoneNumber && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Date of Birth"
              type="date"
              required
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
          </div>
        </SectionCard>

        {/* Professional Details */}
        <SectionCard title="Professional Details" icon={BriefcaseBusiness}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Employee ID"
              readOnly
              className="bg-muted"
              {...register("employeeId")}
            />
            <FormInput
              label="Joining Date"
              type="date"
              required
              {...register("joiningDate")}
              error={errors.joiningDate}
            />
            <FormSelect
              label="Experience (Years)"
              options={EXPERIENCE_OPTIONS}
              required
              {...register("experience")}
              error={errors.experience}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Qualification"
              placeholder="e.g. B.Sc. in Fitness Science"
              {...register("qualification")}
            />
            <FormInput
              label="Certification"
              placeholder="e.g. ACE, ISSA, NASM"
              {...register("certification")}
            />
            <FormInput
              label="Salary (₹)"
              type="number"
              placeholder="0"
              required
              {...register("salary")}
              error={errors.salary}
            />
          </div>

          {/* Specializations */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Specializations <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((spec) => {
                const selected = specializations.includes(spec);
                return (
                  <Badge
                    key={spec}
                    variant="outline"
                    onClick={() => toggleSpecialization(spec)}
                    className={`h-9 rounded-full px-3 flex items-center gap-1.5 cursor-pointer select-none border text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {selected && (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                    <span>{spec}</span>
                  </Badge>
                );
              })}
            </div>
            {errors.specializations && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.specializations.message}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Working Schedule */}
        <SectionCard title="Working Schedule" icon={CalendarClock}>
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Working Days <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {WORKING_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`h-9 w-9 rounded-lg font-medium text-sm transition-colors ${
                    workingDays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border hover:border-primary/50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.workingDays && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.workingDays.message}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Start Time <span className="text-destructive">*</span>
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
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                End Time <span className="text-destructive">*</span>
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
            </div>

            <FormSelect
              label="Employment Type"
              options={EMPLOYMENT_TYPES}
              required
              {...register("employmentType")}
              error={errors.employmentType}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Maximum Members"
              type="number"
              placeholder="0"
              {...register("maxMembers")}
            />
            <FormInput
              label="Maximum Sessions Per Day"
              type="number"
              placeholder="0"
              {...register("maxSessions")}
            />
          </div>
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon={PhoneCall}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Person"
              placeholder="Enter contact person name"
              required
              {...register("emergencyContactPerson")}
              error={errors.emergencyContactPerson}
            />
            <FormSelect
              label="Relationship"
              options={RELATIONSHIP_OPTIONS}
              required
              {...register("emergencyRelationship")}
              error={errors.emergencyRelationship}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Phone Number"
              placeholder="Phone number"
              required
              {...register("emergencyPhone")}
              error={errors.emergencyPhone}
            />
            <FormInput
              label="Alternate Phone Number"
              placeholder="Alternate phone number"
              {...register("emergencyAlternatePhone")}
            />
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" icon={MapPin}>
          <FormInput
            label="Address Line"
            placeholder="Enter street address"
            required
            {...register("addressLine")}
            error={errors.addressLine}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="City"
              placeholder="Enter city"
              required
              {...register("city")}
              error={errors.city}
            />
            <FormInput
              label="State"
              placeholder="Enter state"
              required
              {...register("state")}
              error={errors.state}
            />
            <FormSelect
              label="Country"
              options={COUNTRY_OPTIONS}
              required
              {...register("country")}
              error={errors.country}
            />
            <FormInput
              label="Postal Code"
              placeholder="Enter postal code"
              required
              {...register("postalCode")}
              error={errors.postalCode}
            />
          </div>
        </SectionCard>

        {/* Trainer Invitation */}
        <SectionCard title="Trainer Invitation" icon={Mail}>
          <p className="text-sm text-muted-foreground -mt-2">
            After the trainer is created, an invitation email will be sent to
            the email address provided above. The trainer can use this
            invitation to create their account and join your gym.
          </p>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-1 pr-4">
              <label className="text-sm font-medium text-foreground">
                Send invitation email automatically
              </label>
              <p className="text-xs text-muted-foreground">
                An invitation email containing a secure registration link will
                be sent to the trainer after the profile is created.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                If the trainer already has a TrackVim account, they will receive
                an invitation to join your gym instead of creating a new
                account.
              </p>
            </div>
            <Switch
              checked={sendInvitation}
              onCheckedChange={(val) => setValue("sendInvitation", val)}
              className="ml-4 shrink-0"
            />
          </div>

          {sendInvitation && (
            <FormTextarea
              label="Personal Message (Optional)"
              placeholder="Welcome to our gym! We're excited to have you on our team."
              maxLength={300}
              {...register("personalMessage")}
            />
          )}
          {sendInvitation && (
            <p className="text-xs text-muted-foreground text-right -mt-2">
              {personalMessage.length} / 300
            </p>
          )}
        </SectionCard>

        {/* Additional Notes */}
        <SectionCard title="Additional Notes" icon={StickyNote}>
          <FormTextarea
            label="Notes"
            placeholder="Add internal notes about this trainer..."
            rows={5}
            {...register("additionalNotes")}
          />
        </SectionCard>

        {/* Action Buttons - Mobile */}
        <div className="flex flex-col gap-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className={bigSquareButton}
            onClick={() => reset(defaultValues)}
          >
            Reset Form
          </Button>
          <Button type="button" variant="outline" className={bigSquareButton}>
            Save Draft
          </Button>
          <Button type="submit" className={bigSquareButton}>
            Create Trainer & Send Invitation
          </Button>
        </div>
      </div>

      {/* Sticky Summary - Desktop */}
      <div className="hidden lg:block lg:w-80">
        <div className="sticky top-6 space-y-6">
          <SectionCard title="Trainer Summary" icon={Users}>
            {/* Profile Preview */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Profile Preview
              </p>
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-border p-4">
                <Avatar className="h-16 w-16">
                  {selectedImage ? (
                    <AvatarImage src={selectedImage} alt={fullName} />
                  ) : (
                    <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    Trainer ID: {employeeId}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  ● Active
                </Badge>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground pb-1">
                Professional Summary
              </p>
              <SummaryRow
                label="Specializations"
                value={
                  <Badge variant="secondary">
                    {specializations.length} selected
                  </Badge>
                }
              />
              <SummaryRow label="Experience" value={`${experience} Years`} />
              <SummaryRow
                label="Working Hours"
                value={`${startTime} - ${endTime}`}
              />
              <SummaryRow label="Maximum Members" value={maxMembers} />
              <SummaryRow
                label="Employment Type"
                value={employmentType}
                border={false}
              />
            </div>

            {/* Invitation Status */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">
                Invitation Status
              </p>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-muted-foreground">
                  Invitation
                </span>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  {sendInvitation ? "Ready to Send" : "Not Sending"}
                </Badge>
              </div>
            </div>

            {/* Completion Progress */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">
                Completion Progress
              </p>
              <Progress value={completionPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {completionPercent}% Completed
              </p>
            </div>
          </SectionCard>

          {/* Action Buttons - Desktop */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className={bigSquareButton}
              onClick={() => reset(defaultValues)}
            >
              Reset Form
            </Button>
            <Button type="button" variant="outline" className={bigSquareButton}>
              Save Draft
            </Button>
            <Button type="submit" className={bigSquareButton}>
              Create Trainer & Send Invitation
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
