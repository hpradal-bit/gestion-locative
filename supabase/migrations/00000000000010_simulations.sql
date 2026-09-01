-- Simulations sauvegardées : chaque scénario complet (acquisition,
-- financement, location, charges, fiscalité) est stocké tel quel en JSON —
-- c'est la même forme que SimulationInput (lib/finance/simulator.ts), pour
-- pouvoir rejouer exactement le même calcul à l'ouverture sans jamais
-- dupliquer la logique de calcul.
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  name text not null,
  input jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists simulations_user_id_idx on public.simulations (user_id);

alter table public.simulations enable row level security;

create policy "simulations_owner_all" on public.simulations
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
