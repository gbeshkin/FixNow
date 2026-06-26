create table if not exists users (
  id text primary key,
  role text not null check (role in ('customer', 'handyman', 'admin')),
  email text not null unique,
  label text not null,
  profile_id text,
  created_at timestamptz not null default now()
);

create table if not exists customer_profiles (
  id text primary key,
  user_id text references users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists handyman_profiles (
  id text primary key,
  user_id text references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  city_district text not null,
  home_lat double precision not null,
  home_lng double precision not null,
  working_radius_km numeric(6, 2) not null default 5,
  skills text[] not null default '{}',
  short_bio text not null,
  profile_photo_url text not null default '',
  rating numeric(2, 1) not null default 5.0,
  completed_jobs integer not null default 0,
  availability_status text not null check (availability_status in ('available', 'busy', 'offline')) default 'offline',
  approved boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists pricing_settings (
  id integer primary key default 1 check (id = 1),
  hourly_rate numeric(8, 2) not null default 30,
  travel_fee numeric(8, 2) not null default 5,
  platform_commission_percent numeric(5, 2) not null default 15,
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id text primary key,
  customer_id text references customer_profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  category text not null,
  description text not null,
  photo_file_names text[] not null default '{}',
  estimated_duration_hours integer not null check (estimated_duration_hours in (1, 2, 4)),
  customer_offer numeric(8, 2) not null,
  handyman_counter_offer numeric(8, 2),
  handyman_counter_reason text,
  negotiation_status text not null check (negotiation_status in ('customer_offer', 'handyman_counter', 'accepted', 'declined')) default 'customer_offer',
  preferred_time text not null check (preferred_time in ('ASAP', 'Today', 'Scheduled')),
  preferred_datetime text,
  status text not null check (status in ('searching', 'assigned', 'in_progress', 'completed', 'cancelled')) default 'searching',
  assigned_handyman_id text references handyman_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists task_status_history (
  id text primary key,
  task_id text not null references tasks(id) on delete cascade,
  status text not null check (status in ('searching', 'assigned', 'in_progress', 'completed', 'cancelled')),
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists tasks_customer_idx on tasks(customer_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_category_idx on tasks(category);
create index if not exists tasks_assigned_handyman_idx on tasks(assigned_handyman_id);
create index if not exists handyman_availability_idx on handyman_profiles(availability_status, approved, blocked);
