import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { insertDatabaseTask } from "@/lib/database-store";
import type { TaskRequest } from "@/lib/types";

type CreateTaskPayload = Omit<TaskRequest, "id" | "createdAt" | "status">;

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const payload = (await request.json()) as CreateTaskPayload;
  const task = await insertDatabaseTask(payload);
  return NextResponse.json({ task }, { status: 201 });
}
