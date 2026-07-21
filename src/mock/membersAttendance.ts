export type AttendanceRecord = {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "Present" | "Absent" | "Late";
  notes: string;
};

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    date: "12 May 2025, Mon",
    checkIn: "06:05 AM",
    checkOut: "08:20 AM",
    duration: "2h 15m",
    status: "Present",
    notes: "Good session",
  },
  {
    id: 2,
    date: "11 May 2025, Sun",
    checkIn: "—",
    checkOut: "—",
    duration: "—",
    status: "Absent",
    notes: "—",
  },
  {
    id: 3,
    date: "10 May 2025, Sat",
    checkIn: "06:15 AM",
    checkOut: "08:30 AM",
    duration: "2h 15m",
    status: "Present",
    notes: "—",
  },
  {
    id: 4,
    date: "9 May 2025, Fri",
    checkIn: "06:00 AM",
    checkOut: "08:10 AM",
    duration: "2h 10m",
    status: "Present",
    notes: "—",
  },
  {
    id: 5,
    date: "8 May 2025, Thu",
    checkIn: "06:25 AM",
    checkOut: "08:45 AM",
    duration: "2h 20m",
    status: "Late",
    notes: "Reached 25m late",
  },
];

export const attendanceStatusOptions = [
  "All Status",
  "Present",
  "Absent",
  "Late",
];

export const attendanceMonthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const attendanceYearOptions = ["2025", "2024", "2023"];
