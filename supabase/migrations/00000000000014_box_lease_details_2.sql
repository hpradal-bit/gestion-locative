-- Complète les champs box/garage : chaque information entre crochets du
-- modèle « Box Garage » doit correspondre à un vrai champ de l'application.

alter table public.tenants
  add column if not exists birth_place text;

alter table public.properties
  add column if not exists building_level text,
  add column if not exists equipment text,
  add column if not exists special_rule text;

alter table public.leases
  add column if not exists condition_at_handover text,
  add column if not exists authorized_use text,
  add column if not exists payment_method text,
  add column if not exists charges_detail text,
  add column if not exists deposit_payment_method text,
  add column if not exists sale_clause_reserve text;
