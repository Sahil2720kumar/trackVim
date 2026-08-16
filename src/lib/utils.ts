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

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateStr();
}

export function isPastDate(dateStr: string): boolean {
  return dateStr < getTodayDateStr();
}

export function getTodayTimeStr(timezone: string = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function toIndiaDateTime(dateTime: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(dateTime));
}

export function formatDateTime(ts: string): string {
  const d = new Date(ts);

  return `${d.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateStr(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
}

export function formatShortDate(updatedAt: string): string {
  return new Date(updatedAt).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime12h(time24h: string): string {
  const [hStr, mStr] = time24h.split(":");
  let hours = parseInt(hStr, 10);

  if (Number.isNaN(hours) || !mStr) {
    return "—";
  }

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, "0")}:${mStr} ${period}`;
}

export const getDaysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const getFirstDayOfMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

export const formatRelativeDays = (ts: string): string => {
  const diffMs = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

export function restLabelToSeconds(label: string): number {
  const match = label.match(/\d+/);
  if (!match) return 60;
  const value = Number(match[0]);
  return label.toLowerCase().includes("min") ? value * 60 : value;
}

//Session Part
export function formatSessionDate(dateStr: string): string {
  const today = getTodayDateStr();

  const [year, month, day] = dateStr.split("-").map(Number);

  // Create date in local calendar without UTC shifting
  const d = new Date(year, month - 1, day);

  if (dateStr === today) {
    return `Today, ${d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`;
  }

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeToMinutes(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

//Code Generator

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

//trainer session
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function diffMinutesFromTimes(
  start: string,
  end: string,
): number | null {
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

  if (!timePattern.test(start) || !timePattern.test(end)) {
    return null;
  }

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  return endMinutes > startMinutes ? endMinutes - startMinutes : null;
}
