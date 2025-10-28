"use client";
import { create } from "zustand";

type BranchState = {
  branchId: number | null;
  setBranchId: (id: number) => void;
  clearBranchId: () => void;
};

export const useBranchStore = create<BranchState>((set) => ({
  branchId: null,
  setBranchId: (id) => set({ branchId: id }),
  clearBranchId: () => set({ branchId: null }),
}));
