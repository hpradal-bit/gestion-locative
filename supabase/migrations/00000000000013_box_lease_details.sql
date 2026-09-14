-- Champs spécifiques à un box/garage/emplacement de stationnement, pour
-- que les modèles de bail (ex. « Box Garage ») se remplissent seuls.
-- Le numéro de lot est un attribut physique du bien (indépendant du
-- locataire) ; le nombre de clés/badges et la ville de signature sont
-- propres à chaque bail (peuvent varier d'un locataire à l'autre).

alter table public.properties
  add column if not exists lot_number text;

alter table public.leases
  add column if not exists keys_count integer,
  add column if not exists badges_count integer,
  add column if not exists signature_city text;
