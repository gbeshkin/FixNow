"use client";

import { initialState } from "@/data/seed";
import type { AppState, CustomerProfile, HandymanProfile, TaskRequest, TaskStatus } from "@/lib/types";

const STORAGE_KEY = "handygo-mvp-state";

export function loadState(): AppState {
  if (typeof window === "undefined") return initialState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveState(initialState);
    return structuredClone(initialState);
  }

  try {
    const parsed = JSON.parse(raw) as AppState;
    return normalizeState(parsed);
  } catch {
    saveState(initialState);
    return structuredClone(initialState);
  }
}

export function saveState(state: AppState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function resetState() {
  saveState(initialState);
  return structuredClone(initialState);
}

type CreateTaskInput = Omit<TaskRequest, "id" | "customerId" | "createdAt" | "status"> & {
  customerId?: string;
};

export function createCustomer(input: Omit<CustomerProfile, "id">) {
  const state = loadState();
  const customer: CustomerProfile = {
    ...input,
    id: `cust-${Date.now()}`
  };
  state.customers.unshift(customer);
  saveState(state);
  return customer;
}

export function createTask(input: CreateTaskInput) {
  const state = loadState();
  const customerId = input.customerId ?? `cust-${Date.now()}`;
  const task: TaskRequest = {
    ...input,
    id: `task-${Date.now()}`,
    customerId,
    status: "searching",
    createdAt: new Date().toISOString()
  };

  if (!state.customers.some((customer) => customer.id === customerId)) {
    state.customers.push({
      id: customerId,
      name: input.customerName,
      phone: input.phone,
      email: input.email
    });
  }
  state.tasks.unshift(task);
  state.statusHistory.push({
    id: `hist-${Date.now()}`,
    taskId: task.id,
    status: "searching",
    note: "Task created",
    createdAt: new Date().toISOString()
  });
  saveState(state);
  return task;
}

type CreateHandymanInput = Omit<HandymanProfile, "id" | "approved" | "blocked" | "rating" | "completedJobs"> & {
  rating?: number;
  completedJobs?: number;
};

export function createHandyman(input: CreateHandymanInput) {
  const state = loadState();
  const handyman: HandymanProfile = {
    ...input,
    id: `hm-${Date.now()}`,
    rating: input.rating || 5,
    completedJobs: input.completedJobs || 0,
    approved: false,
    blocked: false
  };
  state.handymen.unshift(handyman);
  saveState(state);
  return handyman;
}

export function updateTaskStatus(taskId: string, status: TaskStatus, handymanId?: string) {
  const state = loadState();
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status,
          assignedHandymanId: handymanId ?? task.assignedHandymanId
        }
      : task
  );
  state.statusHistory.push({
    id: `hist-${Date.now()}`,
    taskId,
    status,
    note: `Status changed to ${status.replace("_", " ")}`,
    createdAt: new Date().toISOString()
  });
  saveState(state);
  return state;
}

export function proposeTaskPrice(taskId: string, handymanId: string, counterOffer: number, reason: string) {
  const state = loadState();
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          assignedHandymanId: task.assignedHandymanId ?? handymanId,
          handymanCounterOffer: counterOffer,
          handymanCounterReason: reason,
          negotiationStatus: "handyman_counter"
        }
      : task
  );
  saveState(state);
  return state;
}

export function updateNegotiationStatus(taskId: string, negotiationStatus: TaskRequest["negotiationStatus"]) {
  const state = loadState();
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          negotiationStatus,
          status: negotiationStatus === "accepted" && task.assignedHandymanId ? "assigned" : task.status
        }
      : task
  );
  saveState(state);
  return state;
}

export function updateState(mutator: (state: AppState) => AppState) {
  const next = mutator(loadState());
  saveState(next);
  return next;
}

function normalizeState(state: AppState): AppState {
  const seededRatings = new Map(initialState.handymen.map((handyman) => [handyman.email, handyman]));

  return {
    ...state,
    tasks: state.tasks.map((task) => ({
      ...task,
      customerOffer: task.customerOffer ?? task.estimatedDurationHours * 30 + 5,
      negotiationStatus: task.negotiationStatus ?? "customer_offer"
    })),
    handymen: state.handymen.map((handyman) => {
      const seed = seededRatings.get(handyman.email);
      return {
        ...handyman,
        rating: handyman.rating ?? seed?.rating ?? 5,
        completedJobs: handyman.completedJobs ?? seed?.completedJobs ?? 0
      };
    })
  };
}
