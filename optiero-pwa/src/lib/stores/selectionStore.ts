import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SelectedEmployee = {
  employeeId: number;
  branchId: number;
  firstName?: string | null;
  lastName?: string | null;
  employeeCode?: string | null;
  designation?: string | null;
};

type employeeState = {
  selectedEmployee: SelectedEmployee | null;
  setSelectedEmployee: (employee: SelectedEmployee | null) => void;
  clear: () => void;
};

export const useSelection = create<employeeState>()(
  persist(
    (set) => ({
      selectedEmployee: null,
      setSelectedEmployee: (employee) =>
        set(() => ({ selectedEmployee: employee })),
      clear: () => set(() => ({ selectedEmployee: null })),
    }),
    {
      name: "selected-employee",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
    },
  ),
);
