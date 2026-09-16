-- Signature électronique d'un bail : chaque envoi pour signature crée une
-- ligne figeant le contenu du document au moment de l'envoi (les
-- signataires signent toujours exactement ce qui a été envoyé, même si le
-- bail est modifié après coup) et un jeton distinct par signataire — le
-- jeton fait office de lien magique, aucune authentification requise pour
-- que le locataire puisse signer.

create table if not exists public.signature_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lease_id uuid not null references public.leases (id) on delete cascade,
  template_id uuid not null references public.document_templates (id) on delete cascade,

  document_name text not null,
  content text not null,

  owner_token uuid not null default gen_random_uuid(),
  owner_name text not null,
  owner_signed_name text,
  owner_signed_at timestamptz,

  tenant_token uuid not null default gen_random_uuid(),
  tenant_name text not null,
  tenant_signed_name text,
  tenant_signed_at timestamptz,

  final_document_id uuid references public.documents (id) on delete set null,

  created_at timestamptz not null default now()
);

create unique index if not exists signature_requests_owner_token_idx
  on public.signature_requests (owner_token);
create unique index if not exists signature_requests_tenant_token_idx
  on public.signature_requests (tenant_token);
create index if not exists signature_requests_lease_id_idx
  on public.signature_requests (lease_id);
create index if not exists signature_requests_user_id_idx
  on public.signature_requests (user_id);

alter table public.signature_requests enable row level security;

-- Le propriétaire (utilisateur connecté) consulte ses propres demandes.
-- Aucune politique publique ici : l'accès par jeton (signataire non
-- authentifié) passe exclusivement par la clé service_role côté serveur,
-- dans une route dédiée qui vérifie le jeton avant toute lecture/écriture.
create policy "signature_requests_owner_all" on public.signature_requests
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
