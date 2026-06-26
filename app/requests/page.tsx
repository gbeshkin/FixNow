"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/Badge";
import { eur } from "@/lib/pricing";
import { loadState } from "@/lib/store";
import type { TaskRequest } from "@/lib/types";

export default function RequestsPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const state = useMemo(() => loadState(), []);
  const tasks = [...state.tasks].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sea">Saved locally</p>
              <h1 className="mt-1 text-3xl font-bold text-ink">My requests</h1>
              <p className="mt-2 text-sm text-slate-600">Requests are saved in this browser, so you can return here after logout.</p>
            </div>
            <Link href="/customer" className="rounded-lg bg-sea px-4 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800">
              New request
            </Link>
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
              No requests saved in this browser yet.
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {selectedTask ? <RequestDetails task={selectedTask} /> : null}
        </aside>
      </main>
    </>
  );
}

function RequestDetails({ task }: { task: TaskRequest }) {
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
