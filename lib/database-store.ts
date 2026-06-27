import { getPool } from "@/lib/db";
import type { AppState, AvailabilityStatus, CustomerProfile, HandymanProfile, NegotiationStatus, PreferredTime, TaskCategory, TaskRequest, TaskStatus } from "@/lib/types";

type PricingRow = {
  hourly_rate: string;
  travel_fee: string;
  platform_commission_percent: string;
};

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type HandymanRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city_district: string;
  home_lat: number;
  home_lng: number;
  working_radius_km: string;
  skills: TaskCategory[];
  short_bio: string;
  profile_photo_url: string;
  rating: string;
  completed_jobs: number;
  availability_status: AvailabilityStatus;
  approved: boolean;
  blocked: boolean;
};

type TaskRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  category: TaskCategory;
  description: string;
  photo_file_names: string[];
  estimated_duration_hours: 1 | 2 | 4;
  customer_offer: string;
  handyman_counter_offer: string | null;
  handyman_counter_reason: string | null;
  negotiation_status: NegotiationStatus;
  preferred_time: PreferredTime;
  preferred_datetime: string | null;
  status: TaskStatus;
  assigned_handyman_id: string | null;
  created_at: Date;
};

type HistoryRow = {
  id: string;
  task_id: string;
  status: TaskStatus;
  note: string;
  created_at: Date;
};

export async function loadDatabaseState(): Promise<AppState> {
  const pool = getPool();
  const [pricingResult, customersResult, handymenResult, tasksResult, historyResult] = await Promise.all([
    pool.query<PricingRow>("select hourly_rate, travel_fee, platform_commission_percent from pricing_settings where id = 1"),
    pool.query<CustomerRow>("select id, name, phone, email from customer_profiles order by created_at asc"),
    pool.query<HandymanRow>("select * from handyman_profiles order by created_at asc"),
    pool.query<TaskRow>("select * from tasks order by created_at desc"),
    pool.query<HistoryRow>("select * from task_status_history order by created_at asc")
  ]);

  const pricing = pricingResult.rows[0] ?? {
    hourly_rate: "30",
    travel_fee: "5",
    platform_commission_percent: "15"
  };

  return {
    pricing: {
      hourlyRate: Number(pricing.hourly_rate),
      travelFee: Number(pricing.travel_fee),
      platformCommissionPercent: Number(pricing.platform_commission_percent)
    },
    customers: customersResult.rows.map(mapCustomer),
    handymen: handymenResult.rows.map(mapHandyman),
    tasks: tasksResult.rows.map(mapTask),
    statusHistory: historyResult.rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      status: row.status,
      note: row.note,
      createdAt: row.created_at.toISOString()
    }))
  };
}

export async function insertDatabaseTask(input: Omit<TaskRequest, "id" | "createdAt" | "status">) {
  const pool = getPool();
  const id = `task-${Date.now()}`;
  const createdAt = new Date();
  const customerId = input.customerId || `cust-${Date.now()}`;

  await pool.query(
    `insert into customer_profiles (id, name, phone, email)
     values ($1, $2, $3, $4)
     on conflict (id) do update set
       name = excluded.name,
       phone = excluded.phone,
       email = excluded.email`,
    [customerId, input.customerName, input.phone, input.email]
  );

  await pool.query(
    `insert into tasks (
      id, customer_id, customer_name, phone, email, address, lat, lng, category,
      description, photo_file_names, estimated_duration_hours, customer_offer,
      negotiation_status, preferred_time, preferred_datetime, status, created_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'searching', $17)`,
    [
      id,
      customerId,
      input.customerName,
      input.phone,
      input.email,
      input.address,
      input.location.lat,
      input.location.lng,
      input.category,
      input.description,
      input.photoFileNames,
      input.estimatedDurationHours,
      input.customerOffer,
      input.negotiationStatus,
      input.preferredTime,
      input.preferredDateTime ?? null,
      createdAt
    ]
  );

  await pool.query(
    "insert into task_status_history (id, task_id, status, note, created_at) values ($1, $2, 'searching', 'Task created', $3)",
    [`hist-${Date.now()}`, id, createdAt]
  );

  return {
    ...input,
    id,
    customerId,
    status: "searching" as const,
    createdAt: createdAt.toISOString()
  };
}

function mapCustomer(row: CustomerRow): CustomerProfile {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email
  };
}

function mapHandyman(row: HandymanRow): HandymanProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    cityDistrict: row.city_district,
    homeLocation: {
      lat: row.home_lat,
      lng: row.home_lng
    },
    workingRadiusKm: Number(row.working_radius_km),
    skills: row.skills,
    shortBio: row.short_bio,
    profilePhotoUrl: row.profile_photo_url,
    rating: Number(row.rating),
    completedJobs: row.completed_jobs,
    availabilityStatus: row.availability_status,
    approved: row.approved,
    blocked: row.blocked
  };
}

function mapTask(row: TaskRow): TaskRequest {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    location: {
      lat: row.lat,
      lng: row.lng
    },
    category: row.category,
    description: row.description,
    photoFileNames: row.photo_file_names,
    estimatedDurationHours: row.estimated_duration_hours,
    customerOffer: Number(row.customer_offer),
    handymanCounterOffer: row.handyman_counter_offer ? Number(row.handyman_counter_offer) : undefined,
    handymanCounterReason: row.handyman_counter_reason ?? undefined,
    negotiationStatus: row.negotiation_status,
    preferredTime: row.preferred_time,
    preferredDateTime: row.preferred_datetime ?? undefined,
    status: row.status,
    assignedHandymanId: row.assigned_handyman_id ?? undefined,
    createdAt: row.created_at.toISOString()
  };
}
