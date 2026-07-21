"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Upload,
  Trash2,
  CheckCircle2,
  Camera,
} from "lucide-react";
import {
  FormInput,
  FormInputWithUnit,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";

// Validation schema
const memberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  membershipPlan: z.string().min(1, "Membership plan is required"),
  trainer: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.string().optional(),
  joiningFee: z.string().optional(),
  discount: z.string().optional(),
  paymentStatus: z.enum(["Paid", "Pending", "Partial"]).optional(),
  paymentMethod: z.enum(["Cash", "UPI", "Card", "Bank Transfer"]).optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  fitnessGoal: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  physicalNotes: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactAddress: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

const membershipPlans = [
  { id: "basic", name: "Basic Plan", price: 1200 },
  { id: "standard", name: "Standard Plan", price: 2000 },
  { id: "premium", name: "Premium Plan", price: 3000 },
];

const trainers = [
  { id: "no-trainer", name: "No Trainer Assigned" },
  { id: "rahul", name: "Rahul Sharma" },
  { id: "priya", name: "Priya Mehta" },
  { id: "aman", name: "Aman Verma" },
];

const durations = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "12", label: "1 Year" },
];

const fitnessGoals = [
  "Weight Loss",
  "Weight Gain",
  "Muscle Building",
  "General Fitness",
  "Athletic Training",
];

// Give the <form> a stable id so buttons rendered OUTSIDE this component
// (e.g. the header "Save Member" button in the server component) can submit
// it via the HTML `form="..."` attribute, without needing access to
// react-hook-form's handleSubmit.
export const MEMBER_FORM_ID = "add-member-form";

