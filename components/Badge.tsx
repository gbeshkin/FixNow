import type { AvailabilityStatus, TaskStatus } from "@/lib/types";

const statusStyles: Record<TaskStatus, string> = {
  searching: "bg-amber-100 text-amber-800",
  assigned: "bg-sky-100 text-sky-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800"
};

const availabilityStyles: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  busy: "bg-amber-100 text-amber-800",
  offline: "bg-slate-200 text-slate-700"
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{label(status)}</span>;
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${availabilityStyles[status]}`}>{label(status)}</span>;
}

export function label(value: string) {
  return value.replace("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
