import { create } from "zustand";
import { persist } from "zustand/middleware";

type TrainerInfo = {
  fullName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string | null;
};

type GymInfo = {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
};

type TrainerContext = {
  trainerId: string;
  gymId: string;
};

type TrainerStore = {
  // --------------------------------------------------
  // All trainer/gym assignments
  // --------------------------------------------------

  trainerContexts: TrainerContext[];

  // --------------------------------------------------
  // Current active context
  // --------------------------------------------------

  activeTrainerId: string | null;
  activeGymId: string | null;

  // --------------------------------------------------
  // Current trainer info
  // --------------------------------------------------

  trainer: TrainerInfo | null;

  // --------------------------------------------------
  // Current gym info
  // --------------------------------------------------

  gym: GymInfo | null;

  // --------------------------------------------------
  // Set all available trainer/gym contexts
  // --------------------------------------------------

  setTrainerContexts: (contexts: TrainerContext[]) => void;

  // --------------------------------------------------
  // Set current context
  // --------------------------------------------------

  setActiveTrainer: (trainerId: string) => void;
  setActiveGym: (gymId: string) => void;

  setTrainerContext: (trainerId: string, gymId: string) => void;

  // --------------------------------------------------
  // Set trainer info
  // --------------------------------------------------

  setTrainer: (trainer: TrainerInfo) => void;

  // --------------------------------------------------
  // Set gym info
  // --------------------------------------------------

  setGym: (gym: GymInfo) => void;

  // --------------------------------------------------
  // Clear everything
  // --------------------------------------------------

  clearTrainerContext: () => void;
};

export const useTrainerStore = create<TrainerStore>()(
  persist(
    (set) => ({
      // --------------------------------------------------
      // All available trainer/gym assignments
      // --------------------------------------------------

      trainerContexts: [],

      // --------------------------------------------------
      // Active context
      // --------------------------------------------------

      activeTrainerId: null,
      activeGymId: null,

      // --------------------------------------------------
      // Current trainer info
      // --------------------------------------------------

      trainer: null,

      // --------------------------------------------------
      // Current gym info
      // --------------------------------------------------

      gym: null,

      // --------------------------------------------------
      // Set all available contexts
      // --------------------------------------------------

      setTrainerContexts: (contexts) => {
        set({
          trainerContexts: contexts,
        });
      },

      // --------------------------------------------------
      // Individual setters
      // --------------------------------------------------

      setActiveTrainer: (trainerId) => {
        set({
          activeTrainerId: trainerId,
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

      setTrainerContext: (trainerId, gymId) => {
        set({
          activeTrainerId: trainerId,
          activeGymId: gymId,
        });
      },

      // --------------------------------------------------
      // Set trainer info
      // --------------------------------------------------

      setTrainer: (trainer) => {
        set({
          trainer,
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

      clearTrainerContext: () => {
        set({
          trainerContexts: [],
          activeTrainerId: null,
          activeGymId: null,
          trainer: null,
          gym: null,
        });
      },
    }),
    {
      name: "trainer-store",
      version: 2,

      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          return {
            ...(persistedState as object),

            trainerContexts: [],

            activeTrainerId: null,
            activeGymId: null,

            trainer: null,
            gym: null,
          };
        }

        return persistedState as TrainerStore;
      },
    },
  ),
);
