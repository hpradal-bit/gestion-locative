-- Optimisation des politiques RLS : auth.uid() est ré-évalué à chaque ligne
-- par le planificateur Postgres. L'enrober dans (select auth.uid()) permet
-- au plan de l'évaluer une seule fois par requête (recommandation Supabase).
-- Le comportement des politiques est strictement identique.

drop policy "properties_owner_all" on public.properties;
create policy "properties_owner_all" on public.properties
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "tenants_owner_all" on public.tenants;
create policy "tenants_owner_all" on public.tenants
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "loans_owner_all" on public.loans;
create policy "loans_owner_all" on public.loans
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "leases_owner_all" on public.leases;
create policy "leases_owner_all" on public.leases
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "rent_schedules_owner_all" on public.rent_schedules;
create policy "rent_schedules_owner_all" on public.rent_schedules
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "payments_owner_all" on public.payments;
create policy "payments_owner_all" on public.payments
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "expenses_owner_all" on public.expenses;
create policy "expenses_owner_all" on public.expenses
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "owner_profiles_owner_all" on public.owner_profiles;
create policy "owner_profiles_owner_all" on public.owner_profiles
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "works_owner_all" on public.works;
create policy "works_owner_all" on public.works
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "reminders_owner_all" on public.reminders;
create policy "reminders_owner_all" on public.reminders
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "documents_owner_all" on public.documents;
create policy "documents_owner_all" on public.documents
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "documents_storage_owner_select" on storage.objects;
create policy "documents_storage_owner_select" on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy "documents_storage_owner_insert" on storage.objects;
create policy "documents_storage_owner_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy "documents_storage_owner_delete" on storage.objects;
create policy "documents_storage_owner_delete" on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
