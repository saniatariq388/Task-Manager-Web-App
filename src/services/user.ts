"use server";

import { authFetch } from "./authFetch";
import type { CurrentUser } from "@/interface/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  return authFetch("/api/users/me", { method: "GET" });
}