import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL!;

// Keep these in sync with taskManager-backend/config/plugins.ts
const ACCESS_TOKEN_MAXAGE = 600;        // 10 min — accessTokenLifespan
const REFRESH_TOKEN_MAXAGE = 1209600;   // 14 days — idleRefreshTokenLifespan

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("strapi_up_refresh")?.value;

  if (token) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("strapi_up_refresh");
      return response;
    }

    const result = await res.json();

    const requestHeaders = new Headers(request.headers);
    const existingCookie = requestHeaders.get("cookie") ?? "";
    requestHeaders.set("cookie", `${existingCookie}; token=${result.jwt}`);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    response.cookies.set("token", result.jwt, {
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
      response.cookies.set("strapi_up_refresh", refreshValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAXAGE,
      });
    }

    return response;
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};