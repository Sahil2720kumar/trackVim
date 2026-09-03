"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeIndianRupee,
  Building2,
  Check,
  Copy,
  Dumbbell,
  FileText,
  Image as ImageIcon,
  Images,
  Info,
  Layers,
  Plus,
  QrCode,
  Settings as SettingsIcon,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
  SummaryRow,
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
import {
  SingleImageUpload,
  DropZone,
  useSingleUpload,
  useMultiUpload,
} from "@/components/ImageUpload";
import { updateGymSettingsAction } from "@/actions/owner.action";

export const SETTINGS_FORM_ID = "gym-settings-form";

const MAX_GALLERY_IMAGES = 10;

// Row is snake_case; the form/schema is camelCase. Mirrors RegisterGymForm's
// field set exactly, since this is the same schema — only owner_id, code,
// timezone, and the billing-protected columns are left out (not editable
// here).
function toDefaultValues(
  gym: Record<string, unknown> | undefined,
): Partial<CreateGymInput> {
  if (!gym) return { gstRegistered: false };
  const str = (v: unknown) => (v == null ? "" : String(v));
  return {
    name: str(gym.name),
    gymShortName: str(gym.gym_short_name),
    gymDescription: str(gym.gym_description),
    website: str(gym.website),
    contactPhone: str(gym.contact_phone),

    ownerName: str(gym.owner_name),
    businessName: str(gym.business_name),
    businessEmail: str(gym.business_email),
    businessPhone: str(gym.business_phone),
    addressLine1: str(gym.address_line1),
    addressLine2: str(gym.address_line2),
    city: str(gym.city),
    state: str(gym.state),
    postalCode: str(gym.postal_code),
    country: (gym.country as string) ?? "India",

    gstRegistered: (gym.gst_registered as boolean) ?? false,
    gstin: str(gym.gstin),
    legalBusinessName: str(gym.legal_business_name),
    billingAddress: str(gym.billing_address),
    gstState: str(gym.gst_state),
    stateCode: str(gym.state_code),
    placeOfSupply: str(gym.place_of_supply),
    sacCode: str(gym.sac_code),

    numberOfFloors: str(gym.number_of_floors),
    numberOfRooms: str(gym.number_of_rooms),
    hasWashroom: (gym.has_washroom as boolean) ?? false,
    washroomCount: str(gym.washroom_count),
    hasSaunaRoom: (gym.has_sauna_room as boolean) ?? false,
    saunaRoomCount: str(gym.sauna_room_count),
    hasSteamRoom: (gym.has_steam_room as boolean) ?? false,
    steamRoomCount: str(gym.steam_room_count),
    hasShowerRoom: (gym.has_shower_room as boolean) ?? false,
    showerRoomCount: str(gym.shower_room_count),
    hasLockerRoom: (gym.has_locker_room as boolean) ?? false,
    lockerRoomCount: str(gym.locker_room_count),
    amenities: (gym.amenities as string[]) ?? [],
    equipment:
      (gym.equipment as { name: string; quantity: number | string }[])?.map(
        (e) => ({ name: e.name, quantity: String(e.quantity) }),
      ) ?? [],
    facilityNotes: str(gym.facility_notes),
  };
}

