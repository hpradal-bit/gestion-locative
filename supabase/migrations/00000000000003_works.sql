-- Phase 8 : travaux, qui alimentent automatiquement les dépenses une fois terminés/payés.
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,

  description text not null,
  company text,
  quote_amount numeric not null default 0,
  estimated_amount numeric not null default 0,
  actual_amount numeric,
  start_date date,
  end_date date,
  status text not null default 'a_prevoir'
    check (status in ('a_prevoir', 'prevu', 'en_cours', 'termine', 'paye')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists works_user_id_idx on public.works (user_id);
create index if not exists works_property_id_idx on public.works (property_id);

alter table public.works enable row level security;

create policy "works_owner_all" on public.works
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Une dépense générée automatiquement référence le chantier qui l'a créée
-- (jamais ressaisie manuellement) : une information, une source.
alter table public.expenses
  add column if not exists work_id uuid references public.works (id) on delete cascade;

create index if not exists expenses_work_id_idx on public.expenses (work_id);
