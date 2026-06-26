"use client";

import Link from "next/link";
import { Hammer, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getSession, type MockSession } from "@/lib/auth";

export function Header() {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  function logout() {
    clearSession();
    setSession(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sea text-white">
            <Hammer size={19} />
          </span>
          <span className="text-xl">HandyGo</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/requests">
            Requests
          </Link>
          {!session && (
            <>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/register">
                Register
              </Link>
            </>
          )}
          {session?.role === "customer" && (
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/customer">
              Customer
            </Link>
          )}
          {session?.role === "handyman" && (
            <>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/handyman/dashboard">
                Dashboard
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/handyman/register">
                Profile
              </Link>
            </>
          )}
          {session?.role === "admin" && (
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin">
              Admin
            </Link>
          )}
          {session ? (
            <button onClick={logout} className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-slate-100" title={`Logged in as ${session.label}`}>
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link className="rounded-md bg-sea px-3 py-2 text-white hover:bg-teal-800" href="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
