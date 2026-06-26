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
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-2 py-3 sm:gap-2 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-ink">
          <span className="hidden h-9 w-9 place-items-center rounded-lg bg-sea text-white sm:grid">
            <Hammer size={19} />
          </span>
          <span className="text-base sm:text-xl">HandyGo</span>
        </Link>
        <nav className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto whitespace-nowrap text-xs font-medium text-slate-700 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 sm:text-sm [&::-webkit-scrollbar]:hidden">
          <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/requests">
            Requests
          </Link>
          {!session && (
            <>
              <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/register">
                Register
              </Link>
            </>
          )}
          {session?.role === "customer" && (
            <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/customer">
              Customer
            </Link>
          )}
          {session?.role === "handyman" && (
            <>
              <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/handyman/dashboard">
                Dashboard
              </Link>
              <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/handyman/register">
                Profile
              </Link>
            </>
          )}
          {session?.role === "admin" && (
            <Link className="rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" href="/admin">
              Admin
            </Link>
          )}
          {session ? (
            <button onClick={logout} className="inline-flex items-center gap-1 rounded-md px-1.5 py-2 hover:bg-slate-100 sm:px-3" title={`Logged in as ${session.label}`}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link className="rounded-md bg-sea px-1.5 py-2 text-white hover:bg-teal-800 sm:px-3" href="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
