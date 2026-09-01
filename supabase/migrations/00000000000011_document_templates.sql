-- Bibliothèque de modèles de documents avec variables dynamiques
-- ({{nom_locataire}}, {{loyer}}, ...). Le contenu est du texte brut, pas un
-- fichier Word/PDF importé tel quel : la mise en page est reconstruite à la
-- génération (voir lib/templates.ts + features/documents/generated-document.tsx),
-- ce qui évite une dépendance lourde de manipulation de fichiers Office.
create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  category text not null
    check (category in ('bail', 'etat_des_lieux', 'quittance', 'relance', 'autre')),
  name text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists document_templates_user_id_idx on public.document_templates (user_id);

alter table public.document_templates enable row level security;

create policy "document_templates_owner_all" on public.document_templates
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
