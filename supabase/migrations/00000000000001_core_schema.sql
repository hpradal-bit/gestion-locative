-- Phase 2 : schéma de base nécessaire aux KPIs du dashboard.
-- Chaque table porte directement user_id (isolation RLS simple, sans jointure).
-- Les tables complémentaires (works, loan_payments, documents, notifications,
-- reminders, projects, simulations) seront ajoutées phase par phase, sans jamais
-- modifier les migrations déjà appliquées.

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  name text not null,
  address text,
  city text,
  postal_code text,
  property_type text,
  surface_m2 numeric,
  rooms integer,
  floor integer,
  has_elevator boolean not null default false,
  has_parking boolean not null default false,
  has_cellar boolean not null default false,
  has_balcony boolean not null default false,
  is_furnished boolean not null default false,

  purchase_price numeric,
  purchase_date date,
  notary_fees numeric not null default 0,
  agency_fees numeric not null default 0,
  other_acquisition_fees numeric not null default 0,
  works_budget numeric not null default 0,
  furniture_budget numeric not null default 0,

  monthly_rent numeric not null default 0,
  monthly_charges numeric not null default 0,
  rental_start_date date,

  property_tax_annual numeric not null default 0,
  condo_fees_annual numeric not null default 0,
  insurance_annual numeric not null default 0,
  management_fees_annual numeric not null default 0,
  maintenance_annual numeric not null default 0,
  other_charges_annual numeric not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  birth_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,

  initial_amount numeric not null,
  down_payment numeric not null default 0,
  annual_interest_rate numeric not null,
  duration_months integer not null,
  monthly_insurance numeric not null default 0,
  start_date date not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,

  start_date date not null,
  end_date date,
  lease_type text,
  initial_rent numeric not null,
  charges numeric not null default 0,
  security_deposit numeric not null default 0,
  irl_index text,
  next_revision_date date,
  status text not null default 'active' check (status in ('active', 'ended')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rent_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lease_id uuid not null references public.leases (id) on delete cascade,

  due_date date not null,
  rent_amount numeric not null,
  charges_amount numeric not null default 0,

  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rent_schedule_id uuid not null references public.rent_schedules (id) on delete cascade,

  amount numeric not null,
  paid_at date not null,
  payment_method text,
  comment text,

  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,

  category text not null,
  amount numeric not null,
  expense_date date not null,
  description text,
  supplier text,
  is_recurring boolean not null default false,

  created_at timestamptz not null default now()
);

-- Index de base sur les clés étrangères et user_id (lectures RLS + jointures).
create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists tenants_user_id_idx on public.tenants (user_id);
create index if not exists loans_user_id_idx on public.loans (user_id);
create index if not exists loans_property_id_idx on public.loans (property_id);
create index if not exists leases_user_id_idx on public.leases (user_id);
create index if not exists leases_property_id_idx on public.leases (property_id);
create index if not exists leases_tenant_id_idx on public.leases (tenant_id);
create index if not exists rent_schedules_user_id_idx on public.rent_schedules (user_id);
create index if not exists rent_schedules_lease_id_idx on public.rent_schedules (lease_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_rent_schedule_id_idx on public.payments (rent_schedule_id);
create index if not exists expenses_user_id_idx on public.expenses (user_id);
create index if not exists expenses_property_id_idx on public.expenses (property_id);

-- RLS : chaque utilisateur ne voit et ne modifie que ses propres données.
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.loans enable row level security;
alter table public.leases enable row level security;
alter table public.rent_schedules enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

create policy "properties_owner_all" on public.properties
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tenants_owner_all" on public.tenants
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "loans_owner_all" on public.loans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "leases_owner_all" on public.leases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "rent_schedules_owner_all" on public.rent_schedules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "payments_owner_all" on public.payments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "expenses_owner_all" on public.expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
