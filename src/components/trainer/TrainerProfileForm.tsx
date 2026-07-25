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
  TrendingUp,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SectionCard,
} from "@/components/GymFormFields";
import { bigSquareButton } from "@/lib/styles";

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

// Stable id so a button OUTSIDE this component (e.g. the header "Save
// Changes" button rendered by the page) can submit this form via the
// HTML `form="..."` attribute.
export const TRAINER_FORM_ID = "trainer-profile-form";

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
// Reusable Components (not covered by GymFormFields)
// ============================================================================

/**
 * Combobox-style multi-select: a single dropdown trigger to pick options,
 * with the selected values rendered as filled pills directly beneath it.
 * Used for Languages Spoken and Coaching Specializations.
 */
function MultiSelectField({
  label,
  options,
  selected,
  onToggle,
  placeholder = "Select options",
}: {
  label: React.ReactNode;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 min-w-0" ref={containerRef}>
      <label className="text-sm font-medium text-foreground">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <span
            className={selected.length === 0 ? "text-muted-foreground" : ""}
          >
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open ? (
          <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card p-1.5 shadow-lg">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {option}
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => onToggle(value)}
                aria-label={`Remove ${value}`}
                className="rounded-full outline-none transition-colors hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground/40"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nothing selected yet.</p>
      )}
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
        <FormInput
          label="Certification Name"
          value={certification.name}
          onChange={(e: any) =>
            onChange(certification.id, "name", e.target.value)
          }
          placeholder="e.g. NASM CPT"
        />
        <FormInput
          label="Issuing Organization"
          value={certification.organization}
          onChange={(e: any) =>
            onChange(certification.id, "organization", e.target.value)
          }
          placeholder="e.g. National Academy of Sports Medicine"
        />
        <FormInput
          label="Issue Date"
          type="date"
          value={certification.issueDate}
          onChange={(e: any) =>
            onChange(certification.id, "issueDate", e.target.value)
          }
        />
        <FormInput
          label="Expiry Date (Optional)"
          type="date"
          value={certification.expiryDate ?? ""}
          onChange={(e: any) =>
            onChange(certification.id, "expiryDate", e.target.value)
          }
        />
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
        <FormInput
          label="Qualification"
          value={record.degree}
          onChange={(e: any) => onChange(record.id, "degree", e.target.value)}
          placeholder="e.g. B.Sc Sports Science"
        />
        <FormInput
          label="Institution"
          value={record.institution}
          onChange={(e: any) =>
            onChange(record.id, "institution", e.target.value)
          }
        />
        <FormInput
          label="Year"
          value={record.year}
          onChange={(e: any) => onChange(record.id, "year", e.target.value)}
          placeholder="e.g. 2018"
        />
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
// Main Form Component
// ============================================================================

