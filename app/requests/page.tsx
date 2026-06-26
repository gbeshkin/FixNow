"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/Badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { findMatchingHandymen } from "@/lib/matching";
import { eur } from "@/lib/pricing";
import { loadState, updateNegotiationStatus } from "@/lib/store";
import type { AppState, TaskRequest } from "@/lib/types";

export default function RequestsPage() {
  return (
    <>
      <Header />
      <ProtectedRoute>{(session) => <RequestsExperience session={session} />}</ProtectedRoute>
    </>
  );
}

function RequestsExperience({ session }: { session: { role: string; profileId?: string } }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(() => loadState());
  const handyman = session.role === "handyman" ? state.handymen.find((item) => item.id === session.profileId) : undefined;
  const tasks = [...state.tasks]
    .filter((task) => {
      if (session.role === "admin") return true;
      if (session.role === "customer") return task.customerId === session.profileId;
      if (session.role === "handyman" && handyman) {
        return task.assignedHandymanId === handyman.id || (task.status === "searching" && findMatchingHandymen(task, [handyman]).length > 0);
      }
      return false;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const pendingCounterOffers = session.role === "customer" ? tasks.filter((task) => task.negotiationStatus === "handyman_counter") : [];
  const title = session.role === "admin" ? "All requests" : session.role === "handyman" ? "Available requests" : "My requests";
  const subtitle =
    session.role === "admin"
      ? "Admin can review every saved request in this MVP."
      : session.role === "handyman"
        ? "Only assigned requests and open matching requests are shown."
        : "Only requests created by your customer profile are shown.";

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0">
          {pendingCounterOffers.length > 0 && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
              <p className="font-bold">You have a new counter-offer</p>
              <p className="mt-1">
                A master requested a different price for {pendingCounterOffers[0].category}. Open the request details and accept or decline it.
              </p>
            </div>
          )}

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sea">Protected area</p>
              <h1 className="mt-1 text-3xl font-bold text-ink">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            </div>
            {session.role === "customer" ? (
              <Link href="/customer" className="rounded-lg bg-sea px-4 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800">
                New request
              </Link>
            ) : null}
          </div>

          {tasks.length > 0 ? (
            <div className="grid gap-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-teal-300 ${selectedTask?.id === task.id ? "border-sea ring-2 ring-teal-100" : "border-slate-200"}`}
                  type="button"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-semibold text-sea">{task.category}</p>
                      <h2 className="mt-1 text-lg font-bold text-ink">{task.address}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span>{new Date(task.createdAt).toLocaleString("en-GB")}</span>
                    <span>Offer {eur(task.customerOffer)}</span>
                    <span>{task.negotiationStatus.replace("_", " ")}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              No requests available for this login.
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {selectedTask ? (
            <RequestDetails
              task={selectedTask}
              canRespondToCounterOffer={session.role === "customer" && selectedTask.negotiationStatus === "handyman_counter"}
              onRespond={(status) => {
                setState(updateNegotiationStatus(selectedTask.id, status));
              }}
            />
          ) : null}
        </aside>
      </main>
  );
}

function RequestDetails({
  task,
  canRespondToCounterOffer,
  onRespond
}: {
  task: TaskRequest;
  canRespondToCounterOffer: boolean;
  onRespond: (status: "accepted" | "declined") => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Request details</h2>
        <StatusBadge status={task.status} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <Detail label="Service" value={task.category} />
        <Detail label="Address" value={task.address} />
        <Detail label="Preferred time" value={task.preferredDateTime || task.preferredTime} />
        <Detail label="Your offer" value={eur(task.customerOffer)} />
        {task.handymanCounterOffer ? <Detail label="Master counter-offer" value={eur(task.handymanCounterOffer)} /> : null}
        {task.handymanCounterReason ? <Detail label="Reason" value={task.handymanCounterReason} /> : null}
        <Detail label="Negotiation" value={task.negotiationStatus.replace("_", " ")} />
      </dl>
      {canRespondToCounterOffer && task.handymanCounterOffer ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-950">Master asks for {eur(task.handymanCounterOffer)}</p>
          <p className="mt-1 text-sm text-amber-900">{task.handymanCounterReason}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => onRespond("accepted")} className="flex-1 rounded-lg bg-sea px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800" type="button">
              Accept offer
            </button>
            <button onClick={() => onRespond("declined")} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50" type="button">
              Decline
            </button>
          </div>
        </div>
      ) : null}
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{task.description}</p>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}
