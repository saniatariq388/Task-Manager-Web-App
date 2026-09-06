"use server";

import { cookies } from "next/headers";
import { refreshAccessToken } from "./refresh";

const STRAPI_URL = "http://localhost:1337";

async function doFetch(path: string, options: RequestInit, token: string) {
  return fetch(`${STRAPI_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function getValidToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("token")?.value;

  if (existing) {
    return existing;
  }

  // No access token cookie — try refresh (throws if refresh token missing/invalid)
  return refreshAccessToken();
}

export async function authFetch(path: string, options: RequestInit = {}) {
  let token = await getValidToken();

  let res = await doFetch(path, options, token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await doFetch(path, options, token);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Missing or invalid credentials");
  }

  if (res.status === 204) {
    return null; // DELETE succeeded, no body to parse
  }

  return res.json();
}