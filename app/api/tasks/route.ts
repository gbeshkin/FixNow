import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { insertDatabaseTask } from "@/lib/database-store";
import type { TaskRequest } from "@/lib/types";

type CreateTaskPayload = Omit<TaskRequest, "id" | "createdAt" | "status">;

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ databaseAvailable: false, error: "DATABASE_URL is not configured" });
  }

  try {
    const payload = (await request.json()) as CreateTaskPayload;
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
