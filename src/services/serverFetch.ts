"use server";

import { cookies } from "next/headers";

const STRAPI_URL = "http://localhost:1337";

/**
 * Read-only fetch for use INSIDE Server Components during render
 * (e.g. called directly from a page.tsx, not from a client onClick).
 *
 * Next.js forbids cookie writes during render, so this never attempts
 * to refresh or persist tokens — it assumes middleware.ts already
 * refreshed the access token cookie before this component rendered.
 *
 * If the token is missing/invalid here, it throws — the caller
 * (a Server Component like dashboard/page.tsx) should catch this
 * and redirect to /login.
 */
export async function serverFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Missing or invalid credentials");
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}