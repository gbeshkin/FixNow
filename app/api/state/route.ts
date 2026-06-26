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

  try {
    const state = await loadDatabaseState();
    return NextResponse.json({
      source: "database",
      state
    });
  } catch (error) {
    console.error("Failed to load database state", error);
    return NextResponse.json({
      source: "mock",
      state: initialState,
      databaseError: "Database is not ready. Run npm run db:setup with Railway DATABASE_URL."
    });
  }
}
