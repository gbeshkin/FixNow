"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, MessageCircle, Send, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Header";
import { MapPicker } from "@/components/MapPicker";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/Badge";
import { geocodeAddress, geocodeTallinnAddress } from "@/lib/geocoding";
import { distanceKm, findMatchingHandymen } from "@/lib/matching";
import { eur } from "@/lib/pricing";
import { createTask, loadState, updateNegotiationStatus } from "@/lib/store";
import { taskCategories, type Coordinates, type PreferredTime, type TaskCategory, type TaskRequest } from "@/lib/types";

const tallinnCenter: Coordinates = { lat: 59.437, lng: 24.7536 };

const categoryTone: Record<TaskCategory, string> = {
  "Furniture assembly": "bg-teal-50 text-teal-900",
  Plumbing: "bg-sky-50 text-sky-900",
  Electrical: "bg-amber-50 text-amber-900",
  "Wall mounting": "bg-indigo-50 text-indigo-900",
  "Computer help": "bg-cyan-50 text-cyan-900",
  "Garden work": "bg-emerald-50 text-emerald-900",
  "Small repairs": "bg-slate-100 text-slate-900",
  "Moving help": "bg-orange-50 text-orange-900",
  Other: "bg-zinc-100 text-zinc-900"
};

export default function CustomerPage() {
  return (
    <>
      <Header />
      <ProtectedRoute role="customer">{(session) => <CustomerExperience session={session} />}</ProtectedRoute>
    </>
  );
}

