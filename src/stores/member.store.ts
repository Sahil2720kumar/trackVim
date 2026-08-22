// member.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type MemberStore = {
  // Current context
  activeMemberId: string | null;
  activeGymId: string | null;
  activeMembershipId: string | null;

  // All available data
  memberships: MemberMembership[];
  gyms: MemberGym[];

  // Set current context
  setActiveMember: (memberId: string) => void;
  setActiveGym: (gymId: string) => void;
  setActiveMembership: (membershipId: string) => void;

  setActiveMemberContext: (
    memberId: string,
    gymId: string,
    membershipId: string,
  ) => void;

  // Set all memberships / gyms
  setMemberships: (memberships: MemberMembership[]) => void;
  setGyms: (gyms: MemberGym[]) => void;

  // Switch gym
  switchGym: (gymId: string) => void;

  // Clear everything
  clearActiveMember: () => void;
};

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      // --------------------------------------------------
      // Active context
      // --------------------------------------------------

      activeMemberId: null,
      activeGymId: null,
      activeMembershipId: null,

      // --------------------------------------------------
      // All memberships / gyms
      // --------------------------------------------------

      memberships: [],
      gyms: [],

      // --------------------------------------------------
      // Individual setters
      // --------------------------------------------------

      setActiveMember: (memberId) => {
        set({
          activeMemberId: memberId,
        });
      },

      setActiveGym: (gymId) => {
        set({
          activeGymId: gymId,
        });
      },

      setActiveMembership: (membershipId) => {
        set({
          activeMembershipId: membershipId,
        });
      },

      // --------------------------------------------------
      // Set complete active context
      // --------------------------------------------------

      setActiveMemberContext: (memberId, gymId, membershipId) => {
        console.log("store value set");
        set({
          activeMemberId: memberId,
          activeGymId: gymId,
          activeMembershipId: membershipId,
        });
      },

      // --------------------------------------------------
      // Store all memberships
      // --------------------------------------------------

      setMemberships: (memberships) => {
        set({
          memberships,
        });
      },

      // --------------------------------------------------
      // Store all gyms
      // --------------------------------------------------

      setGyms: (gyms) => {
        set({
          gyms,
        });
      },

      // --------------------------------------------------
      // Switch gym
      // --------------------------------------------------

      switchGym: (gymId) => {
        const { memberships } = get();

        const membership = memberships.find(
          (membership) => membership.gymId === gymId,
        );

        if (!membership) {
          console.error(
            `Cannot switch gym. No membership found for gym: ${gymId}`,
          );
          return;
        }

        set({
          activeGymId: gymId,
          activeMembershipId: membership.id,
        });
      },

      // --------------------------------------------------
      // Clear everything
      // --------------------------------------------------

      clearActiveMember: () => {
        console.log("Cleared store");
        set({
          activeMemberId: null,
          activeGymId: null,
          activeMembershipId: null,
          memberships: [],
          gyms: [],
        });
      },
    }),
    {
      name: "member-store",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Moving from unversioned (0) to version 1.
          // MemberMembership and MemberGym shapes changed, so we safely
          // reset the lists and active identifiers to avoid crashes.
          return {
            ...persistedState,
            memberships: [],
            gyms: [],
            activeMemberId: null,
            activeGymId: null,
            activeMembershipId: null,
          };
        }
        return persistedState;
      },
    },
  ),
);
