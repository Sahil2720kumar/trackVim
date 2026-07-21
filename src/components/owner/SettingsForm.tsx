"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Check,
  Copy,
  Dumbbell,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  X,
  BadgeIndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
const equipmentItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Equipment name is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Enter a whole number"),
});

const settingsSchema = z
  .object({
    gymName: z.string().min(1, "Gym name is required"),
    gymShortName: z.string().max(10).optional(),
    gymDescription: z.string().optional(),
    contactEmail: z
      .string()
      .min(1, "Contact email is required")
      .email("Enter a valid email"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    website: z.string().optional(),

    ownerName: z.string().min(1, "Owner name is required"),
    businessName: z.string().min(1, "Business name is required"),
    businessEmail: z
      .string()
      .min(1, "Business email is required")
      .email("Enter a valid email"),
    businessPhone: z.string().min(1, "Business phone is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),

    gstRegistered: z.boolean(),
    gstin: z.string().optional(),
    legalBusinessName: z.string().optional(),
    billingAddress: z.string().optional(),
    gstState: z.string().optional(),
    stateCode: z.string().optional(),
    placeOfSupply: z.string().optional(),
    sacCode: z.string().optional(),

    // Facilities & Equipment
    numberOfFloors: z
      .string()
      .min(1, "Required")
      .regex(/^\d+$/, "Enter a whole number"),
    numberOfRooms: z
      .string()
      .min(1, "Required")
      .regex(/^\d+$/, "Enter a whole number"),
    hasWashroom: z.boolean(),
    washroomCount: z.string().optional(),
    hasSaunaRoom: z.boolean(),
    saunaRoomCount: z.string().optional(),
    hasSteamRoom: z.boolean(),
    steamRoomCount: z.string().optional(),
    hasShowerRoom: z.boolean(),
    showerRoomCount: z.string().optional(),
    hasLockerRoom: z.boolean(),
    lockerRoomCount: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    equipment: z.array(equipmentItemSchema).default([]),
    facilityNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.gstRegistered) return;
    const required: (keyof typeof data)[] = [
      "gstin",
      "legalBusinessName",
      "billingAddress",
      "gstState",
      "stateCode",
      "placeOfSupply",
      "sacCode",
    ];
    for (const field of required) {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Required when GST registered",
        });
      }
    }
  });

type SettingsFormData = z.infer<typeof settingsSchema>;

// ---------------------------------------------------------------------
// Static options
// ---------------------------------------------------------------------
const STATE_OPTIONS = [
  "Assam",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
].map((v) => ({ value: v, label: v }));
const COUNTRY_OPTIONS = [
  "India",
  "United States",
  "Canada",
  "United Kingdom",
].map((v) => ({ value: v, label: v }));
const SAC_CODE_OPTIONS = [
  { value: "999713 (Fitness Services)", label: "999713 (Fitness Services)" },
  { value: "999714 (Other Services)", label: "999714 (Other Services)" },
];

// Amenities / offerings a gym can advertise to prospective members
const AMENITY_OPTIONS = [
  "Personal Training",
  "Group Classes",
  "Cardio Zone",
  "Free Weights Area",
  "CrossFit Zone",
  "Yoga Studio",
  "Swimming Pool",
  "Nutrition Counseling",
  "Juice Bar",
  "Parking",
  "WiFi",
  "Air Conditioning",
  "Childcare",
  "Physiotherapy",
];

// Room-type toggles: label, the boolean field, and its paired count field
const ROOM_TYPES: {
  label: string;
  boolField: keyof SettingsFormData;
  countField: keyof SettingsFormData;
}[] = [
  { label: "Washroom", boolField: "hasWashroom", countField: "washroomCount" },
  {
    label: "Sauna Room",
    boolField: "hasSaunaRoom",
    countField: "saunaRoomCount",
  },
  {
    label: "Steam Room",
    boolField: "hasSteamRoom",
    countField: "steamRoomCount",
  },
  {
    label: "Shower Room",
    boolField: "hasShowerRoom",
    countField: "showerRoomCount",
  },
  {
    label: "Locker Room",
    boolField: "hasLockerRoom",
    countField: "lockerRoomCount",
  },
];

const GYM_JOIN_CODE = "Q8K7PW"; // permanent, not editable via the form

