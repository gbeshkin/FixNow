# HandyGo

HandyGo is an MVP “Bolt for handymen” web application. Customers submit small repair tasks, approved handymen see nearby matching jobs, and admins manage pricing, approvals, task assignment, and basic statistics.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Railway Postgres-ready database scripts
- Supabase-ready legacy SQL placeholders
- OpenStreetMap + Leaflet map pickers
- Stripe placeholder helper for future payments

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Use `/login` to choose Customer, Handyman, or Admin before opening protected role areas. Without `DATABASE_URL`, the UI still falls back to mock seed data/localStorage while the database layer is being wired into each screen.

## Environment

Copy `.env.example` to `.env.local` and fill values when ready:

```bash
DATABASE_URL=
# DATABASE_SSL=false
STRIPE_SECRET_KEY=
```

## Railway Postgres

Railway Postgres exposes `DATABASE_URL` automatically when a PostgreSQL service is added to the same project. Set that value for the HandyGo service, then run:

```bash
npm run db:setup
```

This applies:

- `db/schema.sql` for tables and indexes
- `db/seed.sql` for Tallinn sample users, customers, handymen, tasks, and pricing

Useful commands:

```bash
npm run db:migrate
npm run db:seed
```

API checks:

- `GET /api/state` returns `{ source: "database", state }` when `DATABASE_URL` is configured
- `POST /api/tasks` creates a task in Postgres

## Supabase

The original Supabase SQL is still available as a reference. Run `supabase/schema.sql` to create Supabase tables, enums, indexes, and the matching function. Run `supabase/seed.sql` for sample Tallinn customers, handymen, tasks, and pricing settings.

Core tables:

- `users`
- `customer_profiles`
- `handyman_profiles`
- `tasks`
- `task_photos`
- `task_status_history`
- `pricing_settings`

The SQL function `matching_handymen_for_task(task_uuid)` applies the MVP matching rules: available, approved, unblocked, matching skill, and within working radius.

## MVP flows

- Customer: log in, choose address and service, browse Wolt-style discovery categories and anonymous master shelves such as recommended, fastest arrival, and top rated, set their own offer, then create a request and track search plus negotiation. Customers do not see handyman payout estimates.
- Handyman: choose a mock profile, see only matching nearby open tasks, accept work, start work, and complete work.
- Admin: view customers, handymen, tasks, matched handymen, edit pricing, approve/block handymen, manually assign tasks, and reset seed data.

## i18n readiness

`lib/i18n.ts` defines the locale structure with English active and Estonian/Russian reserved. The UI copy is currently English and can be moved into dictionaries as the next step.
