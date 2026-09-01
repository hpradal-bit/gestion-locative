-- Paramètres fiscaux : un TMI global par propriétaire (les prélèvements
-- sociaux et l'IR dépendent de la situation personnelle, pas du bien), et
-- un régime fiscal + amortissement propres à chaque bien (le régime peut
-- différer d'un bien à l'autre : vide vs meublé, réel vs micro).
alter table public.owner_profiles
  add column if not exists tmi_rate numeric not null default 0.30,
  add column if not exists social_charges_applicable boolean not null default true;

alter table public.properties
  add column if not exists tax_regime text
    check (tax_regime in ('micro_foncier', 'reel_foncier', 'lmnp_micro_bic', 'lmnp_reel')),
  -- Amortissement annuel estimé (LMNP réel uniquement) : saisi directement
  -- par le propriétaire plutôt que recalculé à partir d'une ventilation
  -- terrain/bâti/mobilier — cette ventilation relève de l'expert-comptable.
  add column if not exists annual_amortization numeric;