const defaultValues: SettingsFormData = {
  gymName: "PowerFlex Gym",
  gymShortName: "PFG",
  gymDescription:
    "A premium fitness center committed to helping members achieve their health and fitness goals.",
  contactEmail: "contact@powerflexgym.com",
  contactPhone: "+91 98765 43210",
  website: "https://www.powerflexgym.com",

  ownerName: "Sahil Kumar",
  businessName: "PowerFlex Fitness Private Limited",
  businessEmail: "business@powerflexgym.com",
  businessPhone: "+91 98765 43210",
  addressLine1: "123, Fitness Street, Christian Basti",
  addressLine2: "Near Central Mall",
  city: "Guwahati",
  state: "Assam",
  postalCode: "781005",
  country: "India",

  gstRegistered: true,
  gstin: "18ABCDE1234F1Z5",
  legalBusinessName: "PowerFlex Fitness Private Limited",
  billingAddress:
    "123, Fitness Street, Christian Basti, Guwahati, Assam - 781005",
  gstState: "Assam",
  stateCode: "18",
  placeOfSupply: "Assam",
  sacCode: "999713 (Fitness Services)",

  numberOfFloors: "2",
  numberOfRooms: "6",
  hasWashroom: true,
  washroomCount: "4",
  hasSaunaRoom: true,
  saunaRoomCount: "1",
  hasSteamRoom: false,
  steamRoomCount: "",
  hasShowerRoom: true,
  showerRoomCount: "6",
  hasLockerRoom: true,
  lockerRoomCount: "2",
  amenities: ["Personal Training", "Group Classes", "Cardio Zone", "Parking"],
  equipment: [
    { id: crypto.randomUUID(), name: "Treadmill", quantity: "8" },
    { id: crypto.randomUUID(), name: "Dumbbells (5-50 kg set)", quantity: "1" },
    { id: crypto.randomUUID(), name: "Squat Rack", quantity: "4" },
  ],
  facilityNotes:
    "Free trial day available. Towels provided. Parking is on a first-come basis.",
};

// Give the <form> a stable id so buttons rendered OUTSIDE this component
// (e.g. the header "Save Changes" button in the page) can submit it via the
// HTML `form="..."` attribute without needing this to be a client component.
export const SETTINGS_FORM_ID = "gym-settings-form";

