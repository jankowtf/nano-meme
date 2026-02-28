import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "./mmkvStorage";

export interface MemeHistoryItem {
  id: string;
  prompt: string;
  overlayText: string;
  imageUri: string;
  createdAt: string;
  isFavorite: boolean;
}

interface MemeState {
  isGenerating: boolean;
  currentPrompt: string;
  overlayText: string;
  currentImageUri: string | null;
  lastError: string | null;
  history: MemeHistoryItem[];

  setPrompt: (prompt: string) => void;
  setOverlayText: (text: string) => void;
  startGeneration: () => void;
  completeGeneration: (imageUri: string) => void;
  failGeneration: (error: string) => void;
  toggleFavorite: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  reset: () => void;
}

const initialState = {
  isGenerating: false,
  currentPrompt: "",
  overlayText: "",
  currentImageUri: null as string | null,
  lastError: null as string | null,
  history: [] as MemeHistoryItem[],
};

let nextId = 1;

export const useMemeStore = create<MemeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPrompt: (prompt) => set({ currentPrompt: prompt }),
      setOverlayText: (text) => set({ overlayText: text }),

      startGeneration: () =>
        set({ isGenerating: true, lastError: null, currentImageUri: null }),

      completeGeneration: (imageUri) => {
        const { currentPrompt, overlayText, history } = get();
        const item: MemeHistoryItem = {
          id: String(nextId++),
          prompt: currentPrompt,
          overlayText,
          imageUri,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        set({
          isGenerating: false,
          currentImageUri: imageUri,
          history: [item, ...history],
        });
      },

      failGeneration: (error) =>
        set({ isGenerating: false, lastError: error }),

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
      }),
    },
  ),
);
