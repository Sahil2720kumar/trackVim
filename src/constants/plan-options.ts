import { Crown, Star, Zap, Trophy, Shield, Dumbbell } from "lucide-react";

// Plain string arrays — FormSelect accepts string[] directly (value === label),
// same pattern as DAYS / SESSION_TYPES / EMPLOYMENT_TYPE_OPTIONS in
// constants/profile-options. Do not pre-map these to {value, label}.

export const PLAN_CATEGORIES = [
  "Standard",
  "Premium",
  "VIP",
  "Student",
  "Corporate",
  "Personal Training",
].map(option => ({ value: option, label: option }));

export const PRICING_TYPES = ["Fixed", "Recurring"].map(option => ({ value: option, label: option }));

export const DISCOUNT_TYPES = ["Percentage", "Amount"].map(option => ({ value: option, label: option }));

export const DURATION_OPTIONS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
  "Custom",
].map(option => ({ value: option, label: option }));

export const VALIDITY_OPTIONS = [
  "Immediately",
  "From Joining Date",
  "Custom Date",
].map(option => ({ value: option, label: option }));

export const ENROLLMENT_MODES = ["Open", "Invite Only"].map(option => ({ value: option, label: option }));

export const CANCELLATION_POLICIES = ["Allowed", "Not Allowed"].map(option => ({ value: option, label: option }));

export const STATUS_OPTIONS = ["Active", "Draft", "Hidden"].map(option => ({ value: option, label: option }));

export const VISIBILITY_OPTIONS = [
  "Visible to Everyone",
  "Visible Only to Staff",
].map(option => ({ value: option, label: option }));

export const PREDEFINED_FEATURES = [
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
]
// These two carry non-string data (hex codes / icon components) so they stay
// as object arrays — there's nothing to "map" here, this is just the data.
export const PLAN_COLORS = [
  { name: "Purple", value: "#8b5cf6", hex: "bg-purple-500" },
  { name: "Blue", value: "#3b82f6", hex: "bg-blue-500" },
  { name: "Green", value: "#10b981", hex: "bg-emerald-500" },
  { name: "Orange", value: "#f97316", hex: "bg-orange-500" },
  { name: "Red", value: "#ef4444", hex: "bg-red-500" },
  { name: "Slate", value: "#64748b", hex: "bg-slate-500" },
]

export const PLAN_ICONS = [
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Crown", icon: Crown },
  { name: "Star", icon: Star },
  { name: "Zap", icon: Zap },
  { name: "Trophy", icon: Trophy },
  { name: "Shield", icon: Shield },
]
