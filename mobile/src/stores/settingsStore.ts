import { create } from "zustand";
import type { Resolution, AspectRatio } from "../utils/constants";

interface SettingsState {
  defaultResolution: Resolution;
  defaultAspectRatio: AspectRatio;
  autoOverlayText: boolean;

  setDefaultResolution: (resolution: Resolution) => void;
  setDefaultAspectRatio: (ratio: AspectRatio) => void;
  setAutoOverlayText: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  defaultResolution: "1K" as Resolution,
  defaultAspectRatio: "1:1" as AspectRatio,
  autoOverlayText: true,
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...initialState,

  setDefaultResolution: (resolution) => set({ defaultResolution: resolution }),
  setDefaultAspectRatio: (ratio) => set({ defaultAspectRatio: ratio }),
  setAutoOverlayText: (value) => set({ autoOverlayText: value }),
  reset: () => set(initialState),
}));