function CustomerExperience({ session }: { session: { label: string; profileId?: string } }) {
  const state = useMemo(() => loadState(), []);
  const [location, setLocation] = useState<Coordinates>(tallinnCenter);
  const [address, setAddress] = useState("Tartu mnt 18, Tallinn");
  const [addressMatch, setAddressMatch] = useState("Kesklinn");
  const [addressLookupStatus, setAddressLookupStatus] = useState<"idle" | "loading" | "found" | "pin">("found");
  const [category, setCategory] = useState<TaskCategory>("Furniture assembly");
  const [preferredTime, setPreferredTime] = useState<PreferredTime>("ASAP");
  const [submittedTask, setSubmittedTask] = useState<TaskRequest | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<Array<{ from: "support" | "customer"; text: string }>>([
    { from: "support", text: "Hi! We can help if matching or price negotiation gets stuck." }
  ]);
  const customer = state.customers.find((item) => item.id === session.profileId) ?? state.customers[0];

  const previewTask: TaskRequest = {
    id: "preview",
    customerId: customer?.id ?? "mock-customer",
    customerName: customer?.name ?? session.label,
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address,
    location,
    category,
    description: "",
    photoFileNames: [],
    estimatedDurationHours: 1,
    customerOffer: 50,
    negotiationStatus: "customer_offer",
    preferredTime,
    status: "searching",
    createdAt: new Date().toISOString()
  };

  const possibleMasters = findMatchingHandymen(previewTask, state.handymen);
  const recommendedMasters = possibleMasters.slice(0, 6);
  const fastestMasters = [...possibleMasters].sort((a, b) => etaMinutes(a.distanceKm) - etaMinutes(b.distanceKm)).slice(0, 6);
  const topRatedMasters = [...possibleMasters].sort((a, b) => b.handyman.rating - a.handyman.rating || a.distanceKm - b.distanceKm).slice(0, 6);
  const submittedMatches = submittedTask ? findMatchingHandymen(submittedTask, state.handymen) : [];
  const mapMarkers = possibleMasters.map(({ handyman }, index) => ({
    id: handyman.id,
    position: handyman.homeLocation,
    label: `Master #${index + 1} · ${handyman.rating.toFixed(1)}/5`,
    rating: handyman.rating
  }));

  function updateAddress(nextAddress: string) {
    setAddress(nextAddress);
    const match = geocodeTallinnAddress(nextAddress);
    if (match) {
      setLocation(match.coordinates);
      setAddressMatch(match.label);
      setAddressLookupStatus("found");
    } else {
      setAddressMatch("Looking up address");
      setAddressLookupStatus(nextAddress.trim().length > 3 ? "loading" : "pin");
    }
    setSelectedMasterId(null);
    setSubmittedTask(null);
  }

  function updateLocationFromMap(nextLocation: Coordinates) {
    setLocation(nextLocation);
    setAddressMatch("Map pin");
    setAddressLookupStatus("pin");
    setSelectedMasterId(null);
    setSubmittedTask(null);
  }

  useEffect(() => {
    const localMatch = geocodeTallinnAddress(address);
    if (localMatch || address.trim().length < 4) return;

    let cancelled = false;
    setAddressLookupStatus("loading");

    const timeout = window.setTimeout(async () => {
      const result = await geocodeAddress(address);
      if (cancelled) return;

      if (result) {
        setLocation(result.coordinates);
        setAddressMatch(result.label);
        setAddressLookupStatus("found");
      } else {
        setAddressMatch("Map pin");
        setAddressLookupStatus("pin");
      }
      setSelectedMasterId(null);
      setSubmittedTask(null);
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [address]);

  function submit(formData: FormData) {
    const photos = formData.getAll("photos").filter((file): file is File => file instanceof File && file.name.length > 0);
    const task = createTask({
      customerId: customer?.id,
      customerName: customer?.name ?? session.label,
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address,
      location,
      category,
      description: String(formData.get("description")),
      photoFileNames: photos.map((file) => file.name),
      estimatedDurationHours: 1,
      customerOffer: Number(formData.get("customerOffer")),
      negotiationStatus: "customer_offer",
      preferredTime,
      preferredDateTime: preferredTime === "Scheduled" ? String(formData.get("preferredDateTime")) : undefined
    });
    setSubmittedTask(task);
  }

  function setNegotiationStatus(status: TaskRequest["negotiationStatus"]) {
    if (!submittedTask) return;
    updateNegotiationStatus(submittedTask.id, status);
    setSubmittedTask({ ...submittedTask, negotiationStatus: status });
  }

  function sendSupportMessage(formData: FormData) {
    const text = String(formData.get("message")).trim();
    if (!text) return;
    setSupportMessages((messages) => [
      ...messages,
      { from: "customer", text },
      { from: "support", text: "Thanks, support will review this request and get back to you." }
    ]);
  }

  return (
    <main className="bg-[#f5f8f7]">
      <section className="sticky top-[65px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <MapPin size={18} className="shrink-0 text-sea" />
            <input
              value={address}
              onChange={(event) => updateAddress(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
              aria-label="Delivery address"
            />
          </label>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-ink" type="button" aria-label="Filters">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </section>

      {submittedTask && (
        <section className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <div className="mx-auto max-w-7xl rounded-lg border border-teal-100 bg-mint/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-sea">Search process</p>
                <h2 className="mt-1 text-xl font-bold text-ink">Looking for a master</h2>
              </div>
              <StatusBadge status={submittedTask.status} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <span>Your offer</span>
                <span className="font-bold text-ink">{eur(submittedTask.customerOffer)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Possible masters</span>
                <span className="font-bold text-ink">{submittedMatches.length}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-sea">HandyGo</p>
                <h1 className="mt-1 text-3xl font-bold text-ink">What do you need help with?</h1>
                <p className="mt-2 text-sm text-slate-600">Logged in as {customer?.name ?? session.label}. Choose address and service, then request help.</p>
                <div className="mt-4 hidden max-w-xl items-center gap-2 rounded-full bg-slate-100 px-4 py-3 lg:flex">
                  <MapPin size={18} className="text-sea" />
                  <input
                    value={address}
                    onChange={(event) => updateAddress(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
                    aria-label="Delivery address"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                You set the offer. Masters can accept it or send a justified counter-offer.
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Discovery</h2>
              <span className="text-sm text-slate-500">{addressLookupStatus === "loading" ? "Looking up address..." : `${possibleMasters.length} available nearby${addressMatch && addressMatch !== "Map pin" && addressMatch !== "Looking up address" ? ` in ${addressMatch}` : ""}`}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {taskCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setSelectedMasterId(null);
                    setSubmittedTask(null);
                  }}
                  className={`min-h-24 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                    category === item ? "border-sea ring-2 ring-teal-100" : "border-slate-200"
                  } ${categoryTone[item]}`}
                >
                  <span className="block text-sm font-bold">{item}</span>
                  <span className="mt-2 block text-xs opacity-75">{countHandymenForCategory(state.handymen, item, location)} nearby</span>
                </button>
              ))}
            </div>
          </section>

          <MasterShelf title="Recommended for you" masters={recommendedMasters} selectedMasterId={selectedMasterId} onSelect={setSelectedMasterId} />
          <MasterShelf title="Fastest arrival" masters={fastestMasters} selectedMasterId={selectedMasterId} onSelect={setSelectedMasterId} />
          <MasterShelf title="Top rated" masters={topRatedMasters} selectedMasterId={selectedMasterId} onSelect={setSelectedMasterId} />

          {submittedTask && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-ink">Search process</h2>
                <StatusBadge status={submittedTask.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">Request created. These anonymous masters can receive and accept the task.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {submittedMatches.length > 0 ? (
                  submittedMatches.map((match, index) => <MasterCard key={match.handyman.id} index={index} match={match} selected={false} onSelect={() => undefined} compact />)
                ) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No available masters match this service and location yet.</p>
                )}
              </div>
            </section>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-xl font-bold text-ink">{submittedTask ? "Search process" : "Your request"}</h2>
            {!submittedTask ? (
            <form action={submit} className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Address
                <input value={address} onChange={(event) => updateAddress(event.target.value)} required className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
              </label>
              {addressLookupStatus === "loading" && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">Looking up this address and updating nearby masters...</p>}
              {addressLookupStatus === "pin" && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Using the map pin as the exact task location.</p>}
              <MapPicker value={location} onChange={updateLocationFromMap} label="Task location" nearbyMarkers={mapMarkers} />

              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Service
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as TaskCategory);
                    setSelectedMasterId(null);
                    setSubmittedTask(null);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
                >
                  {taskCategories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Task description
                <textarea name="description" required rows={4} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Your offer for this service
                <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-500">€</span>
                  <input name="customerOffer" type="number" min={5} step={1} defaultValue={50} required className="ml-2 min-w-0 flex-1 font-normal outline-none" />
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Photos
                  <input name="photos" type="file" multiple accept="image/*" className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  Preferred time
                  <select value={preferredTime} onChange={(event) => setPreferredTime(event.target.value as PreferredTime)} className="rounded-lg border border-slate-300 px-3 py-2 font-normal">
                    <option>ASAP</option>
                    <option>Today</option>
                    <option>Scheduled</option>
                  </select>
                </label>
              </div>

              {preferredTime === "Scheduled" && <Field name="preferredDateTime" label="Select date and time" type="datetime-local" required />}

              <div className="rounded-lg bg-mint/60 p-3 text-sm leading-6 text-teal-950">
                {selectedMasterId ? "Selected provider group will be prioritized in matching." : "You set the offer. A master can accept it or make a justified counter-offer."}
              </div>

              <button className="rounded-lg bg-sea px-5 py-3 font-semibold text-white hover:bg-teal-800" type="submit">
                Request service
              </button>
            </form>
            ) : (
              <div className="mt-4 grid gap-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">Status</span>
                    <StatusBadge status={submittedTask.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">We are searching for available masters. Matching uses address, service category, availability, approval, and working radius.</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <h3 className="font-semibold text-ink">Price negotiation</h3>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <div className="flex justify-between gap-3">
                      <span>Your offer</span>
                      <span className="font-bold text-ink">{eur(submittedTask.customerOffer)}</span>
                    </div>
                    {submittedTask.handymanCounterOffer ? (
                      <>
                        <div className="flex justify-between gap-3">
                          <span>Master counter-offer</span>
                          <span className="font-bold text-amber-700">{eur(submittedTask.handymanCounterOffer)}</span>
                        </div>
                        <p className="rounded-lg bg-amber-50 p-2 text-amber-900">{submittedTask.handymanCounterReason}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setNegotiationStatus("accepted")} className="flex-1 rounded-lg bg-sea px-3 py-2 font-semibold text-white" type="button">
                            Accept
                          </button>
                          <button onClick={() => setNegotiationStatus("declined")} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-semibold text-ink" type="button">
                            Decline
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="rounded-lg bg-mint/60 p-2 text-teal-950">Waiting for a master to accept your offer or request another price with a reason.</p>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Negotiation: {submittedTask.negotiationStatus.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <h3 className="font-semibold text-ink">Possible masters</h3>
                  <p className="mt-1 text-sm text-slate-600">{submittedMatches.length} masters can receive this request.</p>
                </div>
              </div>
            )}
          </section>

          <SupportChat messages={supportMessages} onSend={sendSupportMessage} />
        </aside>
      </div>
    </main>
  );
}

function SupportChat({
  messages,
  onSend
}: {
  messages: Array<{ from: "support" | "customer"; text: string }>;
  onSend: (formData: FormData) => void;
}) {
  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-sea" />
        <h2 className="font-bold text-ink">Support</h2>
      </div>
      <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`rounded-lg p-2 text-sm ${message.from === "customer" ? "ml-8 bg-sea text-white" : "mr-8 bg-slate-100 text-slate-700"}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form action={onSend} className="mt-3 flex gap-2">
        <input name="message" placeholder="Message support" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button className="grid h-10 w-10 place-items-center rounded-lg bg-sea text-white" type="submit" aria-label="Send support message">
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}

function MasterShelf({
  title,
  masters,
  selectedMasterId,
  onSelect
}: {
  title: string;
  masters: ReturnType<typeof findMatchingHandymen>;
  selectedMasterId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <span className="text-sm font-medium text-sea">See all</span>
      </div>
      {masters.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {masters.map((match, index) => (
            <MasterCard key={`${title}-${match.handyman.id}`} index={index} match={match} selected={selectedMasterId === match.handyman.id} onSelect={() => onSelect(match.handyman.id)} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No matching masters for this category and address yet.</p>
      )}
    </section>
  );
}

function MasterCard({
  index,
  match,
  selected,
  onSelect,
  compact = false
}: {
  index: number;
  match: ReturnType<typeof findMatchingHandymen>[number];
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const minutes = etaMinutes(match.distanceKm);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${selected ? "border-sea ring-2 ring-teal-100" : "border-slate-200"}`}
    >
      <div className={`rounded-lg bg-gradient-to-br from-teal-100 to-slate-100 ${compact ? "h-16" : "h-24"} p-3`}>
        <div className="inline-flex rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-sea">Master #{index + 1}</div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">Anonymous master</p>
          <p className="mt-1 text-sm text-slate-600">{match.handyman.cityDistrict}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">{match.handyman.rating.toFixed(1)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
        <span>{minutes}-{minutes + 10} min</span>
        <span>{match.distanceKm.toFixed(1)} km</span>
        <span>{match.handyman.completedJobs} jobs</span>
      </div>
    </button>
  );
}

function countHandymenForCategory(handymen: Parameters<typeof findMatchingHandymen>[1], category: TaskCategory, location: Coordinates) {
  return handymen.filter((handyman) => handyman.approved && !handyman.blocked && handyman.availabilityStatus === "available" && handyman.skills.includes(category) && distanceKm(location, handyman.homeLocation) <= handyman.workingRadiusKm).length;
}

function etaMinutes(distance: number) {
  return Math.max(15, Math.round(12 + distance * 4));
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-800">
      {label}
      <input name={name} type={type} required={required} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
  );
}
