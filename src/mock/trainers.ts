export type Trainer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialization: string;
  experience: number;
  assignedMembers: number;
  todaySessions: number;
  rating: number;
  status: string;
};

export const initialTrainers: Trainer[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@email.com",
    phone: "+91 98765 43210",
    avatar: "RS",
    specialization: "Strength Training",
    experience: 5,
    assignedMembers: 42,
    todaySessions: 6,
    rating: 4.9,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@email.com",
    phone: "+91 91234 56789",
    avatar: "PS",
    specialization: "Yoga",
    experience: 4,
    assignedMembers: 38,
    todaySessions: 4,
    rating: 4.8,
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@email.com",
    phone: "+91 99887 66554",
    avatar: "AV",
    specialization: "Weight Loss",
    experience: 3,
    assignedMembers: 31,
    todaySessions: 5,
    rating: 4.7,
    status: "Busy",
  },
  {
    id: 4,
    name: "Vikram Patel",
    email: "vikram@email.com",
    phone: "+91 97654 32109",
    avatar: "VP",
    specialization: "CrossFit",
    experience: 6,
    assignedMembers: 45,
    todaySessions: 7,
    rating: 4.9,
    status: "Active",
  },
  {
    id: 5,
    name: "Neha Kapoor",
    email: "neha@email.com",
    phone: "+91 92345 67890",
    avatar: "NK",
    specialization: "Cardio",
    experience: 2,
    assignedMembers: 28,
    todaySessions: 3,
    rating: 4.6,
    status: "On Leave",
  },
  {
    id: 6,
    name: "Sandeep Kumar",
    email: "sandeep@email.com",
    phone: "+91 90011 22334",
    avatar: "SK",
    specialization: "Powerlifting",
    experience: 7,
    assignedMembers: 35,
    todaySessions: 5,
    rating: 4.8,
    status: "Active",
  },
  {
    id: 7,
    name: "Divya Sharma",
    email: "divya@email.com",
    phone: "+91 88991 23456",
    avatar: "DS",
    specialization: "HIIT",
    experience: 3,
    assignedMembers: 29,
    todaySessions: 4,
    rating: 4.7,
    status: "Active",
  },
  {
    id: 8,
    name: "Arun Patel",
    email: "arun@email.com",
    phone: "+91 86543 21098",
    avatar: "AP",
    specialization: "Pilates",
    experience: 4,
    assignedMembers: 32,
    todaySessions: 6,
    rating: 4.8,
    status: "Active",
  },
];

export const specializationOptions = [
  "All Specializations",
  "Strength Training",
  "Yoga",
  "Weight Loss",
  "CrossFit",
  "Cardio",
  "Powerlifting",
  "HIIT",
  "Pilates",
];

export const statusOptions = ["All", "Active", "Busy", "On Leave", "Offline"];
