"use server";

import { cookies } from "next/headers";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export async function signupUser(payload: SignupPayload) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Signup failed");
  }

  const result = await res.json();

  // JWT ko httpOnly cookie mein set karo
  const cookieStore = await cookies();
  cookieStore.set("JWT Token", result.jwt);

  return result;
}