export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";
export type FilterChip = "all" | "nearby" | "verified" | "open";
export type PriceRangeFilter =
  | "All Prices"
  | "Under ₹1000"
  | "₹1000 - ₹1500"
  | "Above ₹1500";
export type SortOption =
  | "Recommended"
  | "Rating: High to Low"
  | "Distance: Nearest"
  | "Price: Low to High";

export interface Gym {
  id: string;
  name: string;
  logoText: string;
  logoColor: string;
  rating: number;
  reviewCount: number;
  city: string;
  distance: number;
  description: string;
  priceStartingFrom: number;
  isVerified: boolean;
  isOpen: boolean;
  trainerCount: number;
  memberCount: number;
  amenities: string[];
  applicationStatus: ApplicationStatus;
}

export const INITIAL_GYMS: Gym[] = [
  {
    id: "1",
    name: "IronForge Fitness",
    logoText: "IRONFORGE",
    logoColor: "#7c3aed",
    rating: 4.8,
    reviewCount: 326,
    city: "Downtown, Bangalore",
    distance: 2.3,
    description:
      "Premium fitness facility with state-of-the-art equipment, expert trainers and personalized programs.",
    priceStartingFrom: 1499,
    isVerified: true,
    isOpen: true,
    trainerCount: 12,
    memberCount: 1250,
    amenities: ["Strength", "Cardio", "CrossFit", "Yoga", "Zumba"],
    applicationStatus: "none",
  },
  {
    id: "2",
    name: "Peak Performance Gym",
    logoText: "PEAK",
    logoColor: "#d97706",
    rating: 4.6,
    reviewCount: 218,
    city: "Koramangala, Bangalore",
    distance: 3.6,
    description:
      "Build strength, improve endurance and achieve your fitness goals with our professional support.",
    priceStartingFrom: 1299,
    isVerified: true,
    isOpen: true,
    trainerCount: 10,
    memberCount: 980,
    amenities: ["Strength", "Cardio", "MMA", "Functional", "Steam"],
    applicationStatus: "none",
  },
  {
    id: "3",
    name: "Flex Fitness Studio",
    logoText: "FLEX",
    logoColor: "#16a34a",
    rating: 4.5,
    reviewCount: 156,
    city: "HSR Layout, Bangalore",
    distance: 4.1,
    description:
      "A friendly neighbourhood gym with modern equipment and certified trainers.",
    priceStartingFrom: 999,
    isVerified: true,
    isOpen: false,
    trainerCount: 8,
    memberCount: 650,
    amenities: ["Strength", "Cardio", "Yoga", "Dance", "Nutrition"],
    applicationStatus: "pending",
  },
  {
    id: "4",
    name: "Powerhouse Gym",
    logoText: "POWER",
    logoColor: "#dc2626",
    rating: 4.9,
    reviewCount: 412,
    city: "Indiranagar, Bangalore",
    distance: 1.8,
    description:
      "Elite training facility for serious athletes and fitness enthusiasts.",
    priceStartingFrom: 1699,
    isVerified: true,
    isOpen: true,
    trainerCount: 15,
    memberCount: 2100,
    amenities: ["Strength", "Cardio", "Powerlifting", "CrossFit", "Sauna"],
    applicationStatus: "approved",
  },
  {
    id: "5",
    name: "Form Fitness",
    logoText: "FORM",
    logoColor: "#0891b2",
    rating: 4.3,
    reviewCount: 98,
    city: "Jayanagar, Bangalore",
    distance: 5.2,
    description:
      "Transform your lifestyle with expert guidance, group classes and personalized training.",
    priceStartingFrom: 1199,
    isVerified: true,
    isOpen: true,
    trainerCount: 6,
    memberCount: 420,
    amenities: ["Yoga", "Cardio", "Strength", "Pilates", "Aerobics"],
    applicationStatus: "rejected",
  },
  {
    id: "6",
    name: "CoreZone Fitness",
    logoText: "CORE",
    logoColor: "#be185d",
    rating: 4.2,
    reviewCount: 74,
    city: "Whitefield, Bangalore",
    distance: 7.4,
    description:
      "Functional training and core conditioning in a motivating community environment.",
    priceStartingFrom: 899,
    isVerified: false,
    isOpen: true,
    trainerCount: 5,
    memberCount: 310,
    amenities: ["Functional", "Cardio", "Yoga", "HIIT"],
    applicationStatus: "none",
  },
];

export const priceRangeOptions: PriceRangeFilter[] = [
  "Under ₹1000",
  "₹1000 - ₹1500",
  "Above ₹1500",
];

export const sortOptions: SortOption[] = [
  "Rating: High to Low",
  "Distance: Nearest",
  "Price: Low to High",
];

export function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
  return `${count}+`;
}
