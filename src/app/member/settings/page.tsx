"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Camera,
  Phone,
  Mail,
  CalendarDays,
  MapPin,
  Heart,
  Bell,
  ShieldCheck,
  Dumbbell,
  Save,
  RefreshCcw,
  ChevronRight,
  Upload,
  Trash2,
  SlidersHorizontal,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Hash,
  Building2,
  Crown,
  Clock,
  Ruler,
  Scale,
  Lock,
  UserRoundPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type Relationship =
  | "Parent"
  | "Spouse"
  | "Sibling"
  | "Friend"
  | "Guardian"
  | "Other";
type FitnessGoal =
  | "weight_loss"
  | "muscle_gain"
  | "general_fitness"
  | "strength_training"
  | "athletic_performance";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type DevMode = "normal" | "loading" | "errors";

interface MemberProfile {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  avatarUrl: string | null;
  gym: string;
  membershipPlan: string;
  membershipStatus: "active" | "expiring_soon" | "expired";
  membershipValidUntil: string;
  daysLeft: number;
  joinedOn: string;
  accountCreated: string;
  lastLogin: string;
}

interface EmergencyContact {
  contactName: string;
  relationship: Relationship;
  phone: string;
}

interface FitnessProfile {
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  medicalNotes: string;
}

interface NotificationSettings {
  workoutReminders: boolean;
  attendanceReminders: boolean;
  membershipExpiryAlerts: boolean;
  announcements: boolean;
  messagesFromTrainer: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const MEMBER_PROFILE: MemberProfile = {
  memberId: "TRK-MBR-2026-00421",
  firstName: "Rahul",
  lastName: "Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1998-02-15",
  gender: "male",
  avatarUrl: null,
  gym: "IronForge Fitness",
  membershipPlan: "Annual Gold",
  membershipStatus: "active",
  membershipValidUntil: "22 Aug 2026",
  daysLeft: 28,
  joinedOn: "22 Aug 2025",
  accountCreated: "22 Aug 2025",
  lastLogin: "25 Jul 2026, 07:35 AM",
};

const EMERGENCY_CONTACT: EmergencyContact = {
  contactName: "Neha Sharma",
  relationship: "Spouse",
  phone: "+91 91234 56789",
};

const FITNESS_PROFILE: FitnessProfile = {
  heightCm: 175,
  weightKg: 72,
  fitnessGoal: "muscle_gain",
  experienceLevel: "intermediate",
  medicalNotes: "",
};

const NOTIFICATION_SETTINGS: NotificationSettings = {
  workoutReminders: true,
  attendanceReminders: true,
  membershipExpiryAlerts: true,
  announcements: true,
  messagesFromTrainer: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────────────────────────────────────

const phoneRegex = /^\+?[0-9\s-]{7,20}$/;

const settingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Please select a gender",
  }),
  emergencyContactName: z.string().min(1, "Contact name is required"),
  emergencyRelationship: z.enum(
    ["Parent", "Spouse", "Sibling", "Friend", "Guardian", "Other"],
    { required_error: "Please select a relationship" },
  ),
  emergencyPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  heightCm: z.coerce
    .number({ invalid_type_error: "Height is required" })
    .min(50, "Enter a height above 50 cm")
    .max(250, "Enter a height below 250 cm"),
  weightKg: z.coerce
    .number({ invalid_type_error: "Weight is required" })
    .min(20, "Enter a weight above 20 kg")
    .max(300, "Enter a weight below 300 kg"),
  fitnessGoal: z.enum(
    [
      "weight_loss",
      "muscle_gain",
      "general_fitness",
      "strength_training",
      "athletic_performance",
    ],
    { required_error: "Please select a fitness goal" },
  ),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level",
  }),
  medicalNotes: z.string().optional(),
  notifications: z.object({
    workoutReminders: z.boolean(),
    attendanceReminders: z.boolean(),
    membershipExpiryAlerts: z.boolean(),
    announcements: z.boolean(),
    messagesFromTrainer: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const DEFAULT_VALUES: SettingsFormValues = {
  firstName: MEMBER_PROFILE.firstName,
  lastName: MEMBER_PROFILE.lastName,
  email: MEMBER_PROFILE.email,
  phone: MEMBER_PROFILE.phone,
  dateOfBirth: MEMBER_PROFILE.dateOfBirth,
  gender: MEMBER_PROFILE.gender,
  emergencyContactName: EMERGENCY_CONTACT.contactName,
  emergencyRelationship: EMERGENCY_CONTACT.relationship,
  emergencyPhone: EMERGENCY_CONTACT.phone,
  heightCm: FITNESS_PROFILE.heightCm,
  weightKg: FITNESS_PROFILE.weightKg,
  fitnessGoal: FITNESS_PROFILE.fitnessGoal,
  experienceLevel: FITNESS_PROFILE.experienceLevel,
  medicalNotes: FITNESS_PROFILE.medicalNotes,
  notifications: { ...NOTIFICATION_SETTINGS },
};

// Deliberately invalid values used only to demonstrate the validation-error state.
const INVALID_DEMO_VALUES: SettingsFormValues = {
  ...DEFAULT_VALUES,
  firstName: "",
  lastName: "",
  email: "not-an-email",
  phone: "abc",
  emergencyContactName: "",
  emergencyPhone: "123",
  heightCm: 0,
  weightKg: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function SectionIcon({
  icon: Icon,
  className,
}: {
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0",
        className,
      )}
    >
      <Icon className="h-4.5 w-4.5 text-primary" />
    </div>
  );
}

function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-destructive mt-1.5">{message}</p>
  );
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const RELATIONSHIP_OPTIONS: Relationship[] = [
  "Parent",
  "Spouse",
  "Sibling",
  "Friend",
  "Guardian",
  "Other",
];

