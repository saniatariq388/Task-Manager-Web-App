"use server";

import { cookies } from "next/headers";

const STRAPI_URL = "http://localhost:1337";

const ACCESS_TOKEN_MAXAGE = 600;
const REFRESH_TOKEN_MAXAGE = 1209600;

export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("strapi_up_refresh")?.value;

  if (!refreshToken) {
    throw new Error("No refresh token found. Please log in again.");
  }

  const res = await fetch(`${STRAPI_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    try {
      cookieStore.delete("token");
      cookieStore.delete("strapi_up_refresh");
    } catch {
      // Can't mutate cookies during a Server Component render — ignore.
    }
    throw new Error("Session expired. Please log in again.");
  }

  const result = await res.json();

  try {
    cookieStore.set("token", result.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAXAGE,
    });

    const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
    const refreshCookieRaw = setCookieHeaders.find((c) =>
      c.startsWith("strapi_up_refresh=")
    );

    if (refreshCookieRaw) {
      const refreshValue = refreshCookieRaw.split(";")[0].split("=")[1];
      cookieStore.set("strapi_up_refresh", refreshValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAXAGE,
      });
    }
  } catch {
    // We're inside a Server Component render (e.g. called from a page's
    // top-level data fetch), where Next.js disallows cookie mutation.
    // The fresh JWT below is still valid and usable for this request —
    // it just won't be persisted to the browser here. The next request
    // that hits middleware.ts (which CAN set cookies) will persist it.
  }

  return result.jwt;
}