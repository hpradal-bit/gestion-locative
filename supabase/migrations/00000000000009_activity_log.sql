-- Journal d'activité : trace les actions importantes de la gestion
-- locative (relances, quittances, paiements, baux, documents, biens...).
-- entity_label capture un intitulé lisible au moment de l'événement — les
-- entités référencées peuvent être supprimées plus tard, l'historique doit
-- rester compréhensible malgré tout. Immuable : pas de politique
-- UPDATE/DELETE, un journal qui pourrait être réécrit n'en serait plus un.
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  action text not null check (action in (
    'reminder_sent',
    'receipt_generated',
    'payment_recorded',
    'lease_created',
    'lease_updated',
    'lease_ended',
    'document_added',
    'document_deleted',
    'property_created',
    'property_updated',
    'simulation_created',
    'simulation_updated'
  )),
  entity_label text not null,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_id_idx on public.activity_events (user_id);
create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);

alter table public.activity_events enable row level security;

create policy "activity_events_owner_select" on public.activity_events
  for select using (user_id = (select auth.uid()));

create policy "activity_events_owner_insert" on public.activity_events
  for insert with check (user_id = (select auth.uid()));

-- Pas de policy UPDATE/DELETE : le journal est immuable, même pour son propriétaire.
