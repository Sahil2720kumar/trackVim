"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  X,
  Crown,
  Star,
  Zap,
  Trophy,
  Shield,
  Dumbbell,
  CheckCircle2,
  Trash2,
  Package,
  IndianRupee,
  Calendar,
  Users,
  Eye,
  StickyNote,
  ClipboardList,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";

// Validation schema
const membershipPlanSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  planCategory: z.string().optional(),
  planColor: z.string().optional(),
  planIcon: z.string().optional(),
  planPrice: z.string().min(1, "Plan price is required"),
  joiningFee: z.string().optional(),
  securityDeposit: z.string().optional(),
  pricingType: z.enum(["Fixed", "Recurring"]).optional(),
  discountType: z.enum(["Percentage", "Amount"]).optional(),
  discountValue: z.string().optional(),
  membershipDuration: z.string().min(1, "Membership duration is required"),
  validityStarts: z.string().optional(),
  gracePeriod: z.string().optional(),
  allowFreeze: z.boolean().optional(),
  maxFreezeDays: z.string().optional(),
  selectedFeatures: z.array(z.string()).optional(),
  customFeatures: z.array(z.string()).optional(),
  minimumAge: z.string().min(1, "Minimum age is required"),
  maximumAge: z.string().min(1, "Maximum age is required"),
  maxActiveMembers: z.string().optional(),
  enrollmentMode: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  visibility: z.string().min(1, "Visibility is required"),
  markFeatured: z.boolean().optional(),
  additionalNotes: z.string().optional(),
});

type MembershipPlanFormData = z.infer<typeof membershipPlanSchema>;

const PLAN_CATEGORIES = [
  "Standard",
  "Premium",
  "VIP",
  "Student",
  "Corporate",
  "Personal Training",
].map((c) => ({ value: c, label: c }));

const PLAN_COLORS = [
  { name: "Purple", value: "#8b5cf6", hex: "bg-purple-500" },
  { name: "Blue", value: "#3b82f6", hex: "bg-blue-500" },
  { name: "Green", value: "#10b981", hex: "bg-emerald-500" },
  { name: "Orange", value: "#f97316", hex: "bg-orange-500" },
  { name: "Red", value: "#ef4444", hex: "bg-red-500" },
  { name: "Slate", value: "#64748b", hex: "bg-slate-500" },
];

const PLAN_ICONS = [
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Crown", icon: Crown },
  { name: "Star", icon: Star },
  { name: "Zap", icon: Zap },
  { name: "Trophy", icon: Trophy },
  { name: "Shield", icon: Shield },
];

const PREDEFINED_FEATURES = [
  "Unlimited Gym Access",
  "Locker Facility",
  "Steam Bath",
  "Sauna",
  "Personal Trainer",
  "Workout Plan",
  "Diet Plan",
  "Group Classes",
  "Yoga Classes",
  "CrossFit",
  "Cardio Zone",
  "Parking",
  "Protein Discount",
  "Guest Pass",
  "Mobile App Access",
  "Body Composition Analysis",
  "Free Wi-Fi",
  "Air Conditioned Gym",
];

const DURATION_OPTIONS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
  "Custom",
].map((v) => ({ value: v, label: v }));
const VALIDITY_OPTIONS = [
  "Immediately",
  "From Joining Date",
  "Custom Date",
].map((v) => ({ value: v, label: v }));
const GRACE_PERIOD_OPTIONS = ["0 Days", "7 Days", "15 Days", "30 Days"].map(
  (v) => ({ value: v, label: v }),
);
const ENROLLMENT_MODES = ["Open", "Invite Only"].map((v) => ({
  value: v,
  label: v,
}));
const CANCELLATION_POLICIES = ["Allowed", "Not Allowed"].map((v) => ({
  value: v,
  label: v,
}));
const STATUS_OPTIONS = ["Active", "Draft", "Hidden"].map((v) => ({
  value: v,
  label: v,
}));
const VISIBILITY_OPTIONS = ["Visible to Everyone", "Visible Only to Staff"].map(
  (v) => ({ value: v, label: v }),
);
const PRICING_TYPES = ["Fixed", "Recurring"].map((v) => ({
  value: v,
  label: v,
}));
const DISCOUNT_TYPES = ["Percentage", "Amount"].map((v) => ({
  value: v,
  label: v,
}));

