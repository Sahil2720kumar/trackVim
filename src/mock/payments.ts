export type Payment = {
  id: string;
  member: string;
  phone: string;
  plan: string;
  amount: number;
  method: string;
  paymentDate: string;
  dueDate: string;
  status: string;
  avatar: string;
};

export const initialPayments: Payment[] = [
  {
    id: "RCPT-10241",
    member: "Rahul Sharma",
    phone: "+91 98765 43210",
    plan: "Premium Plan",
    amount: 2000,
    method: "UPI",
    paymentDate: "12 Jul 2026",
    dueDate: "12 Aug 2026",
    status: "Paid",
    avatar: "RS",
  },
  {
    id: "RCPT-10240",
    member: "Priya Verma",
    phone: "+91 91234 56789",
    plan: "Gold Plan",
    amount: 1500,
    method: "Card",
    paymentDate: "12 Jul 2026",
    dueDate: "12 Aug 2026",
    status: "Paid",
    avatar: "PV",
  },
  {
    id: "RCPT-10239",
    member: "Aman Das",
    phone: "+91 87654 32109",
    plan: "Standard Plan",
    amount: 999,
    method: "UPI",
    paymentDate: "11 Jul 2026",
    dueDate: "11 Aug 2026",
    status: "Pending",
    avatar: "AD",
  },
  {
    id: "RCPT-10238",
    member: "Neha Singh",
    phone: "+91 99887 66554",
    plan: "Premium Plan",
    amount: 2000,
    method: "Net Banking",
    paymentDate: "11 Jul 2026",
    dueDate: "11 Aug 2026",
    status: "Paid",
    avatar: "NS",
  },
  {
    id: "RCPT-10237",
    member: "Rohit Patel",
    phone: "+91 88776 54321",
    plan: "Gold Plan",
    amount: 1500,
    method: "UPI",
    paymentDate: "10 Jul 2026",
    dueDate: "10 Aug 2026",
    status: "Overdue",
    avatar: "RP",
  },
  {
    id: "RCPT-10236",
    member: "Sneha Iyer",
    phone: "+91 97765 43322",
    plan: "Standard Plan",
    amount: 999,
    method: "Card",
    paymentDate: "10 Jul 2026",
    dueDate: "10 Aug 2026",
    status: "Paid",
    avatar: "SI",
  },
  {
    id: "RCPT-10235",
    member: "Vikram Mehta",
    phone: "+91 96654 33211",
    plan: "Corporate Plan",
    amount: 3500,
    method: "Net Banking",
    paymentDate: "09 Jul 2026",
    dueDate: "09 Aug 2026",
    status: "Paid",
    avatar: "VM",
  },
  {
    id: "RCPT-10234",
    member: "Divya Sharma",
    phone: "+91 95543 22111",
    plan: "Premium Plan",
    amount: 2000,
    method: "Card",
    paymentDate: "09 Jul 2026",
    dueDate: "09 Aug 2026",
    status: "Paid",
    avatar: "DS",
  },
  {
    id: "RCPT-10233",
    member: "Arjun Verma",
    phone: "+91 94432 11098",
    plan: "Gold Plan",
    amount: 1500,
    method: "UPI",
    paymentDate: "08 Jul 2026",
    dueDate: "08 Aug 2026",
    status: "Pending",
    avatar: "AV",
  },
  {
    id: "RCPT-10232",
    member: "Karan Singh",
    phone: "+91 93321 09876",
    plan: "Standard Plan",
    amount: 999,
    method: "Net Banking",
    paymentDate: "08 Jul 2026",
    dueDate: "08 Aug 2026",
    status: "Paid",
    avatar: "KS",
  },
];

export const planOptions = [
  "All Plans",
  "Premium Plan",
  "Gold Plan",
  "Standard Plan",
  "Corporate Plan",
];

export const methodOptions = ["All Methods", "UPI", "Card", "Net Banking"];

export const statusOptions = [
  "All",
  "Paid",
  "Pending",
  "Overdue",
  "Refunded",
  "Cancelled",
];
