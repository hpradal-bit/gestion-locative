-- Phase 12 : historique des relances envoyées aux locataires.
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rent_schedule_id uuid not null references public.rent_schedules (id) on delete cascade,

  level smallint not null check (level in (1, 2, 3)),
  channel text not null default 'email' check (channel in ('email', 'sms')),
  subject text not null,
  message text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,

  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);
create index if not exists reminders_rent_schedule_id_idx on public.reminders (rent_schedule_id);

alter table public.reminders enable row level security;

create policy "reminders_owner_all" on public.reminders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
