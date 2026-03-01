import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "./mmkvStorage";
import {
  MAX_REFERENCE_IMAGES,
  DEFAULT_OVERLAY_CONFIG,
  type ReferenceImage,
  type OverlayConfig,
  type OverlayPosition,
} from "../features/meme/geminiTypes";

export interface MemeHistoryItem {
  id: string;
  prompt: string;
  overlayText: string;
  imageUri: string;
  baseImageUri?: string;
  overlayConfig: OverlayConfig;
  createdAt: string;
  isFavorite: boolean;
}

interface MemeState {
  isGenerating: boolean;
  currentPrompt: string;
  overlayText: string;
  currentImageUri: string | null;
  currentBaseImageUri: string | null;
  lastError: string | null;
  history: MemeHistoryItem[];
  referenceImages: ReferenceImage[];
  overlayConfig: OverlayConfig;

  setPrompt: (prompt: string) => void;
  setOverlayText: (text: string) => void;
  setOverlayPosition: (position: OverlayPosition) => void;
  setOverlayFontScale: (scale: number) => void;
  resetOverlayConfig: () => void;
  addImage: (data: string, mimeType: string) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  startGeneration: () => void;
  completeGeneration: (baseImageUri: string, compositeImageUri: string) => void;
  failGeneration: (error: string) => void;
  updateOverlay: (id: string, overlayText: string, overlayConfig: OverlayConfig, newImageUri: string) => void;
  toggleFavorite: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  reset: () => void;
}

const initialState = {
  isGenerating: false,
  currentPrompt: "",
  overlayText: "",
  currentImageUri: null as string | null,
  currentBaseImageUri: null as string | null,
  lastError: null as string | null,
  history: [] as MemeHistoryItem[],
  referenceImages: [] as ReferenceImage[],
  overlayConfig: { ...DEFAULT_OVERLAY_CONFIG } as OverlayConfig,
};

let nextId = 1;

function initNextId(history: MemeHistoryItem[]) {
  const maxId = history.reduce((max, item) => {
    const n = Number(item.id);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  if (maxId >= nextId) nextId = maxId + 1;
}

export const useMemeStore = create<MemeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPrompt: (prompt) => set({ currentPrompt: prompt }),
      setOverlayText: (text) => set({ overlayText: text }),

      setOverlayPosition: (position) =>
        set((state) => ({
          overlayConfig: { ...state.overlayConfig, position, offsetX: 0, offsetY: 0 },
        })),

      setOverlayFontScale: (scale) =>
        set((state) => ({
          overlayConfig: { ...state.overlayConfig, fontScale: scale },
        })),

      resetOverlayConfig: () =>
        set({ overlayConfig: { ...DEFAULT_OVERLAY_CONFIG } }),

      addImage: (data, mimeType) => {
        const { referenceImages } = get();
        if (referenceImages.length >= MAX_REFERENCE_IMAGES) return;
        const nextIndex = referenceImages.length + 1;
        set({
          referenceImages: [
            ...referenceImages,
            { id: `img-${nextIndex}`, data, mimeType },
          ],
        });
      },

      removeImage: (id) =>
        set((state) => {
          const filtered = state.referenceImages.filter((img) => img.id !== id);
          const reindexed = filtered.map((img, i) => ({
            ...img,
            id: `img-${i + 1}`,
          }));
          return { referenceImages: reindexed };
        }),

      clearImages: () => set({ referenceImages: [] }),

      startGeneration: () =>
        set({ isGenerating: true, lastError: null, currentImageUri: null, currentBaseImageUri: null }),

      completeGeneration: (baseImageUri, compositeImageUri) => {
        const { currentPrompt, overlayText, overlayConfig, history } = get();
        const item: MemeHistoryItem = {
          id: String(nextId++),
          prompt: currentPrompt,
          overlayText,
          imageUri: compositeImageUri,
          baseImageUri,
          overlayConfig: { ...overlayConfig },
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        set({
          isGenerating: false,
          currentImageUri: compositeImageUri,
          currentBaseImageUri: baseImageUri,
          history: [item, ...history],
        });
      },

      failGeneration: (error) =>
        set({ isGenerating: false, lastError: error }),

      updateOverlay: (id, overlayText, overlayConfig, newImageUri) =>
        set((state) => {
          const history = state.history.map((item) =>
            item.id === id
              ? { ...item, overlayText, overlayConfig: { ...overlayConfig }, imageUri: newImageUri }
              : item,
          );
          const isLatest = state.history[0]?.id === id;
          return {
            history,
            ...(isLatest
              ? {
                  currentImageUri: newImageUri,
                  overlayText,
                  overlayConfig: { ...overlayConfig },
                }
              : {}),
          };
        }),

      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
          ),
        })),

      deleteFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      reset: () => set(initialState),
    }),
    {
      name: "meme-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        history: state.history,
        currentPrompt: state.currentPrompt,
        overlayText: state.overlayText,
        referenceImages: state.referenceImages,
        overlayConfig: state.overlayConfig,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.history) initNextId(state.history);
      },
    },
  ),
);
