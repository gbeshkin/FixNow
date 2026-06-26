"use client";

import { createTask, loadState } from "@/lib/store";
import type { AppState, TaskRequest } from "@/lib/types";

type StateResponse = {
  source: "mock" | "database";
  state: AppState;
};

type CreateTaskInput = Omit<TaskRequest, "id" | "customerId" | "createdAt" | "status"> & {
  customerId?: string;
};

export async function loadSharedState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return loadState();
    const data = (await response.json()) as StateResponse;
    if (data.source === "mock") return loadState();
    return data.state;
  } catch {
    return loadState();
  }
}

export async function createSharedTask(input: CreateTaskInput) {
  const localTask = createTask(input);

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(localTask)
    });

    if (!response.ok) return localTask;
    const data = (await response.json()) as { task: TaskRequest };
    return data.task;
  } catch {
    return localTask;
  }
}
