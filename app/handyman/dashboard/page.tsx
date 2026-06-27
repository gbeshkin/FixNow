"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AvailabilityBadge, StatusBadge } from "@/components/Badge";
import { loadSharedState } from "@/lib/api-client";
import { findMatchingHandymen } from "@/lib/matching";
import { calculateOfferSplit, eur } from "@/lib/pricing";
import { loadState, proposeTaskPrice, updateTaskStatus } from "@/lib/store";
import type { AppState } from "@/lib/types";

export default function HandymanDashboardPage() {
  return (
    <>
      <Header />
      <ProtectedRoute role="handyman">{(session) => <HandymanDashboard session={session} />}</ProtectedRoute>
    </>
  );
}

function HandymanDashboard({ session }: { session: { profileId?: string } }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const selectedHandyman = state.handymen.find((handyman) => handyman.id === session.profileId);
  const canReceiveTasks = Boolean(selectedHandyman?.approved && !selectedHandyman.blocked);

  const visibleTasks = useMemo(() => {
    if (!selectedHandyman || !canReceiveTasks) return [];
    return state.tasks.filter((task) => {
      if (task.assignedHandymanId === selectedHandyman.id) return true;
      if (task.status !== "searching") return false;
      return findMatchingHandymen(task, [selectedHandyman]).length > 0;
    });
  }, [canReceiveTasks, selectedHandyman, state.tasks]);

  useEffect(() => {
    let cancelled = false;

    async function refreshState() {
      const nextState = await loadSharedState();
      if (!cancelled) setState(nextState);
    }

    refreshState();
    const interval = window.setInterval(refreshState, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  function changeStatus(taskId: string, status: "assigned" | "in_progress" | "completed") {
    if (!selectedHandyman) return;
    setState(updateTaskStatus(taskId, status, selectedHandyman.id));
  }

  function proposePrice(taskId: string, formData: FormData) {
    if (!selectedHandyman) return;
    const amount = Number(formData.get("counterOffer"));
    const reason = String(formData.get("reason")).trim();
    if (!amount || !reason) return;
    setState(proposeTaskPrice(taskId, selectedHandyman.id, amount, reason));
  }

  return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sea">Handyman workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">My dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">You are logged in as one handyman profile. Switching to other handymen is not available.</p>
          </div>
        </div>

        {!selectedHandyman && (
          <section className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            This login session does not have a handyman profile. Please register a handyman profile.
          </section>
        )}

        {selectedHandyman && (
          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={selectedHandyman.profilePhotoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-ink">{selectedHandyman.fullName}</h2>
                  <AvailabilityBadge status={selectedHandyman.availabilityStatus} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedHandyman.cityDistrict}, {selectedHandyman.workingRadiusKm} km radius
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-700">
                  Rating {selectedHandyman.rating.toFixed(1)}/5, {selectedHandyman.completedJobs} completed jobs
                </p>
                <p className="mt-2 text-sm text-slate-600">{selectedHandyman.shortBio}</p>
              </div>
            </div>
            {!selectedHandyman.approved && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Your profile is waiting for admin approval. You cannot receive tasks yet.</p>}
            {selectedHandyman.blocked && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">Your profile is blocked. Contact admin.</p>}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          {visibleTasks.map((task) => {
            const offerSplit = calculateOfferSplit(task.customerOffer, 10);
            return (
              <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-sea">{task.category}</p>
                    <h3 className="mt-1 text-xl font-bold text-ink">{task.address}</h3>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <span>Customer: {task.customerName}</span>
                  <span>Preferred: {task.preferredTime}</span>
                  <span>Customer offer: {eur(task.customerOffer)}</span>
                  <span>Handyman payout: {eur(offerSplit.handymanPayout)} (90%)</span>
                </div>
                {task.handymanCounterOffer && (
                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    Counter-offer sent: {eur(task.handymanCounterOffer)}. {task.handymanCounterReason}
                  </div>
                )}
                {!task.handymanCounterOffer && task.status === "searching" && (
                  <form action={(formData) => proposePrice(task.id, formData)} className="mt-4 grid gap-2 rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-ink">Request another price</p>
                    <input name="counterOffer" type="number" min={5} step={1} placeholder="Counter-offer EUR" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    <textarea name="reason" rows={2} placeholder="Reason for different price" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50" type="submit">
                      Send counter-offer
                    </button>
                  </form>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {task.status === "searching" && (
                    <button onClick={() => changeStatus(task.id, "assigned")} className="rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                      Accept task
                    </button>
                  )}
                  {task.assignedHandymanId === selectedHandyman?.id && task.status === "assigned" && (
                    <button onClick={() => changeStatus(task.id, "in_progress")} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      Mark started
                    </button>
                  )}
                  {task.assignedHandymanId === selectedHandyman?.id && task.status === "in_progress" && (
                    <button onClick={() => changeStatus(task.id, "completed")} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                      Mark completed
                    </button>
                  )}
                </div>
                <OfferSplitSummary customerOffer={task.customerOffer} />
              </article>
            );
          })}
        </section>

        {visibleTasks.length === 0 && <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">No matching open tasks for this profile right now.</div>}
      </main>
  );
}

function OfferSplitSummary({ customerOffer }: { customerOffer: number }) {
  const split = calculateOfferSplit(customerOffer, 10);

  return (
    <div className="mt-4 rounded-lg border border-teal-200 bg-mint/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-ink">Customer offer</span>
        <span className="text-2xl font-bold text-sea">{eur(split.customerOffer)}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-700">
        <div className="flex justify-between gap-3">
          <span>Handyman payout</span>
          <span className="font-semibold">{eur(split.handymanPayout)} · 90%</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Company commission</span>
          <span className="font-semibold">{eur(split.companyFee)} · {split.companyPercent}%</span>
        </div>
      </div>
    </div>
  );
}
