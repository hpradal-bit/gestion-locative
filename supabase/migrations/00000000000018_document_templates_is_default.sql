-- ensureDefaultTemplates() retrouvait le modèle "Box Garage" fourni par
-- l'application en cherchant son nom exact : dès que l'utilisateur le
-- renommait, la recherche échouait et un nouveau modèle "Box Garage" était
-- réinséré à chaque chargement, donnant l'impression que le renommage ne
-- "prenait" jamais. is_default identifie ce modèle indépendamment de son
-- nom, qui reste librement modifiable par l'utilisateur.
alter table public.document_templates
  add column if not exists is_default boolean not null default false;

update public.document_templates
set is_default = true
where category = 'bail' and name = 'Box Garage' and is_default = false;
