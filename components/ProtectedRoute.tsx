"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { getSession, type MockSession } from "@/lib/auth";
import type { Role } from "@/lib/types";

export function ProtectedRoute({
  role,
  children
}: {
  role: Role;
  children: (session: MockSession) => React.ReactNode;
}) {
  const [session, setCurrentSession] = useState<MockSession | null | undefined>(undefined);

  useEffect(() => {
    setCurrentSession(getSession());
  }, []);

  if (session === undefined) {
    return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">Loading session...</div>;
  }

  if (!session || session.role !== role) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-mint text-sea">
            <Lock size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Login required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">This area is available only after logging in with the correct role.</p>
          <Link href="/login" className="mt-5 inline-flex rounded-lg bg-sea px-5 py-3 font-semibold text-white hover:bg-teal-800">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return children(session);
}
