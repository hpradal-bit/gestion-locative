-- Jour du mois où le loyer est dû (ex : le 2 de chaque mois), indépendant
-- de la date de début du bail. N'affecte que les échéances générées à
-- partir de maintenant — les échéances déjà émises ne sont jamais
-- réécrites rétroactivement (même règle que pour toute autre correction
-- de bail).
alter table public.leases
  add column if not exists payment_due_day integer not null default 1
    check (payment_due_day between 1 and 31);
