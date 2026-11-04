-- Keep payment events server-only: RLS has no browser-facing policy by design.
-- Add the foreign-key indexes identified by the database advisor.
create index audit_events_actor_idx on public.audit_events(actor);
create index payment_events_reference_idx on public.payment_events(reference);

-- Public catalogue reads are anonymous. Authenticated administrators need to
-- see drafts too, so give that role one consolidated read policy per table.
drop policy products_public on public.products;
drop policy products_admin on public.products;
create policy products_public on public.products for select to anon using (published);
create policy products_authenticated_read on public.products for select to authenticated
  using (published or exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy products_admin_insert on public.products for insert to authenticated
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy products_admin_update on public.products for update to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy products_admin_delete on public.products for delete to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));

drop policy variants_public on public.variants;
drop policy variants_admin on public.variants;
create policy variants_public on public.variants for select to anon
  using (exists (select 1 from public.products p where p.id = product_id and p.published));
create policy variants_authenticated_read on public.variants for select to authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.published)
    or exists (select 1 from public.admin_memberships where user_id = (select auth.uid()))
  );
create policy variants_admin_insert on public.variants for insert to authenticated
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy variants_admin_update on public.variants for update to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy variants_admin_delete on public.variants for delete to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));

drop policy shipping_public on public.shipping_destinations;
drop policy shipping_admin on public.shipping_destinations;
create policy shipping_public on public.shipping_destinations for select to anon using (approved);
create policy shipping_authenticated_read on public.shipping_destinations for select to authenticated
  using (approved or exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy shipping_admin_insert on public.shipping_destinations for insert to authenticated
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy shipping_admin_update on public.shipping_destinations for update to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy shipping_admin_delete on public.shipping_destinations for delete to authenticated
  using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
