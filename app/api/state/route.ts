import { NextResponse } from "next/server";
import { initialState } from "@/data/seed";
import { hasDatabaseUrl } from "@/lib/db";
import { loadDatabaseState } from "@/lib/database-store";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      source: "mock",
      state: initialState
    });
  }

  const state = await loadDatabaseState();
  return NextResponse.json({
    source: "database",
    state
  });
}
