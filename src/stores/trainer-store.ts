import { create } from "zustand";
import { persist } from "zustand/middleware";

type TrainerStore = {
  activeTrainerId: string | null;
  activeGymId: string | null;

  setTrainerContext: (trainerId: string, gymId: string) => void;
  clearTrainerContext: () => void;
};

export const useTrainerStore = create<TrainerStore>()(
  persist(
    (set) => ({
      activeTrainerId: null,
      activeGymId: null,

      setTrainerContext: (trainerId, gymId) => {
        set({
          activeTrainerId: trainerId,
          activeGymId: gymId,
        });
      },

      clearTrainerContext: () => {
        set({
          activeTrainerId: null,
          activeGymId: null,
        });
      },
    }),
    {
      name: "trainer-store",
    },
  ),
);
