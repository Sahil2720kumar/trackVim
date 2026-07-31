import { CreateGymInput } from "@/db/validators";

const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
].map((v) => ({ value: v, label: v }));

const COUNTRY_OPTIONS = [
  "India",
  //   "United States",
  //   "Canada",
  //   "United Kingdom",
].map((v) => ({ value: v, label: v }));

const SAC_CODE_OPTIONS = [
  { value: "999713 (Fitness Services)", label: "999713 (Fitness Services)" },
  { value: "999714 (Other Services)", label: "999714 (Other Services)" },
];

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

const ROOM_TYPES: {
  label: string;
  boolField: keyof CreateGymInput;
  countField: keyof CreateGymInput;
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

export {
  STATE_OPTIONS,
  COUNTRY_OPTIONS,
  SAC_CODE_OPTIONS,
  AMENITY_OPTIONS,
  ROOM_TYPES,
};
