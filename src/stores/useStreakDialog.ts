import { create } from "zustand";

type StreakDialogStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useStreakDialog = create<StreakDialogStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