const defaultValues: MembershipPlanFormData = {
  planName: "Premium Membership",
  shortDescription:
    "Access to all premium facilities and exclusive member benefits.",
  planCategory: "Premium",
  planColor: "#8b5cf6",
  planIcon: "Crown",
  planPrice: "2000",
  joiningFee: "500",
  securityDeposit: "0",
  pricingType: "Recurring",
  discountType: "Percentage",
  discountValue: "10",
  membershipDuration: "12 Months",
  validityStarts: "From Joining Date",
  gracePeriod: "7 Days",
  allowFreeze: true,
  maxFreezeDays: "15",
  selectedFeatures: [
    "Unlimited Gym Access",
    "Locker Facility",
    "Steam Bath",
    "Personal Trainer",
    "Workout Plan",
    "Diet Plan",
  ],
  customFeatures: [
    "Nutrition Consultation",
    "Swimming Pool",
    "Zumba Classes",
    "Juice Bar Discount",
  ],
  minimumAge: "18",
  maximumAge: "60",
  maxActiveMembers: "200",
  enrollmentMode: "Open",
  cancellationPolicy: "Allowed",
  status: "Active",
  visibility: "Visible to Everyone",
  markFeatured: true,
  additionalNotes: "",
};

// Stable id so the header's "Save Plan" button — rendered outside this
// component in the server component — can submit this form via the HTML
// `form="..."` attribute, without needing access to react-hook-form's
// handleSubmit.
export const MEMBERSHIP_PLAN_FORM_ID = "create-membership-plan-form";

