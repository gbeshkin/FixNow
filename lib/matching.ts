import type { Coordinates, HandymanProfile, TaskRequest } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

export function distanceKm(a: Coordinates, b: Coordinates) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function findMatchingHandymen(task: TaskRequest, handymen: HandymanProfile[]) {
  return handymen
    .filter((handyman) => {
      const distance = distanceKm(task.location, handyman.homeLocation);
      return (
        handyman.availabilityStatus === "available" &&
        handyman.approved &&
        !handyman.blocked &&
        handyman.skills.includes(task.category) &&
        distance <= handyman.workingRadiusKm
      );
    })
    .map((handyman) => ({
      handyman,
      distanceKm: distanceKm(task.location, handyman.homeLocation)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
