import {
  Flame,
  HeartPulse,
  Trophy,
  Apple,
  Bike,
  Sparkles,
  Wind,
  ShieldPlus,
  Zap,
  PersonStanding,
  Dumbbell,
  Users,
} from "lucide-react";

const GENDER_OPTIONS = ["Male", "Female", "Other"].map((v) => ({
  value: v,
  label: v,
}));

const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
].map((v) => ({
  value: v,
  label: v,
}));

const FITNESS_GOAL_OPTIONS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Improve Fitness",
  "Body Recomposition",
  "Endurance",
  "Athletic Performance",
  "Rehabilitation",
].map((v) => ({ value: v, label: v }));

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Friend",
  "Guardian",
  "Other",
].map((v) => ({ value: v, label: v }));

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

const EMPLOYMENT_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Freelance",
  "Contract",
].map((v) => ({
  value: v,
  label: v,
}));

type SpecializationOption = {
  name: string;
  icon: typeof Dumbbell;
  blurb: string;
};

type SpecializationCategory = {
  category: string;
  options: SpecializationOption[];
};

const SPECIALIZATION_GROUPS: SpecializationCategory[] = [
  {
    category: "Weight & Body Composition",
    options: [
      {
        name: "Weight Loss",
        icon: Flame,
        blurb: "Fat loss & calorie management",
      },
      { name: "Muscle Gain", icon: Dumbbell, blurb: "Hypertrophy & bulking" },
      {
        name: "Nutrition Guidance",
        icon: Apple,
        blurb: "Diet & meal planning",
      },
    ],
  },
  {
    category: "Strength & Performance",
    options: [
      {
        name: "Strength Training",
        icon: Dumbbell,
        blurb: "Progressive overload",
      },
      { name: "Bodybuilding", icon: Trophy, blurb: "Physique & aesthetics" },
      { name: "CrossFit", icon: Zap, blurb: "High-intensity mixed training" },
      {
        name: "Sports Performance",
        icon: Bike,
        blurb: "Athletic conditioning",
      },
    ],
  },
  {
    category: "Functional & Conditioning",
    options: [
      {
        name: "Functional Training",
        icon: PersonStanding,
        blurb: "Everyday movement patterns",
      },
      { name: "HIIT", icon: Zap, blurb: "Interval conditioning" },
      { name: "Cardio", icon: HeartPulse, blurb: "Endurance & heart health" },
    ],
  },
  {
    category: "Mind, Mobility & Recovery",
    options: [
      { name: "Yoga", icon: Sparkles, blurb: "Flexibility & mindfulness" },
      { name: "Pilates", icon: Wind, blurb: "Core & posture control" },
      { name: "Rehabilitation", icon: ShieldPlus, blurb: "Injury recovery" },
      {
        name: "Senior Fitness",
        icon: Users,
        blurb: "Low-impact, age-friendly",
      },
    ],
  },
];

const ALL_SPECIALIZATIONS = SPECIALIZATION_GROUPS.flatMap((g) => g.options);

const LANGUAGES: { name: string; native: string }[] = [
  { name: "English", native: "English" },
  { name: "Hindi", native: "हिन्दी" },
  { name: "Assamese", native: "অসমীয়া" },
  { name: "Bengali", native: "বাংলা" },
  { name: "Tamil", native: "தமிழ்" },
  { name: "Telugu", native: "తెలుగు" },
  { name: "Marathi", native: "मराठी" },
];

const SESSION_TYPES = [
  "Personal Training",
  "Group Training",
  "Yoga",
  "CrossFit",
  "Cardio",
  "Strength",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STATE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  SPECIALIZATION_GROUPS,
  ALL_SPECIALIZATIONS,
  LANGUAGES,
  SESSION_TYPES,
  DAYS,
};
