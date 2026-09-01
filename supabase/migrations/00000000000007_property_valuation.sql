-- Distingue le prix d'achat (déjà existant : purchase_price, figé à
-- l'acquisition) de la valorisation actuelle du bien (estimée, modifiable
-- à tout moment par le propriétaire, indépendante du prix d'achat).
-- Nulle tant qu'elle n'a pas été renseignée : l'UI retombe alors sur
-- purchase_price pour ne jamais afficher de valeur inventée.
alter table public.properties
  add column if not exists current_value numeric,
  add column if not exists current_value_updated_at date;
