import { NextResponse } from "next/server";
import type { TaskRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateTaskPayload = Omit<TaskRequest, "id" | "createdAt" | "status">;

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ databaseAvailable: false, error: "DATABASE_URL is not configured" });
    }

    const payload = (await request.json()) as CreateTaskPayload;
    const { insertDatabaseTask } = await import("@/lib/database-store");
    const task = await insertDatabaseTask(payload);
    return NextResponse.json({ databaseAvailable: true, task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create database task", error);
    return NextResponse.json({
      databaseAvailable: false,
      error: "Database is not ready. Run npm run db:setup with Railway DATABASE_URL."
    });
  }
}
