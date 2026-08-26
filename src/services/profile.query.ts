import { Database } from "@/db/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabaseClient = SupabaseClient<Database>;

export type MemberMembership = {
  id: string;
  memberId: string;
  gymId: string;
  status: "Active" | "Scheduled";
  startDate: string;
  endDate: string | null;
};

export type MemberGym = {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
};

export type CurrentUserProfile = {
  id: string; // users.id
  memberId: string; // members.id

  fullName: string | null;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  accountStatus: string;

  memberships: MemberMembership[];
  gyms: MemberGym[];
};

export async function getCurrentMemberProfile(
  supabase: TypedSupabaseClient,
  clerkId: string,
) {
  // ------------------------------------------------------------
  // 1. Get application user
  // ------------------------------------------------------------

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(
      `
        id,
        full_name,
        email,
        username,
        avatar_url,
        role,
        account_status
      `,
    )
    .eq("clerk_id", clerkId)
    .single();

  if (userError) {
    return {
      success: false as const,
      error: userError.message,
    };
  }

  // ------------------------------------------------------------
  // 2. Get member ID
  //
  // users.id !== members.id
  // ------------------------------------------------------------

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (memberError) {
    return {
      success: false as const,
      error: memberError.message,
    };
  }

  // ------------------------------------------------------------
  // 3. Get Active + Scheduled memberships
  // ------------------------------------------------------------

  const { data: membershipRows, error: membershipError } = await supabase
    .from("gym_memberships")
    .select(
      `
        id,
        member_id,
        gym_id,
        start_date,
        end_date,
        status,

        gyms (
          id,
          name,
          code,
          logo_url
        )
      `,
    )
    .eq("member_id", member.id)
    .in("status", ["Active", "Scheduled"])
    .order("start_date", {
      ascending: true,
    });

  if (membershipError) {
    return {
      success: false as const,
      error: membershipError.message,
    };
  }

  // ------------------------------------------------------------
  // 4. Normalize memberships
  // ------------------------------------------------------------

  const memberships: MemberMembership[] = (membershipRows ?? []).map((row) => ({
    id: row.id,
    memberId: row.member_id,
    gymId: row.gym_id,
    status: row.status as "Active" | "Scheduled",
    startDate: row.start_date,
    endDate: row.end_date,
  }));

  // ------------------------------------------------------------
  // 5. Normalize unique gyms
  // ------------------------------------------------------------

  const gymsMap = new Map<string, MemberGym>();

  for (const row of membershipRows ?? []) {
    const gym = row.gyms as {
      id: string;
      name: string;
      code: string;
      logo_url: string | null;
    } | null;

    if (!gym) continue;

    if (!gymsMap.has(gym.id)) {
      gymsMap.set(gym.id, {
        id: gym.id,
        name: gym.name,
        code: gym.code,
        logoUrl: gym.logo_url,
      });
    }
  }

  const gyms = Array.from(gymsMap.values());

  // ------------------------------------------------------------
  // 6. Return profile
  // ------------------------------------------------------------

  return {
    success: true as const,

    data: {
      id: user.id,

      // IMPORTANT:
      // This is members.id, NOT users.id
      memberId: member.id,

      fullName: user.full_name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatar_url,
      role: user.role,
      accountStatus: user.account_status,

      memberships,
      gyms,
    },
  };
}

export type CurrentMemberProfileResult = Extract<
  Awaited<ReturnType<typeof getCurrentMemberProfile>>,
  { success: true }
>["data"];

// Owner Part
export async function getCurrentOwnerProfile(
  supabase: TypedSupabaseClient,
  clerkId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      full_name,
      email,
      username,
      phone,
      avatar_url,
      role,
      account_status,
      gyms (
        id,
        name,
        code,
        logo_url
      )
      `,
    )
    .eq("clerk_id", clerkId)
    .eq("role", "owner")
    .single();

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data,
  };
}

export type CurrentOwnerProfileResult = Extract<
  Awaited<ReturnType<typeof getCurrentOwnerProfile>>,
  { success: true }
>["data"];

//trainer part

export async function getCurrentTrainerProfile(
  supabase: TypedSupabaseClient,
  clerkId: string,
) {
  // Get the current user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(
      `
      id,
      full_name,
      email,
      username,
      phone,
      avatar_url,
      role,
      account_status
    `,
    )
    .eq("clerk_id", clerkId)
    .eq("role", "trainer")
    .single();

  if (userError) {
    return {
      success: false as const,
      error: userError.message,
    };
  }

  // Get ALL trainer records for this user.
  // Each row represents this trainer in one gym.
  const { data: trainers, error: trainersError } = await supabase
    .from("trainers")
    .select(
      `
      id,
      full_name,
      contact_email,
      contact_phone,
      photo_url,
      trainer_code,
      profile_id,
      gym_id,
      employee_id,
      status,
      gyms (
        id,
        name,
        code,
        logo_url
      )
    `,
    )
    .eq("profile_id", user.id)
    .is("deleted_at", null)
    .eq("status", "Active");

  if (trainersError) {
    return {
      success: false as const,
      error: trainersError.message,
    };
  }

  return {
    success: true as const,
    data: {
      ...user,
      trainers,
    },
  };
}

export type CurrentTrainerProfileResult = Extract<
  Awaited<ReturnType<typeof getCurrentTrainerProfile>>,
  { success: true }
>["data"];
