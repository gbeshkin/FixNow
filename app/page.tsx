import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { RoleTabs } from "@/components/RoleTabs";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid min-h-[74vh] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sea">Reliable help near you.</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight text-ink sm:text-6xl">HandyGo</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Book approved local handymen for furniture assembly, plumbing, electrical help, wall mounting, garden work, and other small home repairs.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/customer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-sea px-5 py-3 font-semibold text-white shadow-soft hover:bg-teal-800">
                  Find a handyman <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold text-ink hover:bg-slate-50">
                  Register as handyman
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-soft">
              <div className="aspect-[4/3] rounded-lg bg-[url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Fixed price", "30 EUR/hour + 5 EUR travel"],
                  ["Nearby match", "Skills and radius checked"],
                  ["Clear status", "Track every request"]
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg bg-white p-3">
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <Feature icon={<MapPin size={20} />} title="Pick a location" body="Use OpenStreetMap to pin the exact place where help is needed." />
            <Feature icon={<CheckCircle2 size={20} />} title="Match by skill" body="Available approved handymen only see work inside their radius." />
            <Feature icon={<Clock size={20} />} title="Start fast" body="ASAP, today, or scheduled jobs are supported in the MVP." />
          </div>
          <RoleTabs />
        </section>
      </main>
    </>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-mint text-sea">{icon}</div>
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
