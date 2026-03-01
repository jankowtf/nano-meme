import type { AuthSession, AuthState } from "../authTypes";

describe("authTypes", () => {
  it("AuthSession has required fields", () => {
    const session: AuthSession = {
      token: "test-token",
      user: { id: "1", email: "test@example.com" },
    };
    expect(session.token).toBe("test-token");
    expect(session.user.id).toBe("1");
    expect(session.user.email).toBe("test@example.com");
    expect(session.user.name).toBeUndefined();
  });

  it("AuthSession supports optional name", () => {
    const session: AuthSession = {
      token: "t",
      user: { id: "1", email: "a@b.com", name: "Demo" },
    };
    expect(session.user.name).toBe("Demo");
  });

  it("AuthState has required fields", () => {
    const state: AuthState = {
      session: null,
      isLoading: false,
      error: null,
    };
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
