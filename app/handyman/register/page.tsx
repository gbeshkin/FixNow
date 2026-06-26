"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { AvailabilityBadge } from "@/components/Badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { loadState } from "@/lib/store";

export default function HandymanProfilePage() {
  return (
    <>
      <Header />
      <ProtectedRoute role="handyman">{(session) => <MyHandymanProfile profileId={session.profileId} />}</ProtectedRoute>
    </>
  );
}

function MyHandymanProfile({ profileId }: { profileId?: string }) {
  const state = loadState();
  const handyman = state.handymen.find((item) => item.id === profileId);

  if (!handyman) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          No handyman profile is connected to this session.
          <Link className="ml-2 font-semibold underline" href="/register">
            Register profile
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-sea">Handyman profile</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">My profile</h1>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <img src={handyman.profilePhotoUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-ink">{handyman.fullName}</h2>
              <AvailabilityBadge status={handyman.availabilityStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{handyman.email}</p>
            <p className="text-sm text-slate-600">{handyman.phone}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProfileItem label="City / district" value={handyman.cityDistrict} />
          <ProfileItem label="Working radius" value={`${handyman.workingRadiusKm} km`} />
          <ProfileItem label="Rating" value={`${handyman.rating.toFixed(1)}/5 (${handyman.completedJobs} jobs)`} />
          <ProfileItem label="Home coordinates" value={`${handyman.homeLocation.lat.toFixed(4)}, ${handyman.homeLocation.lng.toFixed(4)}`} />
          <ProfileItem label="Approval" value={handyman.blocked ? "Blocked" : handyman.approved ? "Approved" : "Waiting for approval"} />
          <ProfileItem label="Skills" value={handyman.skills.join(", ")} wide />
          <ProfileItem label="Bio" value={handyman.shortBio} wide />
        </dl>
      </section>
    </main>
  );
}

function ProfileItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
