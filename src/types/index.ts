import { Database } from "@/db/database.types";

export type ApplicationStatus =
  Database["public"]["Enums"]["application_status"]; // 'Pending' | 'Approved' | 'Rejected'

export type GymMembershipStatus =
  Database["public"]["Enums"]["gym_membership_status"];
// 'PaymentPending' | 'PaymentUploaded' | 'PaymentRejected' | 'Active' | 'Expired' | 'Cancelled' | 'Frozen'

// The combined status the UI actually displays — application lifecycle
// followed by membership/payment lifecycle once approved.
export type DisplayStatus = ApplicationStatus | GymMembershipStatus;

type ApplicationRow =
  Database["public"]["Tables"]["membership_applications"]["Row"];
type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type PlanRow = Database["public"]["Tables"]["membership_plans"]["Row"];
type GymMembershipRow = Database["public"]["Tables"]["gym_memberships"]["Row"];

export type MembershipApplication = ApplicationRow & {
  members: Pick<
    MemberRow,
    | "id"
    | "full_name"
    | "contact_email"
    | "contact_phone"
    | "photo_url"
    | "gender"
    | "date_of_birth"
    | "member_code"
  > | null;
  membership_plans: Pick<
    PlanRow,
    | "id"
    | "plan_name"
    | "plan_price"
    | "duration_months"
    | "joining_fee"
    | "plan_color"
  > | null;
  // 0 or 1 in practice (one membership per application), Supabase types
  // reverse FK relations as arrays since application_id isn't unique.
  gym_memberships: Pick<GymMembershipRow, "id" | "status" | "activated_at">[];
};

export type MyGymMembershipStatus = Pick<
  ApplicationRow,
  "id" | "status" | "plan_id"
> & {
  gym_memberships: Pick<GymMembershipRow, "id" | "status" | "plan_id">[];
};

//Application Details

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentReceiptRow =
  Database["public"]["Tables"]["payment_receipts"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

export type ApplicationDetail = ApplicationRow & {
  members: Pick<
    MemberRow,
    | "id"
    | "full_name"
    | "contact_email"
    | "contact_phone"
    | "photo_url"
    | "gender"
    | "date_of_birth"
    | "member_code"
    | "height_cm"
    | "weight_kg"
    | "fitness_goal"
    | "medical_conditions"
    | "allergies"
    | "emergency_contact_name"
    | "emergency_contact_relationship"
    | "emergency_contact_phone"
    | "address"
    | "city"
    | "state"
  > | null;
  membership_plans: Pick<
    PlanRow,
    | "id"
    | "plan_name"
    | "plan_price"
    | "duration_months"
    | "joining_fee"
    | "plan_color"
    | "plan_icon"
    | "selected_features"
    | "custom_features"
    | "validity_starts"
  > | null;
  // at most 1 in practice — application_id FK on gym_memberships
  gym_memberships: (Pick<
    GymMembershipRow,
    | "id"
    | "status"
    | "activated_at"
    | "start_date"
    | "end_date"
    | "final_amount"
    | "activated_by"
  > & {
    payments: (Pick<
      PaymentRow,
      | "id"
      | "amount"
      | "method"
      | "status"
      | "payment_date"
      | "transaction_ref"
      | "rejection_reason"
      | "verified_at"
      | "verified_by"
    > & {
      payment_receipts: Pick<
        PaymentReceiptRow,
        "id" | "file_url" | "file_type" | "is_current" | "uploaded_at"
      >[];
    })[];
  })[];
  // reviewer name — joined separately
  reviewer: Pick<UserRow, "id" | "full_name"> | null;
};

export type AppStatus =
  | "pending_review"
  | "approved_awaiting_payment"
  | "payment_uploaded"
  | "payment_verified"
  | "rejected"
  | "cancelled";
