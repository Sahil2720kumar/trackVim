import { CheckCircle, FileText, Mail, Bell, Calendar } from "lucide-react";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type PaymentStatus = "Paid" | "Pending" | "Failed";

export interface Payment {
  id: string;
  date: string; // "12 Jul 2026"
  amount: string; // "₹2,000"
  method: string;
  status: PaymentStatus;
  collectedBy: string;
}

export interface Transaction {
  type: string;
  description: string;
  time: string;
  icon: any;
}

export function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function parseDate(str: string): Date {
  const [day, mon, year] = str.split(" ");
  return new Date(Number(year), MONTHS.indexOf(mon), Number(day));
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCSV(data: Payment[], filename: string) {
  const header = "Invoice ID,Date,Amount,Payment Method,Status,Collected By\n";
  const rows = data
    .map(
      (p) =>
        `${p.id},${p.date},${p.amount},${p.method},${p.status},${p.collectedBy}`,
    )
    .join("\n");
  downloadTextFile(filename, header + rows);
}

export function receiptText(p: Payment) {
  return `PowerFlex Gym - Payment Receipt

Invoice: ${p.id}
Date: ${p.date}
Member: Rohan Sharma (MB-1024)
Amount: ${p.amount}
Method: ${p.method}
Status: ${p.status}
Collected By: ${p.collectedBy}

Thank you for your payment.`;
}

export function invoiceText(p: Payment) {
  return `PowerFlex Gym - Invoice

Invoice: ${p.id}
Date: ${p.date}
Billed To: Rohan Sharma (MB-1024)
Plan: Gold Plan (Monthly)

Membership Fee: ₹2,000.00
Discount: -₹200.00
Tax (18%): ₹324.00
Amount Paid: ${p.amount}

Payment Method: ${p.method}
Status: ${p.status}
Collected By: ${p.collectedBy}`;
}

// 18 months of history, most recent first, aligned with "Member Since: 12 Jan 2025"
export const MONTH_SEQUENCE = [
  "Jul 2026",
  "Jun 2026",
  "May 2026",
  "Apr 2026",
  "Mar 2026",
  "Feb 2026",
  "Jan 2026",
  "Dec 2025",
  "Nov 2025",
  "Oct 2025",
  "Sep 2025",
  "Aug 2025",
  "Jul 2025",
  "Jun 2025",
  "May 2025",
  "Apr 2025",
  "Mar 2025",
  "Feb 2025",
];
export const METHOD_SEQUENCE = ["UPI", "Cash", "Card", "Bank Transfer"];

export const initialPayments: Payment[] = MONTH_SEQUENCE.map((m, i) => ({
  id: `INV-${1018 - i}`,
  date: `12 ${m}`,
  amount: "₹2,000",
  method: METHOD_SEQUENCE[i % METHOD_SEQUENCE.length],
  status: "Paid",
  collectedBy: "Sahil Kumar",
}));

// Mock revenue data
export const revenueData = [
  { month: "Jun", revenue: 2000 },
  { month: "Jul", revenue: 2200 },
  { month: "Aug", revenue: 2100 },
  { month: "Sep", revenue: 2400 },
  { month: "Oct", revenue: 2300 },
  { month: "Nov", revenue: 2500 },
  { month: "Dec", revenue: 2800 },
  { month: "Jan", revenue: 2600 },
  { month: "Feb", revenue: 2900 },
  { month: "Mar", revenue: 3100 },
  { month: "Apr", revenue: 2950 },
  { month: "May", revenue: 3200 },
];

// Mock payment methods data
export const paymentMethodsData = [
  { name: "UPI", value: 60000, color: "#4F46E5" },
  { name: "Cash", value: 20000, color: "#10B981" },
  { name: "Card", value: 15000, color: "#F59E0B" },
  { name: "Bank Transfer", value: 5000, color: "#8B5CF6" },
];

// Mock recent transactions
export const initialTransactions: Transaction[] = [
  {
    type: "Payment Received",
    description: "Payment received for membership renewal",
    time: "12 Jul 2026, 08:20 AM",
    icon: CheckCircle,
  },
  {
    type: "Invoice Generated",
    description: "Monthly membership invoice generated",
    time: "12 Jul 2026, 08:15 AM",
    icon: FileText,
  },
  {
    type: "Receipt Sent",
    description: "Payment receipt sent to member email",
    time: "12 Jul 2026, 08:30 AM",
    icon: Mail,
  },
  {
    type: "Reminder Sent",
    description: "Payment reminder sent for upcoming due",
    time: "01 Jul 2026, 10:30 AM",
    icon: Bell,
  },
];

export const PAGE_SIZE = 8;

export const monthOptions = ["All Months", ...MONTH_SEQUENCE];
export const methodOptions = [
  "All Methods",
  "UPI",
  "Cash",
  "Card",
  "Bank Transfer",
];
export const statusOptions = ["All Status", "Paid", "Pending", "Failed"];

export function getStatusBadgeClasses(status: PaymentStatus) {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Failed":
      return "bg-red-100 text-red-800";
  }
}