export default function TrainerProfileForm() {
  const [profile, setProfile] = React.useState<TrainerProfile>(MOCK_PROFILE);

  const update = React.useCallback(
    <K extends keyof TrainerProfile>(field: K, value: TrainerProfile[K]) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
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
  };

  const removeCertification = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), degree: "", institution: "", year: "" },
      ],
    }));
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
  };

  const removeEducation = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire up to your save/mutation call here.
  };

  const completion = calcCompletion(PROFILE_CHECKLIST);

  return (
    <form
      id={TRAINER_FORM_ID}
      onSubmit={handleSave}
      className="flex flex-col lg:flex-row gap-6 lg:gap-8"
    >
      {/* Left Column - Form */}
      <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
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
            <FormInput
              label="Full Name"
              required
              value={profile.fullName}
              onChange={(e: any) => update("fullName", e.target.value)}
              placeholder="Rahul Sharma"
            />
            <FormInput
              label="Professional Title"
              required
              value={profile.professionalTitle}
              onChange={(e: any) => update("professionalTitle", e.target.value)}
              placeholder="Certified Strength & Conditioning Coach"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Short Bio<span className="text-destructive ml-1">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {profile.bio.length} / 250
              </span>
            </div>
            <FormTextarea
              value={profile.bio}
              maxLength={250}
              rows={3}
              onChange={(e: any) => update("bio", e.target.value)}
              placeholder="Helping members build strength, lose fat, and improve overall fitness through personalized training programs."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect
              label="Gender"
              value={profile.gender}
              onChange={(e: any) => update("gender", e.target.value)}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <FormInput
              label="Date of Birth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e: any) => update("dateOfBirth", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Phone Number"
              value={profile.phone}
              onChange={(e: any) => update("phone", e.target.value)}
            />
            <FormInput
              label="Email Address"
              value={profile.email}
              readOnly
              disabled
            />
          </div>

          <MultiSelectField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> Languages Spoken
              </span>
            }
            options={LANGUAGE_OPTIONS}
            selected={profile.languages}
            onToggle={(v) => toggleInArray("languages", v)}
            placeholder="Select languages"
          />
        </SectionCard>

        {/* Professional Information */}
        <SectionCard
          title="Professional Information"
          description="Information that helps members choose the right trainer."
          icon={Briefcase}
        >
          <div className="sm:w-48">
            <FormInput
              label="Years of Experience"
              type="number"
              min={0}
              value={profile.yearsExperience}
              onChange={(e: any) =>
                update("yearsExperience", Number(e.target.value))
              }
            />
          </div>

          <MultiSelectField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5" /> Coaching Specializations
              </span>
            }
            options={SPECIALIZATION_OPTIONS}
            selected={profile.specializations}
            onToggle={(v) => toggleInArray("specializations", v)}
            placeholder="Select specializations"
          />

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Award className="h-3.5 w-3.5" /> Fitness Certifications
              </span>
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
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> Education
              </span>
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

          <FormTextarea
            label="Coaching Experience"
            rows={3}
            value={profile.coachingExperience}
            onChange={(e: any) => update("coachingExperience", e.target.value)}
            placeholder="Explain your professional background."
          />

          <FormTextarea
            label="Training Philosophy"
            rows={3}
            value={profile.trainingPhilosophy}
            onChange={(e: any) => update("trainingPhilosophy", e.target.value)}
            placeholder="Focus on progressive overload, proper form, sustainable habits, and long-term health."
          />
        </SectionCard>

        {/* Availability */}
        <SectionCard
          title="Availability"
          description="Let members know when and how you coach."
          icon={Clock3}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Working Days
            </label>
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
            <FormInput
              label="Start Time"
              type="time"
              value={profile.startTime}
              onChange={(e: any) => update("startTime", e.target.value)}
            />
            <FormInput
              label="End Time"
              type="time"
              value={profile.endTime}
              onChange={(e: any) => update("endTime", e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Available {formatTime(profile.startTime)} –{" "}
            {formatTime(profile.endTime)}
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Session Types
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SESSION_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
                >
                  <Checkbox
                    checked={profile.sessionTypes.includes(type)}
                    onCheckedChange={() => toggleInArray("sessionTypes", type)}
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
            <FormInput
              label="Instagram"
              value={profile.instagram}
              onChange={(e: any) => update("instagram", e.target.value)}
              placeholder="@yourhandle"
            />
            <FormInput
              label="LinkedIn"
              value={profile.linkedin}
              onChange={(e: any) => update("linkedin", e.target.value)}
              placeholder="linkedin.com/in/yourname"
            />
            <FormInput
              label="YouTube"
              value={profile.youtube}
              onChange={(e: any) => update("youtube", e.target.value)}
              placeholder="youtube.com/@yourchannel"
            />
            <FormInput
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Website
                </span>
              }
              value={profile.website}
              onChange={(e: any) => update("website", e.target.value)}
              placeholder="yourwebsite.com"
            />
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
        <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 py-4 -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 flex justify-end gap-2 sm:gap-3">
          <Button variant="outline" className={bigSquareButton}>
            Cancel
          </Button>
          <Button type="submit" className={`gap-2 ${bigSquareButton}`}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-6 order-1 lg:order-2">
        <div className="lg:sticky lg:top-24 space-y-6">
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

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 rounded-xl"
              >
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
    </form>
  );
}
