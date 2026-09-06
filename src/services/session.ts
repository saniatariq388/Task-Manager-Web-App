"use server";

import { cookies } from "next/headers";

export interface SessionStatus {
  isAuthenticated: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}

/**
 * Sirf cookies ki presence check karta hai (koi API call nahi) — 
 * yeh fast hai, isliye middleware/route-guard ke liye best hai.
 */
export async function getSessionStatus(): Promise<SessionStatus> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("token")?.value;
  const refreshToken = cookieStore.get("strapi_up_refresh")?.value;

  return {
    isAuthenticated: Boolean(accessToken || refreshToken),
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
  };
}

/**
 * Sirf access token ki raw value chahiye ho to (jaise kisi custom fetch ke liye)
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

/**
 * Poori session khatam karo — dono cookies clear
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("strapi_up_refresh");
}