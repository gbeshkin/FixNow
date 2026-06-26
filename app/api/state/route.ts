import { NextResponse } from "next/server";
import { initialState } from "@/data/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        source: "mock",
        state: initialState
      });
    }

    const { loadDatabaseState } = await import("@/lib/database-store");
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
