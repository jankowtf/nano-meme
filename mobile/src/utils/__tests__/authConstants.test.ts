import { AUTH_BASE_URL, DEMO_EMAIL } from "../authConstants";

describe("authConstants", () => {
  it("defines AUTH_BASE_URL as a valid URL", () => {
    expect(AUTH_BASE_URL).toMatch(/^https?:\/\//);
  });

  it("defines DEMO_EMAIL", () => {
    expect(DEMO_EMAIL).toBe("demo@kaosmaps.com");
  });
});
