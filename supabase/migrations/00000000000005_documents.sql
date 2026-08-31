-- Phase 13 : bibliothèque documentaire, rattachée à n'importe quelle entité
-- (bien, locataire, bail, dépense, travaux, crédit, échéance de loyer pour
-- l'archivage des quittances) via un couple (entity_type, entity_id).
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  entity_type text not null
    check (entity_type in ('property', 'tenant', 'lease', 'expense', 'work', 'loan', 'rent_schedule')),
  entity_id uuid not null,

  document_type text not null default 'autres'
    check (document_type in (
      'facture', 'quittance', 'bail', 'devis', 'assurance', 'taxe_fonciere', 'autres'
    )),
  file_name text not null,
  storage_path text not null,
  size_bytes integer,

  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists documents_entity_idx on public.documents (entity_type, entity_id);

alter table public.documents enable row level security;

create policy "documents_owner_all" on public.documents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Bucket de stockage privé pour les fichiers ; chaque utilisateur ne peut
-- lire/écrire que dans son propre dossier ({user_id}/...).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_storage_owner_select" on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents_storage_owner_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents_storage_owner_delete" on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
