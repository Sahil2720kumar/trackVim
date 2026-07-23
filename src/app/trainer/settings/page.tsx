"use client";

// ============================================================================
// Imports
// ============================================================================

import * as React from "react";
import {
  User,
  Camera,
  X,
  BadgeCheck,
  GraduationCap,
  Award,
  Briefcase,
  Clock3,
  Calendar as CalendarIcon,
  Languages,
  Dumbbell,
  ShieldCheck,
  Star,
  Users,
  Link as LinkIcon,
  Bell,
  Lock,
  Save,
  Plus,
  Trash2,
  Globe,
  CheckCircle2,
  Circle,
  Eye,
  ChevronDown,
  Mail,
  Phone,
  TrendingUp,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
}

interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

interface TrainerProfile {
  fullName: string;
  professionalTitle: string;
  bio: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  languages: string[];
  yearsExperience: number;
  specializations: string[];
  certifications: Certification[];
  education: EducationRecord[];
  coachingExperience: string;
  trainingPhilosophy: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionTypes: string[];
  acceptingNewMembers: boolean;
  instagram: string;
  linkedin: string;
  youtube: string;
  website: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface TrainerStats {
  membersTrained: number;
  yearsExperience: number;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  retentionRate: number;
}

// ============================================================================
// Constants
// ============================================================================

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Assamese",
  "Bengali",
  "Punjabi",
  "Tamil",
];

const SPECIALIZATION_OPTIONS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Bodybuilding",
  "Functional Training",
  "HIIT",
  "Powerlifting",
  "Mobility",
  "Rehabilitation",
  "Athletic Performance",
  "Women's Fitness",
  "Senior Fitness",
];

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SESSION_TYPES = [
  "Personal Training",
  "Group Training",
  "Online Coaching",
  "Nutrition Guidance",
];

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PROFILE: TrainerProfile = {
  fullName: "Rahul Sharma",
  professionalTitle: "Certified Strength & Conditioning Coach",
  bio: "Helping members build strength, lose fat, and improve overall fitness through personalized training programs.",
  gender: "Male",
  dateOfBirth: "1993-03-15",
  phone: "+91 98765 43210",
  email: "rahul.sharma@trackvim.com",
  languages: ["English", "Hindi", "Assamese"],
  yearsExperience: 6,
  specializations: [
    "Muscle Gain",
    "Fat Loss",
    "Strength Training",
    "Functional Training",
  ],
  certifications: [
    {
      id: "c1",
      name: "ACE Personal Trainer",
      organization: "American Council on Exercise",
      issueDate: "2019-06-01",
      expiryDate: "2027-06-01",
    },
    {
      id: "c2",
      name: "NSCA CSCS",
      organization: "National Strength & Conditioning Association",
      issueDate: "2020-02-15",
      expiryDate: "2026-02-15",
    },
    {
      id: "c3",
      name: "NASM CPT",
      organization: "National Academy of Sports Medicine",
      issueDate: "2021-09-10",
      expiryDate: "",
    },
    {
      id: "c4",
      name: "ISSA CPT",
      organization: "International Sports Sciences Association",
      issueDate: "2022-01-20",
      expiryDate: "2028-01-20",
    },
  ],
  education: [
    {
      id: "e1",
      degree: "B.Sc. Sports Science",
      institution: "Lakshmibai National Institute of Physical Education",
      year: "2017",
    },
    {
      id: "e2",
      degree: "Diploma in Fitness Training",
      institution: "K11 School of Fitness Sciences",
      year: "2018",
    },
  ],
  coachingExperience:
    "Over six years coaching individuals and groups across gyms and online, specializing in strength progression and body recomposition for members transitioning from beginner to intermediate levels.",
  trainingPhilosophy:
    "Focus on progressive overload, proper form, sustainable habits, and long-term health over short-term results.",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "06:00",
  endTime: "18:00",
  sessionTypes: ["Personal Training", "Online Coaching"],
  acceptingNewMembers: true,
  instagram: "@rahul.trains",
  linkedin: "linkedin.com/in/rahulsharma",
  youtube: "",
  website: "",
  twoFactorEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
};

