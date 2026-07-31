"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeIndianRupee,
  Building2,
  Check,
  Dumbbell,
  FileText,
  Image as ImageIcon,
  Images,
  Info,
  Layers,
  Plus,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";
import { CreateGymInput, createGymSchema } from "@/db/validators";
import { STATE_OPTIONS } from "@/constants/profile-options";
import {
  AMENITY_OPTIONS,
  COUNTRY_OPTIONS,
  ROOM_TYPES,
  SAC_CODE_OPTIONS,
} from "@/constants/gym-options";
import { createGymAction } from "@/actions/owner.action";
import {
  SingleImageUpload,
  DropZone,
  useSingleUpload,
  useMultiUpload,
} from "@/components/ImageUpload"; // adjust path as needed
import { toast } from "sonner";
import { buildGymFormData } from "@/lib/extractFields";
import { useClerk } from "@clerk/nextjs";

const MAX_GALLERY_IMAGES = 10;

export default function RegisterGymForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { session } = useClerk(); // add this
  // ── Upload state via react-dropzone-backed hooks ──
  const logo = useSingleUpload();
  const paymentQr = useSingleUpload();
  const gallery = useMultiUpload(MAX_GALLERY_IMAGES);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateGymInput>({
    resolver: zodResolver(createGymSchema),
    defaultValues: { gstRegistered: false },
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({ control, name: "equipment" });

  const gstRegistered = watch("gstRegistered");
  const amenities = watch("amenities");

  // ── Amenity toggle ──
  const toggleAmenity = (value: string, checked: boolean) => {
    const current = amenities ?? [];
    setValue(
      "amenities",
      checked ? [...current, value] : current.filter((a) => a !== value),
      { shouldDirty: true },
    );
  };

  // ── Submit via useTransition ──
  const onSubmit = (data: CreateGymInput) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await createGymAction(
          buildGymFormData(data, logo.file, paymentQr.file, gallery.files),
        );
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        // Force Clerk to reload the session so middleware sees
        // the new publicMetadata (onboardingComplete: true, role: "member")
        await session?.reload();

        toast.success("Gym registered successfully");
        router.push("/owner/dashboard");
      } catch (error) {
        console.error("Error registering gym:", error);
        toast.error("Error registering gym. Please try again.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}
      className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8"
    >
      <div className="flex-1 min-w-0 space-y-6">
        {/* ── 1. Gym Information ── */}
        <SectionCard title="Gym Information" icon={Building2}>
          <FormInput
            label="Gym Name"
            placeholder="Enter gym name"
            required
            {...register("name")}
            error={errors.name}
          />
          <FormInput
            label="Gym Short Name"
            placeholder="Enter gym short name"
            required
            {...register("gymShortName")}
            error={errors.gymShortName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Contact Phone"
              placeholder="+91 98765 43210"
              required
              {...register("contactPhone")}
              error={errors.contactPhone}
            />
          </div>
        </SectionCard>

        {/* ── 2. Gym Logo ── */}
        <SectionCard title="Gym Branding" icon={ImageIcon}>
          <SingleImageUpload
            label="Gym Logo"
            preview={logo.preview}
            error={logo.error}
            hint="PNG, JPG, JPEG up to 2 MB"
            previewClass="h-32 w-32"
            previewAlt="Gym logo"
            dropzone={logo.dropzone}
            onRemove={logo.clear}
            removeLabel="Remove Logo"
          />
          <p className="text-xs text-muted-foreground">
            Recommended size: 512 × 512 pixels.
          </p>
        </SectionCard>

        {/* ── 3. Gym Gallery ── */}
        <SectionCard title="Gym Gallery" icon={Images}>
          <p className="text-xs text-muted-foreground -mt-2">
            Upload photos of your gym — equipment, ambience, facilities — to
            help prospective members decide before joining.
          </p>

          <DropZone
            dropzone={gallery.dropzone}
            hint="PNG, JPG, WEBP • Up to 10 images • Recommended 1920 × 1080"
          />

          {gallery.error && (
            <p className="text-xs text-destructive" role="alert">
              {gallery.error}
            </p>
          )}

          {gallery.previews.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {gallery.previews.length} / {MAX_GALLERY_IMAGES} uploaded — the
                first image is used as the cover photo
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.previews.map((src, i) => (
                  <div
                    key={src}
                    className="relative group aspect-video rounded-lg overflow-hidden border border-border"
                  >
                    <Image
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => gallery.remove(i)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Shown to prospective members</AlertTitle>
            <AlertDescription>
              Gallery images appear on your gym&apos;s public profile in the
              TrackVim app.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* ── 4. Facilities & Equipment ── */}
        <SectionCard title="Gym Facilities & Equipment" icon={Dumbbell}>
          <p className="text-xs text-muted-foreground -mt-2">
            Help prospective members choose your gym wisely — list your space,
            rooms, equipment, and anything else that sets you apart.
          </p>

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

          {/* Room types */}
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
                        setValue(room.boolField, checked, { shouldDirty: true })
                      }
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {room.label}
                    </span>
                    {isEnabled && (
                      <FormInput
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        {...register(room.countField)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities */}
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

          {/* Equipment */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Equipment</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => appendEquipment({ name: "", quantity: 0 })}
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
                      <FormInput
                        type="text"
                        placeholder="Equipment name (e.g., Treadmill)"
                        {...register(`equipment.${index}.name` as const)}
                      />
                      {errors.equipment?.[index]?.name && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.equipment[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <FormInput
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
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

          <FormTextarea
            label="Other Information for Members"
            placeholder="Trial policies, towel/locker service, parking, timings, rules, etc."
            rows={4}
            {...register("facilityNotes")}
          />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Shown to prospective members</AlertTitle>
            <AlertDescription>
              This section appears on your gym&apos;s public profile in the
              TrackVim app.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* ── 5. Business Information ── */}
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

        {/* ── 6. Payment QR Code ── */}
        <SectionCard title="Payment QR Code" icon={QrCode}>
          <p className="text-xs text-muted-foreground -mt-2">
            Upload your UPI or payment QR code. Members will see this when
            paying for memberships, so they can scan and pay you directly.
          </p>

          <SingleImageUpload
            label="Payment QR"
            preview={paymentQr.preview}
            error={paymentQr.error}
            hint="PNG, JPG, JPEG up to 2 MB"
            previewClass="h-40 w-40 bg-white"
            previewAlt="Payment QR code"
            dropzone={paymentQr.dropzone}
            onRemove={paymentQr.clear}
            removeLabel="Remove QR Code"
          />
          <p className="text-xs text-muted-foreground">
            Make sure the QR is clear and unobstructed — a blurry scan means a
            failed payment.
          </p>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Optional, but recommended</AlertTitle>
            <AlertDescription>
              You can add or replace this anytime from gym settings. Without it,
              members won&apos;t be able to pay you directly via QR.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* ── 7. GST Information ── */}
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

        {/* ── Submit ── */}
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className={bigSquareButton}
          >
            {isPending ? "Registering…" : "Register Gym"}
          </Button>
        </div>
      </div>
    </form>
  );
}
