import type { Coordinates } from "@/lib/types";

export type GeocodeResult = {
  coordinates: Coordinates;
  label: string;
  source: "local" | "osm";
};

const tallinnLocations: Array<{ keywords: string[]; coordinates: Coordinates; label: string }> = [
  { keywords: ["kesklinn", "center", "centre", "tartu mnt", "narva mnt", "parnu mnt", "pärnu mnt", "viru", "estonii", "liivalaia", "ravala", "rävala"], coordinates: { lat: 59.437, lng: 24.7536 }, label: "Kesklinn" },
  { keywords: ["lasnamae", "lasnamäe", "paepargi", "mustakivi", "linnamae", "linnamäe", "laagna", "mahtra", "punane"], coordinates: { lat: 59.4388, lng: 24.8456 }, label: "Lasnamae" },
  { keywords: ["mustamae", "mustamäe", "akadeemia", "sõpruse", "sopruse", "tammsaare", "eduvard vilde", "vilde tee"], coordinates: { lat: 59.4079, lng: 24.6807 }, label: "Mustamae" },
  { keywords: ["pohja tallinn", "pohja-tallinn", "põhja tallinn", "põhja-tallinn", "telliskivi", "kopli", "kalamaja", "pelgulinn", "stroomi"], coordinates: { lat: 59.4503, lng: 24.7062 }, label: "Pohja-Tallinn" },
  { keywords: ["nomme", "nõmme", "vabaduse pst", "rahumae", "rahumäe", "paaskula", "pääsküla", "hiiu"], coordinates: { lat: 59.3876, lng: 24.6869 }, label: "Nomme" },
  { keywords: ["haabersti", "rocca", "oismäe", "oismae", "väike-õismäe", "vaike oismae", "paldiski mnt", "tiskre", "tiskrevalja", "tiskrevälja", "tiskrevlja"], coordinates: { lat: 59.4269, lng: 24.6464 }, label: "Haabersti" },
  { keywords: ["pirita", "merivälja", "merivalja", "kloostrimetsa", "maarjamäe", "maarjamae"], coordinates: { lat: 59.4663, lng: 24.8357 }, label: "Pirita" },
  { keywords: ["kristiine", "lillekula", "lilleküla", "kotka", "tedre", "tulika"], coordinates: { lat: 59.4232, lng: 24.7104 }, label: "Kristiine" }
];

export function geocodeTallinnAddress(address: string) {
  const normalized = normalizeAddress(address);
  if (!normalized) return null;

  const match = tallinnLocations.find((location) => location.keywords.some((keyword) => normalized.includes(normalizeAddress(keyword))));
  if (!match) return null;

  return {
    coordinates: match.coordinates,
    label: match.label,
    source: "local"
  } satisfies GeocodeResult;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const localMatch = geocodeTallinnAddress(address);
  if (localMatch) return localMatch;

  const normalized = normalizeAddress(address);
  if (normalized.length < 4) return null;

  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
    if (!response.ok) return null;
    return (await response.json()) as GeocodeResult;
  } catch {
    return null;
  }
}

export async function geocodeOpenStreetMapAddress(address: string): Promise<GeocodeResult | null> {
  const normalized = normalizeAddress(address);
  if (normalized.length < 4) return null;

  try {
    const params = new URLSearchParams({
      q: `${address}, Tallinn, Estonia`,
      format: "jsonv2",
      addressdetails: "1",
      limit: "1",
      countrycodes: "ee",
      viewbox: "24.55,59.55,24.95,59.30",
      bounded: "1"
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "HandyGo MVP local development"
      }
    });
    if (!response.ok) return null;

    const results = (await response.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const first = results[0];
    if (!first?.lat || !first.lon) return null;

    return {
      coordinates: {
        lat: Number(first.lat),
        lng: Number(first.lon)
      },
      label: first.display_name?.split(",").slice(0, 2).join(", ") || "Address",
      source: "osm"
    };
  } catch {
    return null;
  }
}

function normalizeAddress(address: string) {
  return address
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
