-- Phase 6 : profil propriétaire, nécessaire aux documents (quittances).
create table if not exists public.owner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,

  full_name text,
  address text,
  city text,
  postal_code text,
  email text,
  phone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.owner_profiles enable row level security;

create policy "owner_profiles_owner_all" on public.owner_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