export default function MemberForm() {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      duration: "6",
    },
  });

  const selectedPlan = watch("membershipPlan");
  const selectedDuration = watch("duration") || "6";
  const startDate = watch("startDate");
  const joiningFee = watch("joiningFee") || "0";
  const discount = watch("discount") || "0";
  const weight = watch("weight");
  const height = watch("height");

  // Calculate BMI
  const calculateBMI = () => {
    if (!weight || !height) return "";
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    return (w / (h * h)).toFixed(1);
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    const plan = membershipPlans.find((p) => p.id === selectedPlan);
    if (!plan) return "₹0";
    const total = plan.price * parseInt(selectedDuration);
    return `₹${total}`;
  };

  // Calculate final amount
  const calculateFinalAmount = () => {
    const plan = membershipPlans.find((p) => p.id === selectedPlan);
    if (!plan) return "₹0";
    const total = plan.price * parseInt(selectedDuration);
    const jf = parseFloat(joiningFee) || 0;
    const disc = parseFloat(discount) || 0;
    const finalAmount = total + jf - disc;
    return `₹${finalAmount}`;
  };

  // Calculate end date
  const calculateEndDate = () => {
    if (!startDate) return "";
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + parseInt(selectedDuration));
    return start.toISOString().split("T")[0];
  };

  const onSubmit = (data: MemberFormData) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      reset();
      setUploadedPhoto(null);
    }, 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-sm w-full space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-card-foreground">
                Member Created Successfully
              </h3>
              <p className="text-sm text-muted-foreground">
                The member has been added to PowerFlex Gym. Invite has been sent
                via SMS.
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <Button variant="outline" className={`flex-1 ${bigSquareButton}`}>
                View Member
              </Button>
              <Button className={`flex-1 ${bigSquareButton}`}>
                Add Another
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        id={MEMBER_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row gap-6 lg:gap-8"
      >
        {/* Left Column - Form */}
        <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
          {/* Member Information */}
          <SectionCard title="Member Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                placeholder="Rohan Sharma"
                required
                {...register("fullName")}
                error={errors.fullName}
              />
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Phone Number<span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex gap-2">
                  <select className="w-18 sm:w-20 shrink-0 px-2 py-2 rounded-lg border border-border bg-background">
                    <option>🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("phoneNumber")}
                  />
                </div>
                {errors.phoneNumber && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="rohan@gmail.com"
                {...register("email")}
                error={errors.email}
              />
              <FormInput
                label="Date of Birth"
                type="date"
                {...register("dateOfBirth")}
                error={errors.dateOfBirth}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                {...register("gender")}
              />
              <FormInput
                label="Occupation"
                placeholder="Software Engineer"
                {...register("occupation")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Blood Group"
                options={[
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                ]}
                {...register("bloodGroup")}
              />
              <FormInput
                label="Address"
                placeholder="2218 Baker Street, London"
                {...register("address")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="City"
                placeholder="London"
                {...register("city")}
              />
              <FormInput
                label="State"
                placeholder="England"
                {...register("state")}
              />
              <FormInput
                label="PIN Code"
                placeholder="NW1 6XE"
                {...register("pinCode")}
              />
            </div>
          </SectionCard>

          {/* Membership Details */}
          <SectionCard title="Membership Details" icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Membership Plan"
                options={membershipPlans}
                required
                {...register("membershipPlan")}
                error={errors.membershipPlan}
              />
              <FormSelect
                label="Trainer"
                options={trainers}
                {...register("trainer")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                type="date"
                required
                {...register("startDate")}
                error={errors.startDate}
              />
              <FormSelect
                label="Duration"
                options={durations}
                {...register("duration")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="End Date"
                type="date"
                disabled
                value={calculateEndDate()}
              />
              <FormInput
                label="Joining Fee"
                type="number"
                placeholder="₹500"
                {...register("joiningFee")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Discount"
                type="number"
                placeholder="₹200"
                {...register("discount")}
              />
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Total Amount
                </label>
                <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                  <span className="text-sm font-semibold text-foreground">
                    {calculateTotalAmount()}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Payment Status"
                options={[
                  { value: "Paid", label: "Paid" },
                  { value: "Pending", label: "Pending" },
                  { value: "Partial", label: "Partial" },
                ]}
                {...register("paymentStatus")}
              />
              <FormSelect
                label="Payment Method"
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "UPI", label: "UPI" },
                  { value: "Card", label: "Card" },
                  { value: "Bank Transfer", label: "Bank Transfer" },
                ]}
                {...register("paymentMethod")}
              />
            </div>
          </SectionCard>

          {/* Physical Information */}
          <SectionCard title="Physical Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputWithUnit
                label="Height"
                unit="cm"
                type="number"
                placeholder="175"
                {...register("height")}
              />
              <FormInputWithUnit
                label="Weight"
                unit="kg"
                type="number"
                placeholder="70"
                {...register("weight")}
              />
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  BMI (Auto)
                </label>
                <div className="px-3 py-2 rounded-lg border border-border bg-muted">
                  <span className="text-sm font-semibold text-foreground">
                    {calculateBMI() || "—"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <FormSelect
                label="Fitness Goal"
                options={fitnessGoals.map((goal) => ({
                  value: goal,
                  label: goal,
                }))}
                {...register("fitnessGoal")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Medical Conditions"
                placeholder="None"
                {...register("medicalConditions")}
              />
              <FormInput
                label="Allergies"
                placeholder="Peanuts"
                {...register("allergies")}
              />
            </div>
            <FormTextarea
              label="Notes"
              placeholder="Prefers morning sessions."
              {...register("physicalNotes")}
            />
          </SectionCard>

          {/* Emergency Contact */}
          <SectionCard title="Emergency Contact" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Emergency Contact Name"
                placeholder="Neha Sharma"
                {...register("emergencyContactName")}
              />
              <FormSelect
                label="Relationship"
                options={[
                  { value: "Mother", label: "Mother" },
                  { value: "Father", label: "Father" },
                  { value: "Sister", label: "Sister" },
                  { value: "Brother", label: "Brother" },
                  { value: "Spouse", label: "Spouse" },
                  { value: "Other", label: "Other" },
                ]}
                {...register("emergencyContactRelationship")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select className="w-16 shrink-0 px-2 py-2 rounded-lg border border-border bg-background">
                    <option>🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="91234 56789"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("emergencyContactPhone")}
                  />
                </div>
              </div>
              <FormInput
                label="Address"
                placeholder="2218 Baker Street, London"
                {...register("emergencyContactAddress")}
              />
            </div>
          </SectionCard>

          {/* Additional Notes */}
          <SectionCard title="Additional Notes" icon={Mail}>
            <FormTextarea
              label="Notes"
              placeholder="Additional information about the member..."
              {...register("additionalNotes")}
            />
          </SectionCard>

          {/* Footer Actions */}
          <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button variant="ghost" className={bigSquareButton}>
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
            <div className="flex flex-row gap-2 sm:gap-3">
              <Button variant="outline" className={bigSquareButton}>
                Cancel
              </Button>
              <Button variant="outline" className={bigSquareButton}>
                Save Draft
              </Button>
              <Button type="submit" className={bigSquareButton}>
                Create Member
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Upload Photo */}
            <SectionCard title="Upload Photo" icon={Camera}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/50"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  {uploadedPhoto ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={uploadedPhoto}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary/20"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change photo
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Upload Member Photo
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, JPEG (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </SectionCard>

            {/* Membership Summary */}
            <SectionCard title="Membership Summary" icon={Calendar}>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium text-right">
                    {membershipPlans.find((p) => p.id === selectedPlan)?.name ||
                      "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedDuration} Months</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Joining Date</span>
                  <span className="font-medium">
                    {startDate ? new Date(startDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Expiry Date</span>
                  <span className="font-medium">
                    {calculateEndDate()
                      ? new Date(calculateEndDate()).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Trainer</span>
                  <span className="font-medium text-right">
                    {trainers.find((t) => t.id === watch("trainer"))?.name ||
                      "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Joining Fee</span>
                  <span className="font-medium">₹{joiningFee}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Plan Amount</span>
                  <span className="font-medium">{calculateTotalAmount()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-destructive">
                    -₹{discount}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-foreground font-semibold">
                    Final Amount
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {calculateFinalAmount()}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 space-y-3">
              <div>
                <p className="font-semibold text-sm text-foreground mb-3">
                  Quick Tips
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Email will be used for login.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Members can update profile later.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Emergency contact is recommended.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Trainer can be assigned later.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Membership dates determine expiry.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
