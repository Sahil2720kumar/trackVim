export type Role = "owner" | "trainer" | "member";

// Trainer is intentionally excluded from self-serve selection. Trainer role
// is only ever granted via an owner-issued invitation (see
// /api/owner/invite-trainer), so it can't be chosen here or forged through
// the join-gym form.
export const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "owner",
    label: "Gym Owner",
    description: "I run a gym and want to manage members, trainers, and plans.",
  },
  {
    value: "member",
    label: "Member",
    description: "I work out at a gym and want to track my sessions and attendance.",
  },
];

/** Generates a short, human-friendly gym invite code, e.g. "FIT-7K2Q" */
export function generateGymCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
