export type Role = "customer" | "handyman" | "admin";

export const taskCategories = [
  "Furniture assembly",
  "Plumbing",
  "Electrical",
  "Wall mounting",
  "Computer help",
  "Garden work",
  "Small repairs",
  "Moving help",
  "Other"
] as const;

export type TaskCategory = (typeof taskCategories)[number];

export type AvailabilityStatus = "available" | "busy" | "offline";
export type TaskStatus = "searching" | "assigned" | "in_progress" | "completed" | "cancelled";
export type PreferredTime = "ASAP" | "Today" | "Scheduled";
export type DurationHours = 1 | 2 | 4;
export type NegotiationStatus = "customer_offer" | "handyman_counter" | "accepted" | "declined";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PricingSettings = {
  hourlyRate: number;
  travelFee: number;
  platformCommissionPercent: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type HandymanProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cityDistrict: string;
  homeLocation: Coordinates;
  workingRadiusKm: number;
  skills: TaskCategory[];
  shortBio: string;
  profilePhotoUrl: string;
  rating: number;
  completedJobs: number;
  availabilityStatus: AvailabilityStatus;
  approved: boolean;
  blocked: boolean;
};

export type TaskPhoto = {
  id: string;
  taskId: string;
  url: string;
  fileName: string;
};

export type TaskStatusHistory = {
  id: string;
  taskId: string;
  status: TaskStatus;
  note: string;
  createdAt: string;
};

export type TaskRequest = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  location: Coordinates;
  category: TaskCategory;
  description: string;
  photoFileNames: string[];
  estimatedDurationHours: DurationHours;
  customerOffer: number;
  handymanCounterOffer?: number;
  handymanCounterReason?: string;
  negotiationStatus: NegotiationStatus;
  preferredTime: PreferredTime;
  preferredDateTime?: string;
  status: TaskStatus;
  assignedHandymanId?: string;
  createdAt: string;
};

export type AppState = {
  customers: CustomerProfile[];
  handymen: HandymanProfile[];
  tasks: TaskRequest[];
  statusHistory: TaskStatusHistory[];
  pricing: PricingSettings;
};
