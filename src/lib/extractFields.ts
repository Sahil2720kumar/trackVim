import { ROOM_TYPES } from "@/constants/gym-options";
import { CreateGymInput, CreateMemberInput } from "@/db/validators";

const BOOLEAN_FIELDS = new Set<string>([
  "gstRegistered",
  ...ROOM_TYPES.map((room) => room.boolField as string),
]);

/** Pulls the non-file scalar fields off a FormData into a plain object for zod. */
export function extractGymFields(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    if (key === "amenities" || key === "equipment") continue;

    if (BOOLEAN_FIELDS.has(key)) {
      raw[key] = value === "true";
      continue;
    }

    raw[key] = value;
  }

  const amenities = formData
    .getAll("amenities")
    .filter((v): v is string => typeof v === "string");
  if (amenities.length) raw.amenities = amenities;

  const equipmentRaw = formData.get("equipment");
  if (typeof equipmentRaw === "string" && equipmentRaw.length) {
    try {
      raw.equipment = JSON.parse(equipmentRaw);
    } catch {
      raw.equipment = [];
    }
  }

  return raw;
}

export const buildGymFormData = (
  data: CreateGymInput,
  logo?: File | null,
  paymentQr?: File | null,
  gallery?: File[] | null,
): FormData => {
  const fd = new FormData();
  // Scalar fields — skip nulls, empty strings, and the logo, paymentQr, gallery file keys
  Object.entries(data).forEach(([k, v]) => {
    if (k === "equipment" || k === "amenities" || v == null || v === "") return;
    fd.append(k, String(v));
  });
  // Arrays
  (data.amenities ?? []).forEach((a) => fd.append("amenities", a));
  fd.append("equipment", JSON.stringify(data.equipment ?? []));
  // Files
  if (logo instanceof File) fd.append("logo", logo);
  if (paymentQr instanceof File) fd.append("paymentQr", paymentQr);
  gallery?.forEach((f) => fd.append("gallery", f));

  return fd;
};

export function extractMemberFields(
  formData: FormData,
): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    raw[key] = value;
  }
  return raw;
}

export const buildMemberFormData = (
  data: CreateMemberInput,
  photo?: File | null,
): FormData => {
  const fd = new FormData();
  // Scalar fields — skip nulls, empty strings, and the photo file key
  Object.entries(data).forEach(([k, v]) => {
    if (k === "photoFile" || v == null || v === "") return;
    fd.append(k, String(v));
  });

  // Photo file
  if (photo instanceof File) {
    fd.append("photoFile", photo);
  }

  return fd;
};
