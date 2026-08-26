import { create } from "zustand";
import { persist } from "zustand/middleware";

type OwnerInfo = {
  fullName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string | null;
};

type GymInfo = {
  name: string;
  code: string;
  logoUrl: string | null;
};

type OwnerStore = {
  // --------------------------------------------------
  // Current context
  // --------------------------------------------------

  activeOwnerId: string | null;
  activeGymId: string | null;

  // --------------------------------------------------
  // Owner info
  // --------------------------------------------------

  owner: OwnerInfo | null;

  // --------------------------------------------------
  // Active gym info
  // --------------------------------------------------

  gym: GymInfo | null;

  // --------------------------------------------------
  // Set current context
  // --------------------------------------------------

  setActiveOwner: (ownerId: string) => void;
  setActiveGym: (gymId: string) => void;

  setActiveOwnerContext: (ownerId: string, gymId: string) => void;

  // --------------------------------------------------
  // Set owner info
  // --------------------------------------------------

  setOwner: (owner: OwnerInfo) => void;

  // --------------------------------------------------
  // Set gym info
  // --------------------------------------------------

  setGym: (gym: GymInfo) => void;

  // --------------------------------------------------
  // Clear everything
  // --------------------------------------------------

  clearActiveOwner: () => void;
};

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set) => ({
      // --------------------------------------------------
      // Active context
      // --------------------------------------------------

      activeOwnerId: null,
      activeGymId: null,

      // --------------------------------------------------
      // Owner info
      // --------------------------------------------------

      owner: null,

      // --------------------------------------------------
      // Active gym info
      // --------------------------------------------------

      gym: null,

      // --------------------------------------------------
      // Individual setters
      // --------------------------------------------------

      setActiveOwner: (ownerId) => {
        set({
          activeOwnerId: ownerId,
        });
      },

      setActiveGym: (gymId) => {
        set({
          activeGymId: gymId,
        });
      },

      // --------------------------------------------------
      // Set complete active context
      // --------------------------------------------------

      setActiveOwnerContext: (ownerId, gymId) => {
        console.log("owner store value set");

        set({
          activeOwnerId: ownerId,
          activeGymId: gymId,
        });
      },

      // --------------------------------------------------
      // Set owner info
      // --------------------------------------------------

      setOwner: (owner) => {
        set({
          owner,
        });
      },

      // --------------------------------------------------
      // Set gym info
      // --------------------------------------------------

      setGym: (gym) => {
        set({
          gym,
        });
      },

      // --------------------------------------------------
      // Clear everything
      // --------------------------------------------------

      clearActiveOwner: () => {
        console.log("Cleared owner store");

        set({
          activeOwnerId: null,
          activeGymId: null,
          owner: null,
          gym: null,
        });
      },
    }),
    {
      name: "owner-store",
      version: 1,

      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            activeOwnerId: null,
            activeGymId: null,
            owner: null,
            gym: null,
          };
        }

        return persistedState;
      },
    },
  ),
);
