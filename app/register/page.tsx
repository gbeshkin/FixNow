"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MapPicker } from "@/components/MapPicker";
import { setSession } from "@/lib/auth";
import { createCustomer, createHandyman } from "@/lib/store";
import { taskCategories, type AvailabilityStatus, type Coordinates, type Role, type TaskCategory } from "@/lib/types";

const tallinnCenter: Coordinates = { lat: 59.437, lng: 24.7536 };

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Exclude<Role, "admin">>("customer");
  const [location, setLocation] = useState(tallinnCenter);
  const [skills, setSkills] = useState<TaskCategory[]>(["Small repairs"]);

  function submit(formData: FormData) {
    if (role === "customer") {
      const customer = createCustomer({
        name: String(formData.get("name")),
        phone: String(formData.get("phone")),
        email: String(formData.get("email"))
      });
      setSession({ role: "customer", label: customer.name, profileId: customer.id });
      router.push("/customer");
      return;
    }

    const handyman = createHandyman({
      fullName: String(formData.get("fullName")),
      phone: String(formData.get("phone")),
      email: String(formData.get("email")),
      cityDistrict: String(formData.get("cityDistrict")),
      homeLocation: location,
      workingRadiusKm: Number(formData.get("workingRadiusKm")),
      skills,
      shortBio: String(formData.get("shortBio")),
      profilePhotoUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=300&q=80",
      availabilityStatus: String(formData.get("availabilityStatus")) as AvailabilityStatus
    });
    setSession({ role: "handyman", label: handyman.fullName, profileId: handyman.id });
    router.push("/handyman/dashboard");
  }

  function toggleSkill(skill: TaskCategory) {
    setSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]));
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-sea">Registration</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Create your HandyGo account</h1>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => setRole("customer")} className={`rounded-md px-4 py-2 text-sm font-semibold ${role === "customer" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}>
              Customer
            </button>
            <button type="button" onClick={() => setRole("handyman")} className={`rounded-md px-4 py-2 text-sm font-semibold ${role === "handyman" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}>
              Handyman
            </button>
          </div>

          <form action={submit} className="mt-6 grid gap-5">
            {role === "customer" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field name="name" label="Name" required />
                  <Field name="phone" label="Phone" required />
                  <Field name="email" label="Email" type="email" required />
                </div>
                <button className="rounded-lg bg-sea px-5 py-3 font-semibold text-white hover:bg-teal-800" type="submit">
                  Register as customer
                </button>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field name="fullName" label="Full name" required />
                  <Field name="phone" label="Phone" required />
                  <Field name="email" label="Email" type="email" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="cityDistrict" label="City / district" required />
                  <Field name="workingRadiusKm" label="Working radius in km" type="number" required />
                </div>
                <MapPicker value={location} onChange={setLocation} label="Home working location" />
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Skills/categories</p>
                  <div className="flex flex-wrap gap-2">
                    {taskCategories.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${skills.includes(skill) ? "border-sea bg-mint text-sea" : "border-slate-300 bg-white text-slate-700"}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Short bio
                  <textarea name="shortBio" required rows={4} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Availability status
                  <select name="availabilityStatus" className="rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="available">
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </label>
                <button className="rounded-lg bg-sea px-5 py-3 font-semibold text-white hover:bg-teal-800" type="submit">
                  Register as handyman
                </button>
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Handyman profiles require admin approval before receiving tasks.</p>
              </>
            )}
          </form>
        </section>
      </main>
    </>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-800">
      {label}
      <input name={name} type={type} required={required} min={type === "number" ? 1 : undefined} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
  );
}
