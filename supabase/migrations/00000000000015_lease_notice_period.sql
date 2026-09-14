-- Durée de préavis (en mois) pour résilier le bail, modifiable par bail
-- au lieu d'être figée dans le texte du contrat.

alter table public.leases
  add column if not exists notice_period_months integer not null default 2
    check (notice_period_months >= 0);
