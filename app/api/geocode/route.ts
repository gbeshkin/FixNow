import { NextResponse } from "next/server";
import { geocodeOpenStreetMapAddress, geocodeTallinnAddress } from "@/lib/geocoding";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 4) {
    return NextResponse.json({ error: "Address query is too short" }, { status: 400 });
  }

  const localResult = geocodeTallinnAddress(query);
  if (localResult) {
    return NextResponse.json(localResult);
  }

  const osmResult = await geocodeOpenStreetMapAddress(query);
  if (!osmResult) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(osmResult);
}
