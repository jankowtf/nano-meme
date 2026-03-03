import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "./mmkvStorage";
import type { AuthSession } from "../features/auth/authTypes";
import { signIn, signOut as signOutApi, fetchApiKey } from "../features/auth/authClient";
import { setCortexApiKey, deleteCortexApiKey } from "../hooks/useSecureStorage";
import { AUTH_BASE_URL } from "../utils/authConstants";

interface AuthStoreState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  session: null as AuthSession | null,
  isLoading: false,
  error: null as string | null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await signIn(AUTH_BASE_URL, email, password);
          set({ session, isAuthenticated: true, isLoading: false, error: null });

          // Fetch and store the API key (best-effort, don't crash auth flow)
          try {
            const apiKey = await fetchApiKey(AUTH_BASE_URL, session.token);
            if (apiKey) {
              await setCortexApiKey(apiKey);
            }
          } catch {
            // SecureStore or network failure — auth succeeded, key storage didn't
          }
        } catch (err) {
          set({
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: err instanceof Error ? err.message : "Sign-in failed",
          });
        }
      },

      logout: async () => {
        const { session } = get();
        if (session) {
          try {
            await signOutApi(AUTH_BASE_URL, session.token);
          } catch {
            // Best effort — clear local state regardless
          }
        }
        try {
          await deleteCortexApiKey();
        } catch {
          // Best effort — clear local state regardless
        }
        set({ session: null, isAuthenticated: false, error: null });
      },

      reset: () => set(initialState),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
