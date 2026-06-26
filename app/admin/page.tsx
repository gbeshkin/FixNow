"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AvailabilityBadge, StatusBadge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { findMatchingHandymen } from "@/lib/matching";
import { calculateTaskPrice, eur } from "@/lib/pricing";
import { loadState, resetState, updateState } from "@/lib/store";
import type { AppState, PricingSettings, TaskStatus } from "@/lib/types";

export default function AdminPage() {
  return (
    <>
      <Header />
      <ProtectedRoute role="admin">{() => <AdminDashboard />}</ProtectedRoute>
    </>
  );
}

function AdminDashboard() {
  const [state, setState] = useState<AppState>(() => loadState());
  const revenue = state.tasks.reduce((sum, task) => {
    if (task.status !== "completed") return sum;
    return sum + calculateTaskPrice(task.estimatedDurationHours, state.pricing).total;
  }, 0);

  const stats = [
    ["Total tasks", state.tasks.length],
    ["Completed", state.tasks.filter((task) => task.status === "completed").length],
    ["Cancelled", state.tasks.filter((task) => task.status === "cancelled").length],
    ["Active handymen", state.handymen.filter((handyman) => handyman.approved && !handyman.blocked).length],
    ["Revenue estimate", eur(revenue)]
  ];

  function savePricing(formData: FormData) {
    const pricing: PricingSettings = {
      hourlyRate: Number(formData.get("hourlyRate")),
      travelFee: Number(formData.get("travelFee")),
      platformCommissionPercent: Number(formData.get("platformCommissionPercent"))
    };
    setState(updateState((current) => ({ ...current, pricing })));
  }

  function setApproval(id: string, approved: boolean) {
    setState(updateState((current) => ({ ...current, handymen: current.handymen.map((handyman) => (handyman.id === id ? { ...handyman, approved } : handyman)) })));
  }

  function setBlocked(id: string, blocked: boolean) {
    setState(updateState((current) => ({ ...current, handymen: current.handymen.map((handyman) => (handyman.id === id ? { ...handyman, blocked } : handyman)) })));
  }

  function assignTask(taskId: string, handymanId: string) {
    setState(
      updateState((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, assignedHandymanId: handymanId || undefined, status: handymanId ? "assigned" : "searching" } : task))
      }))
    );
  }

  function changeStatus(taskId: string, status: TaskStatus) {
    setState(updateState((current) => ({ ...current, tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)) })));
  }

  return (
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sea">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Operations console</h1>
          </div>
          <button onClick={() => setState(resetState())} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
            Reset seed data
          </button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(([label, value]) => (
            <StatCard key={label} label={String(label)} value={value} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form action={savePricing} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Pricing settings</h2>
            <div className="mt-4 grid gap-4">
              <NumberField name="hourlyRate" label="Hourly rate" defaultValue={state.pricing.hourlyRate} />
              <NumberField name="travelFee" label="Travel fee" defaultValue={state.pricing.travelFee} />
              <NumberField name="platformCommissionPercent" label="Platform commission %" defaultValue={state.pricing.platformCommissionPercent} />
            </div>
            <button className="mt-4 rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800" type="submit">
              Save pricing
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Customers</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {state.customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-ink">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{state.tasks.filter((task) => task.customerId === customer.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Handymen</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th>District</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.handymen.map((handyman) => (
                  <tr key={handyman.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 font-medium text-ink">{handyman.fullName}</td>
                    <td>{handyman.cityDistrict}</td>
                    <td className="max-w-sm">{handyman.skills.join(", ")}</td>
                    <td>
                      <AvailabilityBadge status={handyman.availabilityStatus} />
                    </td>
                    <td>{handyman.blocked ? "Blocked" : handyman.approved ? "Approved" : "Pending"}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setApproval(handyman.id, true)} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
                          Approve
                        </button>
                        <button onClick={() => setBlocked(handyman.id, !handyman.blocked)} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
                          {handyman.blocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Task requests</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2">Task</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Matched handymen</th>
                  <th>Assign</th>
                  <th>Price</th>
                  <th>Set status</th>
                </tr>
              </thead>
              <tbody>
                {state.tasks.map((task) => {
                  const matches = findMatchingHandymen(task, state.handymen);
                  const price = calculateTaskPrice(task.estimatedDurationHours, state.pricing);
                  return (
                    <tr key={task.id} className="border-b border-slate-100 align-top">
                      <td className="py-3">
                        <p className="font-medium text-ink">{task.category}</p>
                        <p className="mt-1 max-w-xs text-slate-600">{task.address}</p>
                      </td>
                      <td>{task.customerName}</td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        {matches.length > 0 ? (
                          <div className="grid gap-1">
                            {matches.map(({ handyman, distanceKm }) => (
                              <span key={handyman.id}>
                                {handyman.fullName} ({distanceKm.toFixed(1)} km)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">No match</span>
                        )}
                      </td>
                      <td>
                        <select value={task.assignedHandymanId ?? ""} onChange={(event) => assignTask(task.id, event.target.value)} className="rounded-md border border-slate-300 px-2 py-1">
                          <option value="">Unassigned</option>
                          {state.handymen
                            .filter((handyman) => handyman.approved && !handyman.blocked)
                            .map((handyman) => (
                              <option key={handyman.id} value={handyman.id}>
                                {handyman.fullName}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>{eur(price.total)}</td>
                      <td>
                        <select value={task.status} onChange={(event) => changeStatus(task.id, event.target.value as TaskStatus)} className="rounded-md border border-slate-300 px-2 py-1">
                          <option value="searching">Searching</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
  );
}

function NumberField({ label, name, defaultValue }: { label: string; name: string; defaultValue: number }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-800">
      {label}
      <input name={name} type="number" min={0} defaultValue={defaultValue} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
  );
}
