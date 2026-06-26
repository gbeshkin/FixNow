import Link from "next/link";

export function RoleTabs() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-300" href="/customer">
        <span className="font-semibold text-ink">Customer request</span>
        <span className="mt-1 block text-sm text-slate-600">Create a task and see the live price.</span>
      </Link>
      <Link className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-300" href="/handyman/dashboard">
        <span className="font-semibold text-ink">Handyman dashboard</span>
        <span className="mt-1 block text-sm text-slate-600">Accept nearby matching jobs.</span>
      </Link>
      <Link className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-300" href="/admin">
        <span className="font-semibold text-ink">Admin panel</span>
        <span className="mt-1 block text-sm text-slate-600">Manage pricing, approvals, and assignments.</span>
      </Link>
    </div>
  );
}
