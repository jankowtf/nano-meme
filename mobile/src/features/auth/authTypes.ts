export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}