const FITNESS_GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "strength_training", label: "Strength Training" },
  { value: "athletic_performance", label: "Athletic Performance" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const NOTIFICATION_ITEMS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "workoutReminders",
    label: "Workout Reminders",
    description: "Get reminded about your upcoming workout sessions.",
  },
  {
    key: "attendanceReminders",
    label: "Attendance Reminders",
    description: "Get reminded to check in and maintain consistency.",
  },
  {
    key: "membershipExpiryAlerts",
    label: "Membership Expiry Alerts",
    description: "Receive alerts before your membership expires.",
  },
  {
    key: "announcements",
    label: "Announcements",
    description: "Receive important announcements from your gym.",
  },
  {
    key: "messagesFromTrainer",
    label: "Messages from Trainer",
    description: "Receive messages and updates from your trainer.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Development Controls
// ─────────────────────────────────────────────────────────────────────────────

function DevControls({
  mode,
  onChange,
}: {
  mode: DevMode;
  onChange: (mode: DevMode) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        Development Controls
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "normal" ? "default" : "outline"}
          onClick={() => onChange("normal")}
          className="gap-1.5"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          Normal
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "loading" ? "default" : "outline"}
          onClick={() => onChange("loading")}
          className="gap-1.5"
        >
          <Loader2 className="h-3.5 w-3.5" />
          Loading
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "errors" ? "default" : "outline"}
          onClick={() => onChange("errors")}
          className={cn(
            "gap-1.5",
            mode !== "errors" &&
              "text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive",
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Validation Errors
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loading state
// ─────────────────────────────────────────────────────────────────────────────

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProfileCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state — shown only if the member hasn't completed their profile yet
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onComplete }: { onComplete: () => void }) {
  return (
    <Card className="border border-dashed border-border shadow-none bg-muted/30">
      <CardContent className="flex flex-col items-center text-center gap-3 py-14 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <UserRoundPlus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Complete Your Profile
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add your personal and fitness information to help your trainer provide
          a better experience.
        </p>
        <Button onClick={onComplete} className="mt-2 gap-2">
          Complete Profile
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Card
// ─────────────────────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  avatarUrl,
  onUpload,
  onRemove,
}: {
  profile: MemberProfile;
  avatarUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Only PNG, JPG, or JPEG files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5 MB.");
      return;
    }
    setPhotoError(null);
    onUpload(file);
  }

  const statusBadge =
    profile.membershipStatus === "active" ? (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        Active Member
      </Badge>
    ) : profile.membershipStatus === "expiring_soon" ? (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
        Expiring Soon
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Expired
      </Badge>
    );

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <SectionIcon icon={User} />
          <CardTitle className="text-base font-semibold">
            Profile Overview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: photo + identity */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col items-center sm:items-start gap-3">
              <div className="relative">
                <Avatar className="h-28 w-28 border border-border">
                  <AvatarImage
                    src={avatarUrl ?? undefined}
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change profile photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-36">
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Photo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  disabled={!avatarUrl}
                  className="w-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Photo
                </Button>
                <p className="text-[11px] text-muted-foreground text-center sm:text-left">
                  PNG, JPG, JPEG (Max. 5MB)
                </p>
                {photoError && (
                  <p className="text-[11px] text-destructive text-center sm:text-left">
                    {photoError}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h3>
                {statusBadge}
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.memberId}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.gym}
                </div>
              </div>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="hidden lg:block h-auto"
          />
          <Separator className="lg:hidden" />

          {/* Right: membership snapshot (read-only) */}
          <div className="lg:w-64 flex-shrink-0 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Current Membership
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  {profile.membershipPlan}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valid Until</p>
              <p className="text-sm font-semibold text-green-600">
                {profile.membershipValidUntil}
              </p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700 leading-tight">
                  {profile.daysLeft} Days Left
                </p>
                <p className="text-xs text-green-600/80 leading-tight">
                  Membership Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MemberSettingsPage() {
  const [devMode, setDevMode] = useState<DevMode>("normal");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    MEMBER_PROFILE.avatarUrl,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { isDirty, isValid, errors } = form.formState;

  // Wire the Development Controls to the form so reviewers can preview every state.
  useEffect(() => {
    if (devMode === "errors") {
      form.reset(INVALID_DEMO_VALUES, { keepDefaultValues: true });
      window.setTimeout(() => form.trigger(), 0);
    } else if (devMode === "normal") {
      form.reset(DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devMode]);

  function handleUpload(file: File) {
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  }

  function handleRemovePhoto() {
    setAvatarUrl(null);
  }

  function handleResetChanges() {
    if (isDirty) {
      const confirmed = window.confirm(
        "Discard your unsaved changes? This cannot be undone.",
      );
      if (!confirmed) return;
    }
    form.reset(DEFAULT_VALUES);
    setShowSuccess(false);
  }

  function onSubmit(values: SettingsFormValues) {
    setIsSaving(true);
    setShowSuccess(false);
    window.setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      form.reset(values);
      window.setTimeout(() => setShowSuccess(false), 4000);
    }, 1200);
  }

  const isLoading = devMode === "loading";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        {/* Development Controls */}
        <DevControls mode={devMode} onChange={setDevMode} />

        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile, fitness information, and notification
            preferences.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <ProfileCardSkeleton />
            <CardSkeleton rows={2} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton rows={2} />
              <CardSkeleton rows={2} />
            </div>
            <CardSkeleton rows={2} />
            <CardSkeleton rows={2} />
          </div>
        ) : showEmptyState ? (
          <EmptyState onComplete={() => setShowEmptyState(false)} />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {showSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold">
                  Profile updated successfully.
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Your changes have been saved.
                </AlertDescription>
              </Alert>
            )}

            {isDirty && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                You have unsaved changes
              </div>
            )}

            {/* Profile Overview */}
            <ProfileCard
              profile={MEMBER_PROFILE}
              avatarUrl={avatarUrl}
              onUpload={handleUpload}
              onRemove={handleRemovePhoto}
            />

            {/* Personal Information */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <SectionIcon icon={User} />
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Keep your contact details up to date.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name
                      <RequiredMark />
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Rahul"
                      {...form.register("firstName")}
                    />
                    <FieldError message={errors.firstName?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name
                      <RequiredMark />
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Sharma"
                      {...form.register("lastName")}
                    />
                    <FieldError message={errors.lastName?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address
                      <RequiredMark />
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      {...form.register("email")}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number
                      <RequiredMark />
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      {...form.register("phone")}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      Date of Birth
                      <RequiredMark />
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...form.register("dateOfBirth")}
                    />
                    <FieldError message={errors.dateOfBirth?.message} />
                  </div>

                  <Controller
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          Gender
                          <RequiredMark />
                        </Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={errors.gender?.message} />
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emergency Contact */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <SectionIcon icon={Phone} />
                    <CardTitle className="text-base font-semibold">
                      Emergency Contact
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">
                      Contact Name
                      <RequiredMark />
                    </Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="Neha Sharma"
                      {...form.register("emergencyContactName")}
                    />
                    <FieldError
                      message={errors.emergencyContactName?.message}
                    />
                  </div>

                  <Controller
                    control={form.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          Relationship
                          <RequiredMark />
                        </Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError
                          message={errors.emergencyRelationship?.message}
                        />
                      </div>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">
                      Phone Number
                      <RequiredMark />
                    </Label>
                    <Input
                      id="emergencyPhone"
                      placeholder="+91 91234 56789"
                      {...form.register("emergencyPhone")}
                    />
                    <FieldError message={errors.emergencyPhone?.message} />
                  </div>
                </CardContent>
              </Card>

              {/* Fitness Information */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <SectionIcon icon={Dumbbell} />
                    <CardTitle className="text-base font-semibold">
                      Fitness Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="heightCm"
                        className="flex items-center gap-1"
                      >
                        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                        Height (cm)
                        <RequiredMark />
                      </Label>
                      <Input
                        id="heightCm"
                        type="number"
                        placeholder="175"
                        {...form.register("heightCm")}
                      />
                      <FieldError message={errors.heightCm?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="weightKg"
                        className="flex items-center gap-1"
                      >
                        <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                        Weight (kg)
                        <RequiredMark />
                      </Label>
                      <Input
                        id="weightKg"
                        type="number"
                        placeholder="72"
                        {...form.register("weightKg")}
                      />
                      <FieldError message={errors.weightKg?.message} />
                    </div>
                  </div>

                  <Controller
                    control={form.control}
                    name="fitnessGoal"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          Fitness Goal
                          <RequiredMark />
                        </Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            {FITNESS_GOAL_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={errors.fitnessGoal?.message} />
                      </div>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          Experience Level
                          <RequiredMark />
                        </Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERIENCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={errors.experienceLevel?.message} />
                      </div>
                    )}
                  />

                  <div className="space-y-2">
                    <Label
                      htmlFor="medicalNotes"
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      Medical Notes (Optional)
                    </Label>
                    <Textarea
                      id="medicalNotes"
                      placeholder="Mention any injuries, allergies or medical conditions..."
                      className="resize-none min-h-[84px]"
                      {...form.register("medicalNotes")}
                    />
                    <FieldError message={errors.medicalNotes?.message} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notification Preferences */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <SectionIcon icon={Bell} />
                  <CardTitle className="text-base font-semibold">
                    Notification Preferences
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {NOTIFICATION_ITEMS.map((item) => (
                    <Controller
                      key={item.key}
                      control={form.control}
                      name={`notifications.${item.key}` as const}
                      render={({ field }) => (
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={item.label}
                          />
                        </div>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Information (read-only) */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <SectionIcon icon={ShieldCheck} />
                  <CardTitle className="text-base font-semibold">
                    Account Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <div className="flex items-center gap-2.5">
                    <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member ID</p>
                      <p className="text-sm font-medium text-foreground">
                        {MEMBER_PROFILE.memberId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Current Gym
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {MEMBER_PROFILE.gym}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Membership Plan
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          {MEMBER_PROFILE.membershipPlan}
                        </p>
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-[10px] px-1.5 py-0">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Joined On</p>
                      <p className="text-sm font-medium text-foreground">
                        {MEMBER_PROFILE.joinedOn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account Created
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {MEMBER_PROFILE.accountCreated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Login
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {MEMBER_PROFILE.lastLogin}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 -mx-4 sm:-mx-6 lg:-mx-8 mt-8 border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">
                      Your information is secure.
                    </span>{" "}
                    We use industry-standard encryption to protect your data.
                  </span>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none gap-1.5"
                    onClick={handleResetChanges}
                    disabled={isSaving}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none gap-1.5"
                    disabled={!isValid || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