const MOCK_STATS: TrainerStats = {
  membersTrained: 148,
  yearsExperience: 6,
  averageRating: 4.9,
  totalReviews: 128,
  completedSessions: 2450,
  retentionRate: 91,
};

const PROFILE_CHECKLIST: { label: string; complete: boolean }[] = [
  { label: "Profile Photo", complete: true },
  { label: "Bio", complete: true },
  { label: "Certifications", complete: true },
  { label: "Experience", complete: true },
  { label: "Availability", complete: true },
  { label: "Social Links", complete: false },
];

const MEMBER_TIPS = [
  "Upload a professional profile photo.",
  "Add certifications.",
  "Complete your bio.",
  "Mention your specialties.",
  "Keep your availability updated.",
  "Add social links.",
];

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function calcCompletion(checklist: { complete: boolean }[]): number {
  const done = checklist.filter((c) => c.complete).length;
  return Math.round((done / checklist.length) * 100);
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ============================================================================
// Reusable Components
// ============================================================================

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
      {required ? <span className="ml-0.5 text-destructive">*</span> : null}
    </Label>
  );
}

function MultiSelectBadges({
  values,
  onRemove,
  emptyText,
}: {
  values: string[];
  onRemove: (value: string) => void;
  emptyText: string;
}) {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge
          key={value}
          variant="secondary"
          className="gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
        >
          {value}
          <button
            type="button"
            onClick={() => onRemove(value)}
            aria-label={`Remove ${value}`}
            className="ml-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function OptionPicker({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Select options
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-sm">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted focus-visible:bg-muted outline-none"
              >
                {option}
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CertificationRow({
  certification,
  onChange,
  onRemove,
}: {
  certification: Certification;
  onChange: (id: string, field: keyof Certification, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`cert-name-${certification.id}`}>
            Certification Name
          </FieldLabel>
          <Input
            id={`cert-name-${certification.id}`}
            value={certification.name}
            onChange={(e) => onChange(certification.id, "name", e.target.value)}
            placeholder="e.g. NASM CPT"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`cert-org-${certification.id}`}>
            Issuing Organization
          </FieldLabel>
          <Input
            id={`cert-org-${certification.id}`}
            value={certification.organization}
            onChange={(e) =>
              onChange(certification.id, "organization", e.target.value)
            }
            placeholder="e.g. National Academy of Sports Medicine"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`cert-issue-${certification.id}`}>
            Issue Date
          </FieldLabel>
          <Input
            id={`cert-issue-${certification.id}`}
            type="date"
            value={certification.issueDate}
            onChange={(e) =>
              onChange(certification.id, "issueDate", e.target.value)
            }
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`cert-expiry-${certification.id}`}>
            Expiry Date (Optional)
          </FieldLabel>
          <Input
            id={`cert-expiry-${certification.id}`}
            type="date"
            value={certification.expiryDate ?? ""}
            onChange={(e) =>
              onChange(certification.id, "expiryDate", e.target.value)
            }
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(certification.id)}
          className="gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function EducationRow({
  record,
  onChange,
  onRemove,
}: {
  record: EducationRecord;
  onChange: (id: string, field: keyof EducationRecord, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <FieldLabel htmlFor={`edu-degree-${record.id}`}>
            Qualification
          </FieldLabel>
          <Input
            id={`edu-degree-${record.id}`}
            value={record.degree}
            onChange={(e) => onChange(record.id, "degree", e.target.value)}
            placeholder="e.g. B.Sc Sports Science"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <FieldLabel htmlFor={`edu-institution-${record.id}`}>
            Institution
          </FieldLabel>
          <Input
            id={`edu-institution-${record.id}`}
            value={record.institution}
            onChange={(e) => onChange(record.id, "institution", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <FieldLabel htmlFor={`edu-year-${record.id}`}>Year</FieldLabel>
          <Input
            id={`edu-year-${record.id}`}
            value={record.year}
            onChange={(e) => onChange(record.id, "year", e.target.value)}
            placeholder="e.g. 2018"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(record.id)}
          className="gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAction}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-24 w-24 -rotate-90"
      role="img"
      aria-label={`${value}% profile complete`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="stroke-muted"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="stroke-primary transition-all duration-500"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-foreground text-[22px] font-semibold"
        style={{ transformOrigin: "50px 50px" }}
      >
        {value}%
      </text>
    </svg>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ============================================================================
// Loading Skeleton Components
// ============================================================================

function HeaderSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-border shadow-sm">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading trainer settings"
    >
      <Skeleton className="h-4 w-40" />
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSkeleton rows={5} />
          <CardSkeleton rows={4} />
          <CardSkeleton rows={3} />
        </div>
        <SidebarSkeleton />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TrainerSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<TrainerProfile>(MOCK_PROFILE);
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const update = React.useCallback(
    <K extends keyof TrainerProfile>(field: K, value: TrainerProfile[K]) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    [],
  );

  const toggleInArray = React.useCallback(
    (
      field: "languages" | "specializations" | "workingDays" | "sessionTypes",
      value: string,
    ) => {
      setProfile((prev) => {
        const current = prev[field];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: next };
      });
      setIsDirty(true);
    },
    [],
  );

  const addCertification = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: generateId(),
          name: "",
          organization: "",
          issueDate: "",
          expiryDate: "",
        },
      ],
    }));
    setIsDirty(true);
  };

  const updateCertification = (
    id: string,
    field: keyof Certification,
    value: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    }));
    setIsDirty(true);
  };

  const removeCertification = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
    setIsDirty(true);
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), degree: "", institution: "", year: "" },
      ],
    }));
    setIsDirty(true);
  };

  const updateEducation = (
    id: string,
    field: keyof EducationRecord,
    value: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    }));
    setIsDirty(true);
  };

  const removeEducation = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
  };

  const completion = calcCompletion(PROFILE_CHECKLIST);

  if (loading) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <span>Settings</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-foreground">Trainer Profile</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Trainer Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your public trainer profile and professional information
              that members will see.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Eye className="h-4 w-4" />
              Preview Public Profile
            </Button>
            <Button onClick={handleSave} className="gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Information */}
            <SectionCard
              title="Personal Information"
              description="Basic information displayed on your trainer profile."
              icon={User}
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src="" alt={profile.fullName} />
                  <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Upload Photo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WEBP. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="fullName" required>
                    Full Name
                  </FieldLabel>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="Rahul Sharma"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="title" required>
                    Professional Title
                  </FieldLabel>
                  <Input
                    id="title"
                    value={profile.professionalTitle}
                    onChange={(e) =>
                      update("professionalTitle", e.target.value)
                    }
                    placeholder="Certified Strength & Conditioning Coach"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="bio" required>
                    Short Bio
                  </FieldLabel>
                  <span className="text-xs text-muted-foreground">
                    {profile.bio.length} / 250
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  maxLength={250}
                  rows={3}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Helping members build strength, lose fat, and improve overall fitness through personalized training programs."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Select
                    value={profile.gender}
                    onValueChange={(v) => update("gender", v)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                  <div className="relative">
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile.email}
                      readOnly
                      className="cursor-not-allowed bg-muted pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="languages">
                  <span className="inline-flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" /> Languages Spoken
                  </span>
                </FieldLabel>
                <MultiSelectBadges
                  values={profile.languages}
                  onRemove={(v) => toggleInArray("languages", v)}
                  emptyText="No languages selected yet."
                />
                <OptionPicker
                  options={LANGUAGE_OPTIONS}
                  selected={profile.languages}
                  onToggle={(v) => toggleInArray("languages", v)}
                />
              </div>
            </SectionCard>

            {/* Professional Information */}
            <SectionCard
              title="Professional Information"
              description="Information that helps members choose the right trainer."
              icon={Briefcase}
            >
              <div className="space-y-1.5 sm:w-48">
                <FieldLabel htmlFor="experience">
                  Years of Experience
                </FieldLabel>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  value={profile.yearsExperience}
                  onChange={(e) =>
                    update("yearsExperience", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="specializations">
                  <span className="inline-flex items-center gap-1.5">
                    <Dumbbell className="h-3.5 w-3.5" /> Coaching
                    Specializations
                  </span>
                </FieldLabel>
                <MultiSelectBadges
                  values={profile.specializations}
                  onRemove={(v) => toggleInArray("specializations", v)}
                  emptyText="No specializations selected yet."
                />
                <OptionPicker
                  options={SPECIALIZATION_OPTIONS}
                  selected={profile.specializations}
                  onToggle={(v) => toggleInArray("specializations", v)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="certifications">
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" /> Fitness Certifications
                    </span>
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    className="gap-1.5 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Certification
                  </Button>
                </div>
                {profile.certifications.length === 0 ? (
                  <EmptyState
                    message="No certifications added yet."
                    actionLabel="Add Certification"
                    onAction={addCertification}
                  />
                ) : (
                  <div className="space-y-3">
                    {profile.certifications.map((cert) => (
                      <CertificationRow
                        key={cert.id}
                        certification={cert}
                        onChange={updateCertification}
                        onRemove={removeCertification}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="education">
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Education
                    </span>
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="gap-1.5 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Education
                  </Button>
                </div>
                {profile.education.length === 0 ? (
                  <EmptyState
                    message="No education added yet."
                    actionLabel="Add Education"
                    onAction={addEducation}
                  />
                ) : (
                  <div className="space-y-3">
                    {profile.education.map((record) => (
                      <EducationRow
                        key={record.id}
                        record={record}
                        onChange={updateEducation}
                        onRemove={removeEducation}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="coachingExperience">
                  Coaching Experience
                </FieldLabel>
                <Textarea
                  id="coachingExperience"
                  rows={3}
                  value={profile.coachingExperience}
                  onChange={(e) => update("coachingExperience", e.target.value)}
                  placeholder="Explain your professional background."
                />
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="philosophy">
                  Training Philosophy
                </FieldLabel>
                <Textarea
                  id="philosophy"
                  rows={3}
                  value={profile.trainingPhilosophy}
                  onChange={(e) => update("trainingPhilosophy", e.target.value)}
                  placeholder="Focus on progressive overload, proper form, sustainable habits, and long-term health."
                />
              </div>
            </SectionCard>

            {/* Availability */}
            <SectionCard
              title="Availability"
              description="Let members know when and how you coach."
              icon={Clock3}
            >
              <div className="space-y-2">
                <FieldLabel htmlFor="workingDays">Working Days</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = profile.workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleInArray("workingDays", day)}
                        aria-pressed={active}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                  <Input
                    id="startTime"
                    type="time"
                    value={profile.startTime}
                    onChange={(e) => update("startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                  <Input
                    id="endTime"
                    type="time"
                    value={profile.endTime}
                    onChange={(e) => update("endTime", e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Available {formatTime(profile.startTime)} –{" "}
                {formatTime(profile.endTime)}
              </p>

              <div className="space-y-2">
                <FieldLabel htmlFor="sessionTypes">Session Types</FieldLabel>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SESSION_TYPES.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
                    >
                      <Checkbox
                        checked={profile.sessionTypes.includes(type)}
                        onCheckedChange={() =>
                          toggleInArray("sessionTypes", type)
                        }
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Accepting New Members
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Show as available for new member bookings.
                  </p>
                </div>
                <Switch
                  checked={profile.acceptingNewMembers}
                  onCheckedChange={(v) => update("acceptingNewMembers", v)}
                />
              </div>
            </SectionCard>

            {/* Social Links */}
            <SectionCard
              title="Professional Links"
              description="Where members can find more of your work."
              icon={LinkIcon}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="instagram">
                    <span className="inline-flex items-center gap-1.5">
                      {/* <Instagram className="h-3.5 w-3.5" />  */}
                      Instagram
                    </span>
                  </FieldLabel>
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => update("instagram", e.target.value)}
                    placeholder="@yourhandle"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="linkedin">
                    <span className="inline-flex items-center gap-1.5">
                      {/* <Linkedin className="h-3.5 w-3.5" /> */}
                      LinkedIn
                    </span>
                  </FieldLabel>
                  <Input
                    id="linkedin"
                    value={profile.linkedin}
                    onChange={(e) => update("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="youtube">
                    <span className="inline-flex items-center gap-1.5">
                      {/* <Youtube className="h-3.5 w-3.5" />  */}
                      YouTube
                    </span>
                  </FieldLabel>
                  <Input
                    id="youtube"
                    value={profile.youtube}
                    onChange={(e) => update("youtube", e.target.value)}
                    placeholder="youtube.com/@yourchannel"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="website">
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </span>
                  </FieldLabel>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Account Settings */}
            <SectionCard
              title="Account Settings"
              description="Security and notification preferences."
              icon={ShieldCheck}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Change Password
                  </span>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Change Password
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Switch
                  checked={profile.twoFactorEnabled}
                  onCheckedChange={(v) => update("twoFactorEnabled", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Email Notifications
                  </p>
                </div>
                <Switch
                  checked={profile.emailNotifications}
                  onCheckedChange={(v) => update("emailNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    SMS Notifications
                  </p>
                </div>
                <Switch
                  checked={profile.smsNotifications}
                  onCheckedChange={(v) => update("smsNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Push Notifications
                  </p>
                </div>
                <Switch
                  checked={profile.pushNotifications}
                  onCheckedChange={(v) => update("pushNotifications", v)}
                />
              </div>
            </SectionCard>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-6">
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2 rounded-xl">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Public Profile Preview */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Public Profile Preview
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src="" alt={profile.fullName} />
                    <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      {profile.fullName}
                      <BadgeCheck
                        className="h-3.5 w-3.5 text-primary"
                        aria-label="Verified trainer"
                      />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.professionalTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">
                    {MOCK_STATS.averageRating}
                  </span>
                  <span className="text-muted-foreground">
                    ({MOCK_STATS.totalReviews} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {profile.specializations.slice(0, 4).map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{profile.yearsExperience} years experience</span>
                  <span>
                    {profile.acceptingNewMembers ? (
                      <Badge className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        Accepting members
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        Not accepting
                      </Badge>
                    )}
                  </span>
                </div>

                <Button variant="outline" className="w-full gap-2 rounded-xl">
                  <Eye className="h-4 w-4" />
                  View Public Profile
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Profile Completion
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <CircularProgress value={completion} />
                </div>
                <ul className="space-y-2">
                  {PROFILE_CHECKLIST.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {item.complete ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          item.complete
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Professional Statistics */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Professional Statistics
                </h2>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <StatRow
                  icon={Users}
                  label="Members Trained"
                  value={String(MOCK_STATS.membersTrained)}
                />
                <StatRow
                  icon={Briefcase}
                  label="Experience"
                  value={`${MOCK_STATS.yearsExperience} Years`}
                />
                <StatRow
                  icon={Star}
                  label="Average Rating"
                  value={String(MOCK_STATS.averageRating)}
                />
                <StatRow
                  icon={CalendarIcon}
                  label="Completed Sessions"
                  value={MOCK_STATS.completedSessions.toLocaleString()}
                />
                <StatRow
                  icon={Repeat}
                  label="Retention Rate"
                  value={`${MOCK_STATS.retentionRate}%`}
                />
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Tips to Get More Members
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {MEMBER_TIPS.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
