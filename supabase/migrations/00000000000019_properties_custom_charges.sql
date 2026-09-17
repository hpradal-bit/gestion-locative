-- Remplace la case "Autres charges" par une liste de charges annuelles à
-- intitulé libre (ex : "Frais d'expert-comptable" : 492 €) plutôt qu'un
-- unique montant sans nom. other_charges_annual reste en base, recalculé
-- automatiquement comme la somme de ces charges, pour que le reste de
-- l'application (impôts, rentabilité, tableau de bord) continue de
-- fonctionner sans changement.
alter table public.properties
  add column if not exists custom_charges jsonb not null default '[]'::jsonb;

update public.properties
set custom_charges = jsonb_build_array(
  jsonb_build_object('label', 'Autres charges', 'amount', other_charges_annual)
)
where other_charges_annual > 0 and custom_charges = '[]'::jsonb;