export default function SettingsForm() {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({ control, name: "equipment" });

  const gstRegistered = watch("gstRegistered");
  const gymName = watch("gymName");
  const gymShortName = watch("gymShortName");
  const businessName = watch("businessName");
  const amenities = watch("amenities");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GYM_JOIN_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
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
      handleLogoUpload({ target: input } as any);
    }
  };

  const removeLogo = () => setLogoImage(null);

  const toggleAmenity = (value: string, checked: boolean) => {
    const current = amenities || [];
    if (checked) {
      setValue("amenities", [...current, value], { shouldDirty: true });
    } else {
      setValue(
        "amenities",
        current.filter((a) => a !== value),
        { shouldDirty: true },
      );
    }
  };

  const initials = (gymShortName || gymName || "")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 3);

  // Completion progress
  const completionChecks = [
    !!gymName,
    !!businessName,
    !!watch("addressLine1"),
    !!watch("contactEmail"),
    !!watch("businessPhone"),
    !gstRegistered || !!watch("gstin"),
    !!logoImage,
    !!watch("numberOfFloors") && !!watch("numberOfRooms"),
    equipmentFields.length > 0,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  const onSubmit = (data: SettingsFormData) => {
    console.log("Settings payload:", data, { logo: logoImage });
    reset(data);
  };

  return (
    <form
      id={SETTINGS_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8"
    >
      <div className="flex-1 min-w-0 space-y-6">
        {/* Gym Information */}
        <SectionCard title="Gym Information" icon={Building2}>
          <FormInput
            label="Gym Name"
            placeholder="Enter gym name"
            required
            {...register("gymName")}
            error={errors.gymName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Gym Short Name"
              placeholder="e.g., PFG"
              maxLength={10}
              {...register("gymShortName")}
              error={errors.gymShortName}
            />
            <FormInput
              label="Website (Optional)"
              placeholder="https://www.gym.com"
              {...register("website")}
              error={errors.website}
            />
          </div>

          <FormTextarea
            label="Gym Description"
            placeholder="Describe your gym"
            rows={4}
            {...register("gymDescription")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Email"
              type="email"
              placeholder="contact@gym.com"
              required
              {...register("contactEmail")}
              error={errors.contactEmail}
            />
            <FormInput
              label="Contact Phone"
              placeholder="+91 98765 43210"
              required
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
          </div>

          {/* Gym Join Code — permanent, read-only */}
          <div className="mt-2 pt-4 border-t border-border space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Gym Join Code
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Share this code with members so they can join your gym.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Members can use this unique code to join your gym from the
                TrackVim mobile app.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
              <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                {GYM_JOIN_CODE}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This code is permanently assigned to your gym and cannot be
              changed.
            </p>
          </div>
        </SectionCard>

        {/* Gym Branding */}
        <SectionCard title="Gym Branding" icon={ImageIcon}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Gym Logo
            </label>

            {!logoImage ? (
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
                      htmlFor="logo-upload"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Click to upload or drag and drop
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, JPEG, SVG up to 2 MB
                    </p>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="secondary" size="sm" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      Browse
                    </label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={logoImage}
                    alt="Gym logo"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLogo}
                >
                  Remove Logo
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended size: 512 × 512 pixels.
            </p>
          </div>
        </SectionCard>

        {/* Gym Facilities & Equipment */}
        <SectionCard title="Gym Facilities & Equipment" icon={Dumbbell}>
          <p className="text-xs text-muted-foreground -mt-2">
            Help prospective members choose your gym wisely — list your space,
            rooms, equipment, and anything else that sets you apart.
          </p>

          {/* Floors & Rooms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Number of Floors"
              placeholder="e.g., 2"
              required
              {...register("numberOfFloors")}
              error={errors.numberOfFloors}
            />
            <FormInput
              label="Number of Rooms"
              placeholder="e.g., 6"
              required
              {...register("numberOfRooms")}
              error={errors.numberOfRooms}
            />
          </div>

          {/* Room types with counts */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                Room Types
              </p>
            </div>
            <div className="space-y-2">
              {ROOM_TYPES.map((room) => {
                const isEnabled = watch(room.boolField) as boolean;
                return (
                  <div
                    key={room.label}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        setValue(room.boolField, checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {room.label}
                    </span>
                    {isEnabled && (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-right"
                        {...register(room.countField)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities / What you offer */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-semibold text-foreground">
              Amenities &amp; What You Offer
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 rounded-lg border border-border p-2.5 cursor-pointer"
                >
                  <Checkbox
                    checked={amenities?.includes(amenity)}
                    onCheckedChange={(checked) =>
                      toggleAmenity(amenity, checked === true)
                    }
                  />
                  <span className="text-sm text-foreground">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment list */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Equipment</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  appendEquipment({
                    id: crypto.randomUUID(),
                    name: "",
                    quantity: "",
                  })
                }
              >
                <Plus className="w-3.5 h-3.5" />
                Add Equipment
              </Button>
            </div>

            {equipmentFields.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border p-4 text-center">
                No equipment added yet. Click &quot;Add Equipment&quot; to list
                what your gym has.
              </p>
            ) : (
              <div className="space-y-2">
                {equipmentFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Equipment name (e.g., Treadmill)"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        {...register(`equipment.${index}.name` as const)}
                      />
                      {errors.equipment?.[index]?.name && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.equipment[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-right"
                        {...register(`equipment.${index}.quantity` as const)}
                      />
                      {errors.equipment?.[index]?.quantity && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.equipment[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquipment(index)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other information for members */}
          <FormTextarea
            label="Other Information for Members"
            placeholder="Anything else that helps members choose your gym wisely — trial policies, towel/locker service, parking, timings, rules, etc."
            rows={4}
            {...register("facilityNotes")}
          />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Shown to prospective members</AlertTitle>
            <AlertDescription>
              This section appears on your gym&apos;s public profile in the
              TrackVim app so members can compare gyms before joining.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* Business Information */}
        <SectionCard title="Business Information" icon={BadgeIndianRupee}>
          <FormInput
            label="Owner Name"
            placeholder="Enter owner name"
            required
            {...register("ownerName")}
            error={errors.ownerName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Business Name"
              placeholder="Enter business name"
              required
              {...register("businessName")}
              error={errors.businessName}
            />
            <FormInput
              label="Business Email"
              type="email"
              placeholder="business@gym.com"
              required
              {...register("businessEmail")}
              error={errors.businessEmail}
            />
          </div>

          <FormInput
            label="Business Phone"
            placeholder="+91 98765 43210"
            required
            {...register("businessPhone")}
            error={errors.businessPhone}
          />

          <div className="space-y-4 pt-2">
            <FormInput
              label="Address Line 1"
              placeholder="Street address"
              required
              {...register("addressLine1")}
              error={errors.addressLine1}
            />
            <FormInput
              label="Address Line 2 (Optional)"
              placeholder="Apartment, suite, etc."
              {...register("addressLine2")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="City"
                placeholder="Enter city"
                required
                {...register("city")}
                error={errors.city}
              />
              <FormSelect
                label="State"
                options={STATE_OPTIONS}
                required
                {...register("state")}
                error={errors.state}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Postal Code"
                placeholder="781005"
                required
                {...register("postalCode")}
                error={errors.postalCode}
              />
              <FormSelect
                label="Country"
                options={COUNTRY_OPTIONS}
                required
                {...register("country")}
                error={errors.country}
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This information will appear on official receipts, invoices, and
              business documents.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* GST Information */}
        <SectionCard title="GST Information" icon={FileText}>
          <div className="flex items-center justify-between rounded-lg border border-border p-4 -mt-2">
            <div className="space-y-1 pr-4">
              <label className="text-sm font-medium text-foreground">
                GST Registered
              </label>
              <p className="text-xs text-muted-foreground">
                Configure GST details for tax invoices and official receipts.
              </p>
            </div>
            <Switch
              checked={gstRegistered}
              onCheckedChange={(checked) =>
                setValue("gstRegistered", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="ml-4 shrink-0"
            />
          </div>

          {gstRegistered ? (
            <div className="space-y-4">
              <FormInput
                label="GSTIN"
                placeholder="18ABCDE1234F1Z5"
                maxLength={15}
                required
                {...register("gstin")}
                error={errors.gstin}
              />
              <FormInput
                label="Legal Business Name"
                placeholder="Enter legal business name"
                required
                {...register("legalBusinessName")}
                error={errors.legalBusinessName}
              />
              <FormTextarea
                label="Billing Address"
                placeholder="Enter billing address"
                rows={2}
                required
                {...register("billingAddress")}
                error={errors.billingAddress}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="State"
                  options={STATE_OPTIONS}
                  required
                  {...register("gstState")}
                  error={errors.gstState}
                />
                <FormInput
                  label="State Code"
                  placeholder="18"
                  required
                  {...register("stateCode")}
                  error={errors.stateCode}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Place of Supply"
                  options={STATE_OPTIONS}
                  required
                  {...register("placeOfSupply")}
                  error={errors.placeOfSupply}
                />
                <FormSelect
                  label="SAC Code"
                  options={SAC_CODE_OPTIONS}
                  required
                  {...register("sacCode")}
                  error={errors.sacCode}
                />
              </div>

              <Alert>
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>GST Registered</AlertTitle>
                <AlertDescription>
                  GST details will automatically appear on invoices and tax
                  receipts.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>GST Not Registered</AlertTitle>
              <AlertDescription>
                Official payment receipts will be generated without GST
                information.
              </AlertDescription>
            </Alert>
          )}
        </SectionCard>

        {/* Action Buttons - Mobile */}
        <div className="flex flex-col gap-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty}
            className={bigSquareButton}
            onClick={() => reset(defaultValues)}
          >
            Reset Changes
          </Button>
          <Button type="submit" disabled={!isDirty} className={bigSquareButton}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Sticky Summary - Desktop */}
      <div className="hidden lg:block lg:w-80">
        <div className="sticky top-6 space-y-6">
          <SectionCard title="Settings Summary" icon={SettingsIcon}>
            {/* Logo / Gym Preview */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-border p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-card flex items-center justify-center">
                  {logoImage ? (
                    <Image
                      src={logoImage}
                      alt={gymName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{gymName}</p>
                  <p className="text-xs text-muted-foreground">
                    Code: {GYM_JOIN_CODE}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Summary */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground pb-1">
                Business Summary
              </p>
              <SummaryRow label="Business Name" value={businessName} />
              <SummaryRow
                label="GST Status"
                value={gstRegistered ? "Registered" : "Not Registered"}
                border={false}
              />
            </div>

            {/* Facilities Summary */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground pb-1">
                Facilities Summary
              </p>
              <SummaryRow label="Floors" value={watch("numberOfFloors")} />
              <SummaryRow label="Rooms" value={watch("numberOfRooms")} />
              <SummaryRow
                label="Equipment Items"
                value={String(equipmentFields.length)}
                border={false}
              />
            </div>

            {/* Completion Progress */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">
                Completion Progress
              </p>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
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
              disabled={!isDirty}
              className={bigSquareButton}
              form={SETTINGS_FORM_ID}
              onClick={() => reset(defaultValues)}
            >
              Reset Changes
            </Button>
            <Button
              type="submit"
              form={SETTINGS_FORM_ID}
              disabled={!isDirty}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
