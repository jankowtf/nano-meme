import type { AuthSession } from "./authTypes";

export async function signIn(
  baseUrl: string,
  email: string,
  password: string,
): Promise<AuthSession> {
  const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Sign-in failed (${response.status})`,
    );
  }

  return (await response.json()) as AuthSession;
}

export async function getSession(
  baseUrl: string,
  token: string,
): Promise<AuthSession | null> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { session: AuthSession };
    return data.session ?? null;
  } catch {
    return null;
  }
}

export async function signOut(
  baseUrl: string,
  token: string,
): Promise<void> {
  await fetch(`${baseUrl}/api/auth/sign-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchApiKey(
  baseUrl: string,
  token: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/api/nanomeme/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { geminiApiKey?: string };
    return data.geminiApiKey ?? null;
  } catch {
    return null;
  }
}
