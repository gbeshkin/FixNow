create extension if not exists "uuid-ossp";
create extension if not exists cube;
create extension if not exists earthdistance;

create type public.user_role as enum ('customer', 'handyman', 'admin');
create type public.availability_status as enum ('available', 'busy', 'offline');
create type public.task_status as enum ('searching', 'assigned', 'in_progress', 'completed', 'cancelled');
create type public.preferred_time as enum ('ASAP', 'Today', 'Scheduled');
create type public.task_category as enum (
  'Furniture assembly',
  'Plumbing',
  'Electrical',
  'Wall mounting',
  'Computer help',
  'Garden work',
  'Small repairs',
  'Moving help',
  'Other'
);

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  role public.user_role not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.customer_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.handyman_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  city_district text not null,
  home_lat double precision not null,
  home_lng double precision not null,
  working_radius_km numeric(6, 2) not null default 5,
  skills public.task_category[] not null default '{}',
  short_bio text not null,
  profile_photo_url text,
  rating numeric(2, 1) not null default 5.0,
  completed_jobs integer not null default 0,
  availability_status public.availability_status not null default 'offline',
  approved boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pricing_settings (
  id uuid primary key default uuid_generate_v4(),
  hourly_rate numeric(8, 2) not null default 30,
  travel_fee numeric(8, 2) not null default 5,
  platform_commission_percent numeric(5, 2) not null default 15,
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customer_profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  category public.task_category not null,
  description text not null,
  estimated_duration_hours integer not null check (estimated_duration_hours in (1, 2, 4)),
  preferred_time public.preferred_time not null,
  preferred_datetime timestamptz,
  status public.task_status not null default 'searching',
  assigned_handyman_id uuid references public.handyman_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.task_photos (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table public.task_status_history (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  status public.task_status not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index tasks_location_idx on public.tasks using gist (ll_to_earth(lat, lng));
create index handymen_location_idx on public.handyman_profiles using gist (ll_to_earth(home_lat, home_lng));
create index tasks_status_idx on public.tasks(status);
create index handyman_availability_idx on public.handyman_profiles(availability_status, approved, blocked);

create or replace function public.matching_handymen_for_task(task_uuid uuid)
returns table (
  handyman_id uuid,
  full_name text,
  distance_km double precision,
  working_radius_km numeric
)
language sql
stable
as $$
  select
    h.id,
    h.full_name,
    earth_distance(ll_to_earth(t.lat, t.lng), ll_to_earth(h.home_lat, h.home_lng)) / 1000 as distance_km,
    h.working_radius_km
  from public.tasks t
  join public.handyman_profiles h
    on h.availability_status = 'available'
   and h.approved = true
   and h.blocked = false
   and t.category = any(h.skills)
   and earth_distance(ll_to_earth(t.lat, t.lng), ll_to_earth(h.home_lat, h.home_lng)) / 1000 <= h.working_radius_km
  where t.id = task_uuid
  order by distance_km asc;
$$;
