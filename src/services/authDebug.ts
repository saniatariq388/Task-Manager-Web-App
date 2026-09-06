"use server";

import { cookies } from "next/headers";
import { refreshAccessToken } from "./refresh";
import { getCurrentUser } from "./user";

function decodeExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    return typeof parsed.exp === "number" ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function getTokenStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const refreshTokenValue = cookieStore.get("strapi_up_refresh")?.value;

  const accessToken = token
    ? { present: true, preview: token.slice(0, 15) + "...", expiresAt: decodeExpiry(token) }
    : { present: false, preview: "", expiresAt: null };

  const refreshToken = refreshTokenValue
    ? { present: true, preview: refreshTokenValue.slice(0, 15) + "...", expiresAt: decodeExpiry(refreshTokenValue) }
    : { present: false, preview: "", expiresAt: null };

  return { accessToken, refreshToken };
}

export async function callProtectedEndpoint() {
  try {
    const user = await getCurrentUser();
    return { success: true, message: `✅ Fetched user: ${user.username}`, sessionExpired: false };
  } catch (err: any) {
    // Distinguish "refresh token also dead" from other failures —
    // only the former should trigger a redirect to /login.
    const isSessionDead =
      err.message?.includes("log in again") || err.message?.includes("Session expired");

    return {
      success: false,
      message: `❌ ${err.message}`,
      sessionExpired: isSessionDead,
    };
  }
}

export async function forceRefreshNow() {
  try {
    await refreshAccessToken();
    return { success: true, message: "✅ Access token refreshed successfully", sessionExpired: false };
  } catch (err: any) {
    return { success: false, message: `❌ ${err.message}`, sessionExpired: true };
  }
}

export async function simulateAccessTokenExpiry() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true, message: "⚠️ Access token cookie cleared (simulated expiry)", sessionExpired: false };
}

export async function simulateRefreshTokenExpiry() {
  const cookieStore = await cookies();
  cookieStore.delete("strapi_up_refresh");
  return { success: true, message: "⚠️ Refresh token cookie cleared (simulated expiry)", sessionExpired: false };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("strapi_up_refresh");
  return { success: true, message: "👋 Logged out — all cookies cleared", sessionExpired: false };
}