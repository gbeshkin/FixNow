"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { setSession } from "@/lib/auth";
import { loadState } from "@/lib/store";
import type { Role } from "@/lib/types";

const nextByRole: Record<Role, string> = {
  customer: "/customer",
  handyman: "/handyman/dashboard",
  admin: "/admin"
};

export default function LoginPage() {
  const router = useRouter();
  const state = useMemo(() => loadState(), []);
  const [role, setRole] = useState<Role>("customer");
  const [profileId, setProfileId] = useState(state.customers[0]?.id ?? "");

  function login() {
    const label =
      role === "customer"
        ? state.customers.find((customer) => customer.id === profileId)?.name ?? "Customer"
        : role === "handyman"
          ? state.handymen.find((handyman) => handyman.id === profileId)?.fullName ?? "Handyman"
          : "Admin";

    setSession({ role, label, profileId: role === "admin" ? undefined : profileId });
    router.push(nextByRole[role]);
  }

  const profileOptions = role === "customer" ? state.customers : role === "handyman" ? state.handymen : [];

  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[78vh] max-w-xl place-items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-sea">Mock login</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Choose your role</h1>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Role
              <select
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value as Role;
                  setRole(nextRole);
                  setProfileId(nextRole === "customer" ? state.customers[0]?.id ?? "" : nextRole === "handyman" ? state.handymen[0]?.id ?? "" : "");
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              >
                <option value="customer">Customer</option>
                <option value="handyman">Handyman</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {role !== "admin" && (
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Profile
                <select value={profileId} onChange={(event) => setProfileId(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 font-normal">
                  {profileOptions.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {"name" in profile ? profile.name : profile.fullName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button onClick={login} className="rounded-lg bg-sea px-5 py-3 font-semibold text-white hover:bg-teal-800">
              Continue
            </button>
            <Link href="/register" className="rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold text-ink hover:bg-slate-50">
              Create account
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
