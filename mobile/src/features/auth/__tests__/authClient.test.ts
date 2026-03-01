import { signIn, getSession, signOut, fetchApiKey } from "../authClient";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("authClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("signIn", () => {
    it("calls sign-in endpoint and returns session", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "test-token-123",
            user: { id: "u1", email: "demo@kaosmaps.com", name: "Demo" },
          }),
      });

      const session = await signIn("http://localhost:3100", "demo@kaosmaps.com", "password");
      expect(session.token).toBe("test-token-123");
      expect(session.user.email).toBe("demo@kaosmaps.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3100/api/auth/sign-in/email",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("throws on failed sign-in", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      });

      await expect(
        signIn("http://localhost:3100", "bad@email.com", "wrong"),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("getSession", () => {
    it("returns session when valid", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            session: {
              token: "t",
              user: { id: "u1", email: "a@b.com" },
            },
          }),
      });

      const session = await getSession("http://localhost:3100", "t");
      expect(session).not.toBeNull();
      expect(session?.user.email).toBe("a@b.com");
    });

    it("returns null when invalid", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

      const session = await getSession("http://localhost:3100", "bad-token");
      expect(session).toBeNull();
    });
  });

  describe("signOut", () => {
    it("calls sign-out endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      await signOut("http://localhost:3100", "token-123");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3100/api/auth/sign-out",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer token-123",
          }),
        }),
      );
    });
  });

  describe("fetchApiKey", () => {
    it("returns API key when authenticated", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ geminiApiKey: "AIza-test-key" }),
      });

      const key = await fetchApiKey("http://localhost:3100", "token-123");
      expect(key).toBe("AIza-test-key");
    });

    it("returns null when unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

      const key = await fetchApiKey("http://localhost:3100", "bad-token");
      expect(key).toBeNull();
    });
  });
});