export default function MembershipPlanForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [customFeatureInput, setCustomFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<MembershipPlanFormData>({
    resolver: zodResolver(membershipPlanSchema),
    defaultValues,
  });

  // Watched fields — anything that drives the live preview / summary,
  // or that's controlled by a non-native input (swatches, toggles, chips).
  const planName = watch("planName");
  const planCategory = watch("planCategory");
  const planColor = watch("planColor") || "#8b5cf6";
  const planIcon = watch("planIcon") || "Crown";
  const planPrice = watch("planPrice");
  const joiningFee = watch("joiningFee");
  const discountType = watch("discountType");
  const membershipDuration = watch("membershipDuration");
  const allowFreeze = watch("allowFreeze");
  const maxFreezeDays = watch("maxFreezeDays");
  const selectedFeatures = watch("selectedFeatures") || [];
  const customFeatures = watch("customFeatures") || [];
  const minimumAge = watch("minimumAge");
  const maximumAge = watch("maximumAge");
  const status = watch("status");
  const visibility = watch("visibility");
  const markFeatured = watch("markFeatured");
  const additionalNotes = watch("additionalNotes") || "";

  // Feature handling
  const toggleFeature = (feature: string) => {
    const next = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    setValue("selectedFeatures", next, { shouldValidate: true });
  };

  const addCustomFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (
      trimmed &&
      !customFeatures.includes(trimmed) &&
      !selectedFeatures.includes(trimmed)
    ) {
      setValue("customFeatures", [...customFeatures, trimmed]);
      setCustomFeatureInput("");
    }
  };

  const removeCustomFeature = (feature: string) => {
    setValue(
      "customFeatures",
      customFeatures.filter((f) => f !== feature),
    );
  };

  // Calculate completion progress
  const allFeatures = [...selectedFeatures, ...customFeatures];
  const completionChecks = [
    !!planName,
    !!watch("shortDescription"),
    !!planPrice,
    !!membershipDuration,
    allFeatures.length > 0,
    !!minimumAge,
    !!maximumAge,
    !!status,
    !!visibility,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  // Get selected icon component
  const SelectedIcon =
    PLAN_ICONS.find((i) => i.name === planIcon)?.icon || Crown;

  const onSubmit = (data: MembershipPlanFormData) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      reset(defaultValues);
      setCustomFeatureInput("");
    }, 3000);
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
                Plan Created Successfully
              </h3>
              <p className="text-sm text-muted-foreground">
                "{planName}" is now available for member enrollment.
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <Button variant="outline" className={`flex-1 ${bigSquareButton}`}>
                View Plan
              </Button>
              <Button className={`flex-1 ${bigSquareButton}`}>
                Add Another
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        id={MEMBERSHIP_PLAN_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row gap-6 lg:gap-8"
      >
        {/* Left Column - Form */}
        <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
          {/* Basic Information */}
          <SectionCard title="Basic Information" icon={Package}>
            <FormInput
              label="Plan Name"
              placeholder="e.g. Premium Membership"
              required
              {...register("planName")}
              error={errors.planName}
            />
            <FormTextarea
              label="Short Description"
              placeholder="Describe the benefits of this plan..."
              required
              {...register("shortDescription")}
              error={errors.shortDescription}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Plan Category"
                options={PLAN_CATEGORIES}
                {...register("planCategory")}
              />
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-sm font-medium text-foreground">
                  Plan Color
                </label>
                <div className="flex items-center gap-2 py-1">
                  {PLAN_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setValue("planColor", color.value, {
                          shouldValidate: true,
                        })
                      }
                      className={`w-8 h-8 rounded-lg transition-all ${color.hex} ${
                        planColor === color.value
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "hover:scale-110"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-sm font-medium text-foreground">
                Plan Icon
              </label>
              <div className="flex items-center gap-2 flex-wrap py-1">
                {PLAN_ICONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        setValue("planIcon", item.name, {
                          shouldValidate: true,
                        })
                      }
                      className={`w-10 h-10 rounded-lg border transition-colors flex items-center justify-center ${
                        planIcon === item.name
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      title={item.name}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* Pricing */}
          <SectionCard title="Pricing" icon={IndianRupee}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Plan Price"
                type="number"
                placeholder="₹2000"
                required
                {...register("planPrice")}
                error={errors.planPrice}
              />
              <FormInput
                label="Joining Fee"
                type="number"
                placeholder="₹0"
                {...register("joiningFee")}
              />
              <FormInput
                label="Security Deposit"
                type="number"
                placeholder="₹0"
                {...register("securityDeposit")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Pricing Type"
                options={PRICING_TYPES}
                {...register("pricingType")}
              />
              <FormSelect
                label="Discount Type"
                options={DISCOUNT_TYPES}
                {...register("discountType")}
              />
            </div>
            <div>
              <FormInput
                label={`Discount ${discountType === "Percentage" ? "%" : "Amount"}`}
                type="number"
                placeholder="0"
                {...register("discountValue")}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Leave empty if no discount is available.
              </p>
            </div>
          </SectionCard>

          {/* Duration & Validity */}
          <SectionCard title="Duration & Validity" icon={Calendar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Membership Duration"
                options={DURATION_OPTIONS}
                required
                {...register("membershipDuration")}
                error={errors.membershipDuration}
              />
              <FormSelect
                label="Validity Starts"
                options={VALIDITY_OPTIONS}
                {...register("validityStarts")}
              />
            </div>
            <FormSelect
              label="Grace Period"
              options={GRACE_PERIOD_OPTIONS}
              {...register("gracePeriod")}
            />
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="pr-4">
                <label className="text-sm font-medium text-foreground">
                  Allow Membership Freeze
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Members can temporarily pause their membership without losing
                  remaining validity.
                </p>
              </div>
              <Switch
                checked={allowFreeze}
                onCheckedChange={(checked) => setValue("allowFreeze", checked)}
              />
            </div>
            {allowFreeze && (
              <FormInput
                label="Maximum Freeze Days"
                type="number"
                placeholder="15"
                {...register("maxFreezeDays")}
              />
            )}
          </SectionCard>

          {/* Plan Features */}
          <SectionCard
            title="Plan Features"
            icon={CheckCircle2}
            badge={
              <Badge variant="secondary" className="shrink-0">
                {allFeatures.length} Included
              </Badge>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PREDEFINED_FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                    selectedFeatures.includes(feature)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                placeholder="Add a custom feature..."
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                size="icon"
                onClick={addCustomFeature}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {customFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-sm">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeCustomFeature(feature)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Enrollment Rules */}
          <SectionCard title="Enrollment Rules" icon={Users}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Minimum Age (Years)"
                type="number"
                placeholder="18"
                required
                {...register("minimumAge")}
                error={errors.minimumAge}
              />
              <FormInput
                label="Maximum Age (Years)"
                type="number"
                placeholder="60"
                required
                {...register("maximumAge")}
                error={errors.maximumAge}
              />
              <FormInput
                label="Maximum Active Members"
                type="number"
                placeholder="200"
                {...register("maxActiveMembers")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Enrollment Mode"
                options={ENROLLMENT_MODES}
                {...register("enrollmentMode")}
              />
              <FormSelect
                label="Cancellation Policy"
                options={CANCELLATION_POLICIES}
                {...register("cancellationPolicy")}
              />
            </div>
          </SectionCard>

          {/* Visibility */}
          <SectionCard title="Visibility" icon={Eye}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Status"
                options={STATUS_OPTIONS}
                required
                {...register("status")}
                error={errors.status}
              />
              <FormSelect
                label="Visibility"
                options={VISIBILITY_OPTIONS}
                required
                {...register("visibility")}
                error={errors.visibility}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="pr-4">
                <label className="text-sm font-medium text-foreground">
                  Mark as Featured
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Featured plans appear first during member enrollment.
                </p>
              </div>
              <Switch
                checked={markFeatured}
                onCheckedChange={(checked) => setValue("markFeatured", checked)}
              />
            </div>
          </SectionCard>

          {/* Additional Notes */}
          <SectionCard title="Additional Notes" icon={StickyNote}>
            <FormTextarea
              label="Notes"
              placeholder="Add internal notes about this membership plan..."
              maxLength={500}
              {...register("additionalNotes")}
            />
            <p className="text-xs text-muted-foreground">
              {additionalNotes.length} / 500
            </p>
          </SectionCard>

          {/* Footer Actions */}
          <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className={bigSquareButton}
              onClick={() => {
                reset(defaultValues);
                setCustomFeatureInput("");
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
            <div className="flex flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className={bigSquareButton}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                className={bigSquareButton}
              >
                Save Draft
              </Button>
              <Button type="submit" className={bigSquareButton}>
                Create Membership Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Live Preview */}
            <SectionCard title="Live Preview" icon={Eye}>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: planColor }}
                >
                  <SelectedIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  {markFeatured && (
                    <Badge className="text-xs mb-1">Featured</Badge>
                  )}
                  <h4 className="font-semibold text-card-foreground truncate">
                    {planName || "Plan Name"}
                  </h4>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  ₹{planPrice || "0"}{" "}
                  <span className="text-sm text-muted-foreground">/Month</span>
                </p>
                {joiningFee && parseInt(joiningFee) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Joining Fee: ₹{joiningFee}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {planCategory}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {membershipDuration}
                </Badge>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Features
                </p>
                <div className=" space-y-1.5">
                  {allFeatures.slice(0, 8).map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {allFeatures.length > 8 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      + {allFeatures.length - 8} more features
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Plan Summary */}
            <SectionCard title="Plan Summary" icon={ClipboardList}>
              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="Plan Price"
                  value={`₹${planPrice || "0"}/Month`}
                />
                {joiningFee && parseInt(joiningFee) > 0 && (
                  <SummaryRow label="Joining Fee" value={`₹${joiningFee}`} />
                )}
                <SummaryRow label="Duration" value={membershipDuration} />
                <SummaryRow
                  label="Selected Features"
                  value={allFeatures.length}
                />
                {allowFreeze && (
                  <SummaryRow
                    label="Freeze Allowed"
                    value={`Yes (${maxFreezeDays} days)`}
                  />
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={status === "Active" ? "default" : "secondary"}
                  >
                    {status}
                  </Badge>
                </div>
              </div>
            </SectionCard>

            {/* Completion Progress */}
            <SectionCard title="Completion Progress" icon={Gauge}>
              <Progress value={completionPercent} className="h-2" />
              <p className="text-sm font-medium text-foreground">
                {completionPercent}% Complete
              </p>
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
                    <span>Featured plans get shown first at enrollment.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Draft plans stay hidden from members.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Grace periods reduce accidental lapses.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Custom features help plans stand out.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Age limits are optional but recommended.</span>
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