import Link from "next/link";
import {
  ArrowRight,
  Drill,
  Hammer,
  Leaf,
  Lightbulb,
  MapPin,
  Monitor,
  Package,
  Paintbrush,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Truck,
  Wrench
} from "lucide-react";
import { Header } from "@/components/Header";
import { RoleTabs } from "@/components/RoleTabs";
import { taskCategories, type TaskCategory } from "@/lib/types";

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  "Furniture assembly": <Package size={26} />,
  Plumbing: <Wrench size={26} />,
  Electrical: <Lightbulb size={26} />,
  "Wall mounting": <Drill size={26} />,
  "Computer help": <Monitor size={26} />,
  "Garden work": <Leaf size={26} />,
  "Small repairs": <Hammer size={26} />,
  "Moving help": <Truck size={26} />,
  Other: <Paintbrush size={26} />
};

const featuredServices = [
  {
    title: "Furniture assembly today",
    body: "Wardrobes, beds, tables, shelves",
    meta: "From your offer",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Plumbing and leaks",
    body: "Small fixes, taps, drains, toilets",
    meta: "Fast matching",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Wall mounting",
    body: "TVs, shelves, mirrors, pictures",
    meta: "Rated masters",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=900&q=80"
  }
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7faf9]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
            <div className="flex items-center gap-3">
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint text-sea" type="button" aria-label="Current city">
                <MapPin size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reliable help near you</p>
                <h1 className="truncate text-xl font-bold text-ink sm:text-3xl">HandyGo in Tallinn</h1>
              </div>
              <Link href="/customer" className="ml-auto hidden items-center gap-2 rounded-lg bg-sea px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-teal-800 sm:inline-flex">
                Find a handyman <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Link href="/customer" className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-200">
                <Search size={18} className="shrink-0 text-slate-500" />
                <span className="truncate">Search plumbing, mounting, repairs...</span>
              </Link>
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-ink" type="button" aria-label="Filters">
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6">
          <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {taskCategories.map((category) => (
              <Link
                href="/customer"
                key={category}
                className="grid min-h-28 min-w-28 place-items-center rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:min-w-36"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-mint text-sea">{categoryIcons[category]}</span>
                <span className="mt-2 text-xs font-bold text-ink sm:text-sm">{category}</span>
              </Link>
            ))}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <Link href="/customer" className="group relative min-h-64 overflow-hidden rounded-lg bg-slate-900 shadow-soft">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-sm font-semibold text-teal-100">Available nearby</p>
                <h2 className="mt-1 max-w-xl text-3xl font-bold leading-tight">Tell us what broke. Masters nearby can respond.</h2>
                <p className="mt-2 max-w-lg text-sm text-slate-100">Set your own offer, compare possible masters by rating, and start the request flow.</p>
              </div>
            </Link>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Feature icon={<ShieldCheck size={20} />} title="Approved masters" body="Only approved available profiles enter matching." />
              <Feature icon={<Star size={20} />} title="Ratings first" body="Customers see rating, distance, and ETA before choosing." />
              <Feature icon={<MapPin size={20} />} title="Radius based" body="Matching uses address, map pin, skill, and working radius." />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-ink">Popular services</h2>
            <Link href="/customer" className="text-sm font-semibold text-sea">
              See all
            </Link>
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {featuredServices.map((service) => (
              <Link key={service.title} href="/customer" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }} />
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-sea">{service.meta}</p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{service.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.body}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <RoleTabs />
          </div>
        </section>

        <section className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-soft backdrop-blur sm:hidden">
          <Link href="/customer" className="flex items-center justify-center gap-2 rounded-lg bg-sea px-5 py-3 font-semibold text-white">
            Find a handyman <ArrowRight size={18} />
          </Link>
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
