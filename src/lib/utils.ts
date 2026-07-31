import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayDateStr(timezone: string = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function generateGymCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GYM-${random}`;
}

export function generateMemberCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MEM-${random}`;
}

export function generateTrainerCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRA-${random}`;
}
