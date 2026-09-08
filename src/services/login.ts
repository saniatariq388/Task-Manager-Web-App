"use server";

import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL!;

// Keep these in sync with taskManager-backend/config/plugins.ts
const ACCESS_TOKEN_MAXAGE = 600;        // 10 min — accessTokenLifespan
const REFRESH_TOKEN_MAXAGE = 1209600;   // 14 days — idleRefreshTokenLifespan

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginUser(payload: LoginPayload) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: payload.email,
      password: payload.password,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Invalid email or password");
  }

  const result = await res.json();
  const cookieStore = await cookies();

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

  return result;
}