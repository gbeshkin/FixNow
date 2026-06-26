"use client";

import type { Role } from "@/lib/types";

export type MockSession = {
  role: Role;
  label: string;
  profileId?: string;
};

const AUTH_KEY = "handygo-mvp-session";

export function getSession(): MockSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MockSession;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function setSession(session: MockSession) {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_KEY);
}
