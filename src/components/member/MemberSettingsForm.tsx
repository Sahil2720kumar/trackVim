"use client";

import { useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Loader2,
  Hash,
  Building2,
  Crown,
  Clock,
  Ruler,
  Scale,
  Lock,
  UserRoundPlus,
  AlertTriangle,
  PhoneCall,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { CreateMemberInput, createMemberSchema } from "@/db/validators";
import {
  BLOOD_GROUP_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STATE_OPTIONS,
} from "@/constants/profile-options";
import { updateMemberProfileAction } from "@/actions/member.action";
import { MembershipStatusKind } from "@/services/member.query";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MembershipSnapshot {
  kind: MembershipStatusKind;
  daysLeft?: number;
  planName?: string | null;
  gymName?: string | null;
  startDate?: string;
  endDate?: string;
}

interface NotificationSettings {
  workoutReminders: boolean;
  attendanceReminders: boolean;
  membershipExpiryAlerts: boolean;
  announcements: boolean;
  messagesFromTrainer: boolean;
}

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
// Mapping — same merge boundary as MemberProfileForm: only fields the
// member themself can edit. Gym-side fields stay untouched, driven by
// the `membership` prop instead.
// ─────────────────────────────────────────────────────────────────────────────

function toDefaultValues(
  member: Record<string, unknown> | undefined,
): Partial<CreateMemberInput> {
  if (!member) return {};
  const str = (v: unknown) => (v == null ? "" : String(v));
  return {
    fullName: str(member.full_name),
    contactPhone: str(member.contact_phone),
    dateOfBirth: str(member.date_of_birth),
    gender: member.gender as CreateMemberInput["gender"],
    occupation: str(member.occupation),
    bloodGroup: member.blood_group as CreateMemberInput["bloodGroup"],
    address: str(member.address),
    city: str(member.city),
    state: str(member.state),
    pinCode: str(member.pin_code),
    heightCm: str(member.height_cm),
    weightKg: str(member.weight_kg),
    fitnessGoal: member.fitness_goal as CreateMemberInput["fitnessGoal"],
    medicalConditions: str(member.medical_conditions),
    allergies: str(member.allergies),
    physicalNotes: str(member.physical_notes),
    emergencyContactName: str(member.emergency_contact_name),
    emergencyContactRelationship:
      member.emergency_contact_relationship as CreateMemberInput["emergencyContactRelationship"],
    emergencyContactPhone: str(member.emergency_contact_phone),
    emergencyContactAddress: str(member.emergency_contact_address),
    additionalNotes: str(member.additional_notes),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
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

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state — shown when there's no member row yet (onboarding incomplete)
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
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
        <Button
          onClick={() => router.push("/member/onboarding/profile")}
          className="mt-2 gap-2"
        >
          Complete Profile
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Card — kept from the original, wired to real membership data
// ─────────────────────────────────────────────────────────────────────────────

function ProfileCard({
  fullName,
  memberId,
  email,
  phone,
  membership,
  avatarUrl,
  existingPhotoUrl,
  onSelectPhoto,
  onRemovePhoto,
}: {
  fullName: string;
  memberId?: string;
  email: string;
  phone: string;
  membership: MembershipSnapshot;
  avatarUrl: string | null;
  existingPhotoUrl: string | null;
  onSelectPhoto: (file: File) => void;
  onRemovePhoto: () => void;
}) {
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayAvatar = avatarUrl ?? existingPhotoUrl;

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
    onSelectPhoto(file);
  }

  const statusBadge =
    membership.kind === "active" ? (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        Active Member
      </Badge>
    ) : membership.kind === "not-started" ? (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
        Starts Soon
      </Badge>
    ) : membership.kind === "frozen" ? (
      <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100">
        Frozen
      </Badge>
    ) : membership.kind === "payment-pending" ? (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
        Payment Pending
      </Badge>
    ) : membership.kind === "no-gym" ? (
      <Badge variant="outline">No Active Membership</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        {membership.kind === "expired"
          ? "Expired"
          : membership.kind === "cancelled"
            ? "Cancelled"
            : "Attention Needed"}
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
                    src={displayAvatar ?? undefined}
                    alt={fullName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {getInitials(fullName)}
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
                  onClick={onRemovePhoto}
                  disabled={!displayAvatar}
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
                  {fullName || "—"}
                </h3>
                {statusBadge}
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  {email || "—"}
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    managed in account
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  {phone || "—"}
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    managed in account
                  </span>
                </div>
                {memberId && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                    {memberId}
                  </div>
                )}
                {membership.gymName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {membership.gymName}
                  </div>
                )}
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
                  {membership.planName ?? "No Plan"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valid Until</p>
              <p className="text-sm font-semibold text-green-600">
                {formatDate(membership.endDate)}
              </p>
            </div>
            {membership.kind === "active" &&
            membership.daysLeft !== undefined ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700 leading-tight">
                    {membership.daysLeft} Days Left
                  </p>
                  <p className="text-xs text-green-600/80 leading-tight">
                    Membership Active
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight capitalize">
                    {membership.kind.replace("-", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    See gym for details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MemberSettingsForm({
  memberId,
  initialData,
  membership,
  clerkEmail,
}: {
  memberId?: string;
  initialData?: Record<string, unknown>;
  membership: MembershipSnapshot;
  clerkEmail: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    workoutReminders: false,
    attendanceReminders: false,
    membershipExpiryAlerts: false,
    announcements: false,
    messagesFromTrainer: false,
  });

  const existingPhotoUrl = (initialData?.photo_url as string) || null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: toDefaultValues(initialData),
    mode: "onChange",
  });
  const hasChanges = isDirty || photoChanged;

  const fullName = watch("fullName") ?? "";
  const contactPhone = watch("contactPhone") ?? "";
  const watchedNotes = watch("additionalNotes");

  function handleSelectPhoto(file: File) {
    setPhotoFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setPhotoChanged(true);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setAvatarUrl(null);
    setPhotoChanged(existingPhotoUrl != null);
    // Note: this only clears the local preview. If you need to actually
    // delete the stored photo on save, add a `removePhoto: true` flag to
    // the submit payload and handle it in updateMemberProfileAction.
  }

  function handleResetChanges() {
    if (isDirty || photoChanged) {
      const confirmed = window.confirm(
        "Discard your unsaved changes? This cannot be undone.",
      );
      if (!confirmed) return;
    }
    reset(toDefaultValues(initialData));
    setAvatarUrl(null);
    setPhotoFile(null);
    setPhotoChanged(false);
  }

  const onSubmit = (data: CreateMemberInput) => {
    if (isPending || !memberId) return;
    startTransition(async () => {
      try {
        const result = await updateMemberProfileAction(
          memberId,
          data,
          photoFile,
        );
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Profile updated successfully");
        reset(data);
        setPhotoFile(null);
        setPhotoChanged(false);
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("Error saving profile. Please try again.");
      }
    });
  };

  if (!memberId) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile, fitness information, and notification
            preferences.
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile, fitness information, and notification
          preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {hasChanges && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            You have unsaved changes
          </div>
        )}

        {/* Profile Overview — kept from the original */}
        <ProfileCard
          fullName={fullName}
          memberId={initialData?.member_code as string | undefined}
          email={clerkEmail}
          phone={contactPhone}
          membership={membership}
          avatarUrl={avatarUrl}
          existingPhotoUrl={existingPhotoUrl}
          onSelectPhoto={handleSelectPhoto}
          onRemovePhoto={handleRemovePhoto}
        />

        {/* Personal Information — email/phone shown read-only in ProfileCard above, not here */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={User} />
              <div>
                <CardTitle className="text-base font-semibold">
                  Personal Information
                </CardTitle>
                <CardDescription>Keep your details up to date.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name
                  <RequiredMark />
                </Label>
                <Input
                  id="fullName"
                  placeholder="Rahul Sharma"
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                />
                <FieldError message={errors.dateOfBirth?.message} />
              </div>

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>
                      Gender
                      <RequiredMark />
                    </Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
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

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="Software Engineer"
                  {...register("occupation")}
                />
                <FieldError message={errors.occupation?.message} />
              </div>

              <Controller
                control={control}
                name="bloodGroup"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.bloodGroup?.message} />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={MapPin} />
              <CardTitle className="text-base font-semibold">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter address"
                {...register("address")}
              />
              <FieldError message={errors.address?.message} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city name"
                  {...register("city")}
                />
                <FieldError message={errors.city?.message} />
              </div>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.state?.message} />
                  </div>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input
                  id="pinCode"
                  placeholder="Enter pin code"
                  {...register("pinCode")}
                />
                <FieldError message={errors.pinCode?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Contact */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <SectionIcon icon={PhoneCall} />
                <CardTitle className="text-base font-semibold">
                  Emergency Contact
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Neha Sharma"
                  {...register("emergencyContactName")}
                />
                <FieldError message={errors.emergencyContactName?.message} />
              </div>

              <Controller
                control={control}
                name="emergencyContactRelationship"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      message={errors.emergencyContactRelationship?.message}
                    />
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  placeholder="+91 91234 56789"
                  {...register("emergencyContactPhone")}
                />
                <FieldError message={errors.emergencyContactPhone?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactAddress">
                  Emergency Address
                </Label>
                <Input
                  id="emergencyContactAddress"
                  placeholder="456, Green Park Avenue..."
                  {...register("emergencyContactAddress")}
                />
                <FieldError message={errors.emergencyContactAddress?.message} />
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
                  <Label htmlFor="heightCm" className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    Height (cm)
                  </Label>
                  <Input
                    id="heightCm"
                    type="number"
                    placeholder="175"
                    {...register("heightCm")}
                  />
                  <FieldError message={errors.heightCm?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightKg" className="flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.1"
                    placeholder="72"
                    {...register("weightKg")}
                  />
                  <FieldError message={errors.weightKg?.message} />
                </div>
              </div>

              <Controller
                control={control}
                name="fitnessGoal"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Fitness Goal</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
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
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <SectionIcon icon={Heart} />
                <CardTitle className="text-base font-semibold">
                  Medical Information
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Only visible to authorized trainers and gym staff
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">
                Medical Conditions (if any)
              </Label>
              <Textarea
                id="medicalConditions"
                placeholder="No known medical conditions"
                className="resize-none min-h-[84px]"
                {...register("medicalConditions")}
              />
              <FieldError message={errors.medicalConditions?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies (if any)</Label>
              <Textarea
                id="allergies"
                placeholder="None"
                className="resize-none min-h-[84px]"
                {...register("allergies")}
              />
              <FieldError message={errors.allergies?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalNotes">Physical Notes (if any)</Label>
              <Textarea
                id="physicalNotes"
                placeholder="Occasional lower back discomfort"
                className="resize-none min-h-[84px]"
                {...register("physicalNotes")}
              />
              <FieldError message={errors.physicalNotes?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={FileText} />
              <CardTitle className="text-base font-semibold">
                Additional Notes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              id="additionalNotes"
              placeholder="Anything else you'd like your trainer to know?"
              className="resize-none min-h-[100px]"
              {...register("additionalNotes")}
            />
            <p className="text-xs text-muted-foreground text-right">
              {watchedNotes?.length || 0} / 500 characters
            </p>
            <FieldError message={errors.additionalNotes?.message} />
          </CardContent>
        </Card>

        {/* Notification Preferences — local state until backed by an action */}
        {/* <Card className="border border-border shadow-sm">
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
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(v) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: v }))
                    }
                    aria-label={item.label}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

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
                    {(initialData?.member_code as string) ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Gym</p>
                  <p className="text-sm font-medium text-foreground">
                    {membership.gymName ?? "—"}
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
                      {membership.planName ?? "—"}
                    </p>
                    {membership.kind === "active" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined On</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(initialData?.created_at as string | undefined)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(initialData?.updated_at as string | undefined)}
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
                disabled={isPending || !hasChanges}
              >
                <RefreshCcw className="h-4 w-4" />
                Reset Changes
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none gap-1.5"
                disabled={!isValid || isPending || !hasChanges}
              >
                {isPending ? (
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
    </div>
  );
}