function getInitialGalleryUrls(
  gym: Record<string, unknown> | undefined,
): string[] {
  if (!gym) return [];
  if (Array.isArray(gym.gym_photos) && gym.gym_photos.length > 0) {
    const activePhotos = [...gym.gym_photos]
      .filter((p: any) => !p.deleted_at && p.status !== "Deleted")
      .sort((a: any, b: any) => {
        if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
    if (activePhotos.length > 0) {
      return activePhotos.map((p: any) => p.photo_url).filter(Boolean);
    }
  }
  if (Array.isArray(gym.gallery_urls) && gym.gallery_urls.length > 0) {
    return (gym.gallery_urls as string[]).filter(Boolean);
  }
  return [];
}

export default function SettingsForm({
  gymId,
  initialData,
}: {
  gymId: string;
  initialData?: Record<string, unknown>;
}) {
  const logo = useSingleUpload((initialData?.logo_url as string) || undefined);
  const paymentQr = useSingleUpload(
    (initialData?.payment_qr_url as string) || undefined,
  );

  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(
    () => getInitialGalleryUrls(initialData),
  );

  const gallery = useMultiUpload(
    Math.max(0, MAX_GALLERY_IMAGES - existingGalleryUrls.length),
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CreateGymInput>({
    resolver: zodResolver(createGymSchema),
    defaultValues: toDefaultValues(initialData),
  });

  // defaultValues only apply once, at mount — resync explicitly if
  // initialData shows up or changes after that (e.g. the query resolved
  // after first render).
  const initialDataKey = initialData ? JSON.stringify(initialData) : null;
  useEffect(() => {
    if (initialDataKey) {
      const data = JSON.parse(initialDataKey);
      reset(toDefaultValues(data));
      setExistingGalleryUrls(getInitialGalleryUrls(data));
      gallery.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDataKey, reset]);
  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({ control, name: "equipment" });

  const gstRegistered = watch("gstRegistered");
  const amenities = watch("amenities");
  const name = watch("name");
  const gymShortName = watch("gymShortName");
  const businessName = watch("businessName");

  const initialGalleryJson = JSON.stringify(getInitialGalleryUrls(initialData));
  const currentExistingGalleryJson = JSON.stringify(existingGalleryUrls);
  const galleryChanged =
    gallery.files.length > 0 ||
    currentExistingGalleryJson !== initialGalleryJson;

  const hasChanges =
    isDirty ||
    logo.file != null ||
    paymentQr.file != null ||
    galleryChanged;

  const toggleAmenity = (value: string, checked: boolean) => {
    const current = amenities ?? [];
    setValue(
      "amenities",
      checked ? [...current, value] : current.filter((a) => a !== value),
      { shouldDirty: true },
    );
  };

  const handleReset = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "Discard your unsaved changes? This cannot be undone.",
      );
      if (!confirmed) return;
    }
    reset(toDefaultValues(initialData));
    logo.clear();
    paymentQr.clear();
    setExistingGalleryUrls(getInitialGalleryUrls(initialData));
    gallery.clear();
  };

  const onSubmit = async (data: CreateGymInput) => {
    if (isSubmitting) return;
    try {
      const result = await updateGymSettingsAction(gymId, data, {
        logo: logo.file,
        paymentQr: paymentQr.file,
        gallery: gallery.files,
        existingGalleryUrls: existingGalleryUrls,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Gym settings updated");
      reset(data);
      logo.clear();
      paymentQr.clear();
      if (result.data?.galleryUrls) {
        setExistingGalleryUrls(result.data.galleryUrls);
      }
      gallery.clear();
    } catch (error) {
      console.error("Error saving gym settings:", error);
      toast.error("Error saving gym settings. Please try again.");
    }
  };

  const initials = (gymShortName || name || "")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const completionChecks = [
    !!name,
    !!businessName,
    !!watch("addressLine1"),
    !!watch("businessEmail"),
    !!watch("businessPhone"),
    !gstRegistered || !!watch("gstin"),
    !!(logo.preview || initialData?.logo_url),
    existingGalleryUrls.length > 0 || gallery.previews.length > 0,
    !!watch("numberOfFloors") && !!watch("numberOfRooms"),
    equipmentFields.length > 0,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  return (
    <form
      id={SETTINGS_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 py-6 lg:flex-row lg:gap-8"
    >
      <div className="flex-1 min-w-0 space-y-6">
        {hasChanges && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            You have unsaved changes
          </div>
        )}

        {/* Gym Information */}
        <SectionCard title="Gym Information" icon={Building2}>
          <FormInput
            label="Gym Name"
            required
            {...register("name")}
            error={errors.name}
          />
          <FormInput
            label="Gym Short Name"
            required
            {...register("gymShortName")}
            error={errors.gymShortName}
          />
          <FormInput
            label="Website (Optional)"
            placeholder="https://www.gym.com"
            {...register("website")}
            error={errors.website}
          />
          <FormTextarea
            label="Gym Description"
            rows={4}
            {...register("gymDescription")}
          />
          <FormInput
            label="Contact Phone"
            required
            {...register("contactPhone")}
            error={errors.contactPhone}
          />

          {initialData?.code ? (
            <div className="mt-2 pt-4 border-t border-border space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Gym Join Code
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                  {initialData.code as string}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently assigned to your gym and cannot be changed here.
              </p>
            </div>
          ) : null}
        </SectionCard>

        {/* Branding */}
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

        {/* Gym Gallery */}
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

          {(existingGalleryUrls.length > 0 || gallery.previews.length > 0) && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {existingGalleryUrls.length + gallery.previews.length} /{" "}
                {MAX_GALLERY_IMAGES} uploaded — the first image is used as the
                cover photo
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Existing Gallery Images */}
                {existingGalleryUrls.map((src, i) => (
                  <div
                    key={`existing-${src}`}
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
                      onClick={() =>
                        setExistingGalleryUrls((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute top-1.5 right-1.5 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* New Gallery Upload Previews */}
                {gallery.previews.map((src, i) => {
                  const isCover = existingGalleryUrls.length === 0 && i === 0;
                  return (
                    <div
                      key={`new-${src}`}
                      className="relative group aspect-video rounded-lg overflow-hidden border border-border"
                    >
                      <Image
                        src={src}
                        alt={`New Gallery ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {isCover && (
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
                  );
                })}
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

        {/* Facilities & Equipment */}
        <SectionCard title="Gym Facilities & Equipment" icon={Dumbbell}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Number of Floors"
              required
              {...register("numberOfFloors")}
              error={errors.numberOfFloors}
            />
            <FormInput
              label="Number of Rooms"
              required
              {...register("numberOfRooms")}
              error={errors.numberOfRooms}
            />
          </div>

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

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Equipment</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => appendEquipment({ name: "", quantity: "" })}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Equipment
              </Button>
            </div>

            {equipmentFields.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border p-4 text-center">
                No equipment added yet.
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
            rows={4}
            {...register("facilityNotes")}
          />
        </SectionCard>

        {/* Business Information */}
        <SectionCard title="Business Information" icon={BadgeIndianRupee}>
          <FormInput
            label="Owner Name"
            required
            {...register("ownerName")}
            error={errors.ownerName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Business Name"
              required
              {...register("businessName")}
              error={errors.businessName}
            />
            <FormInput
              label="Business Email"
              type="email"
              required
              {...register("businessEmail")}
              error={errors.businessEmail}
            />
          </div>
          <FormInput
            label="Business Phone"
            required
            {...register("businessPhone")}
            error={errors.businessPhone}
          />
          <div className="space-y-4 pt-2">
            <FormInput
              label="Address Line 1"
              required
              {...register("addressLine1")}
              error={errors.addressLine1}
            />
            <FormInput
              label="Address Line 2 (Optional)"
              {...register("addressLine2")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="City"
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
        </SectionCard>

        {/* Payment QR */}
        <SectionCard title="Payment QR Code" icon={QrCode}>
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
        </SectionCard>

        {/* GST */}
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
                maxLength={15}
                required
                {...register("gstin")}
                error={errors.gstin}
              />
              <FormInput
                label="Legal Business Name"
                required
                {...register("legalBusinessName")}
                error={errors.legalBusinessName}
              />
              <FormTextarea
                label="Billing Address"
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

        {/* Actions — mobile */}
        <div className="flex flex-col gap-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            disabled={!hasChanges || isSubmitting}
            className={bigSquareButton}
            onClick={handleReset}
          >
            Reset Changes
          </Button>
          <Button
            type="submit"
            disabled={!hasChanges || isSubmitting}
            className={bigSquareButton}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block lg:w-80">
        <div className="sticky top-6 space-y-6">
          <SectionCard title="Settings Summary" icon={SettingsIcon}>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <div className="flex flex-col items-center space-y-3 rounded-lg border border-border p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-card flex items-center justify-center">
                  {logo.preview ? (
                    <Image
                      src={logo.preview}
                      alt={name || "Gym logo"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{name}</p>
                  {initialData?.code ? (
                    <p className="text-xs text-muted-foreground">
                      Code: {initialData.code as string}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

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

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!hasChanges || isSubmitting}
              className={bigSquareButton}
              onClick={handleReset}
            >
              Reset Changes
            </Button>
            <Button
              type="submit"
              form={SETTINGS_FORM_ID}
              disabled={!hasChanges || isSubmitting}
              className={bigSquareButton}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
