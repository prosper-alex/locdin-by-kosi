-- Local schema preparation only. Apply to a reviewed Supabase project before enabling live mode.
begin;

create table public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.products (
  id text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,100}$'),
  name text not null check (length(name) between 1 and 100),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  published boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.variants (
  id text primary key check (id ~ '^[a-z0-9-]{1,120}$'),
  product_id text not null references public.products(id) on delete cascade,
  length integer not null check (length between 1 and 100),
  colour text not null check (char_length(colour) between 1 and 100),
  price_minor bigint not null check (price_minor > 0 and price_minor <= 9999999999),
  available boolean not null default false,
  unique (product_id, length, colour)
);
create index variants_product_idx on public.variants(product_id);
create table public.shipping_destinations (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name text not null,
  region_label text not null default 'State / region',
  postal_required boolean not null default true,
  rate_minor bigint not null check (rate_minor >= 0 and rate_minor <= 9999999999),
  transit text not null,
  approved boolean not null default false
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  access_hash text not null check (access_hash ~ '^[a-f0-9]{64}$'),
  email text not null check (char_length(email) <= 254),
  customer jsonb not null,
  quote jsonb not null,
  total_minor bigint not null check (total_minor > 0 and total_minor <= 9007199254740991),
  currency text not null check (currency = 'NGN'),
  payment_reference text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  fulfilment_status text not null default 'awaiting-production' check (fulfilment_status in ('awaiting-production','in-production','ready','shipped','delivered')),
  tracking text,
  created_at timestamptz not null default now()
);
create index orders_created_idx on public.orders(created_at desc);
create table public.payment_events (
  id text primary key,
  reference text not null references public.orders(payment_reference),
  created_at timestamptz not null default now()
);
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  details jsonb not null,
  attachment_path text,
  status text not null default 'new' check (status in ('new','reviewing','quoted','closed')),
  created_at timestamptz not null default now()
);
create index enquiries_created_idx on public.enquiries(created_at desc);
create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  enquiry_id uuid references public.enquiries(id),
  kind text not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  created_at timestamptz not null default now(),
  check ((order_id is null) <> (enquiry_id is null)),
  unique(order_id, kind), unique(enquiry_id, kind)
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null references auth.users(id),
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_memberships enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.shipping_destinations enable row level security;
alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.enquiries enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.audit_events enable row level security;

-- Explicit grants: anonymous writes and customer-data reads are not permitted.
revoke all on public.admin_memberships, public.products, public.variants, public.shipping_destinations,
  public.orders, public.payment_events, public.enquiries, public.notification_jobs, public.audit_events from anon, authenticated;
grant select on public.products, public.variants, public.shipping_destinations to anon, authenticated;
grant select on public.admin_memberships, public.orders, public.enquiries, public.notification_jobs, public.audit_events to authenticated;
grant insert, update, delete on public.products, public.variants, public.shipping_destinations to authenticated;
grant update (fulfilment_status, tracking) on public.orders to authenticated;
grant update (status) on public.enquiries to authenticated;
grant insert on public.audit_events to authenticated;
grant all on public.admin_memberships, public.products, public.variants, public.shipping_destinations,
  public.orders, public.payment_events, public.enquiries, public.notification_jobs, public.audit_events to service_role;

create policy memberships_self on public.admin_memberships for select to authenticated using (user_id = (select auth.uid()));
create policy products_public on public.products for select to anon, authenticated using (published);
create policy variants_public on public.variants for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.published));
create policy shipping_public on public.shipping_destinations for select to anon, authenticated using (approved);

-- Memberships are owner-provisioned; clients can never promote themselves.
create policy products_admin on public.products for all to authenticated
 using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy variants_admin on public.variants for all to authenticated
 using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy shipping_admin on public.shipping_destinations for all to authenticated
 using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy orders_admin_read on public.orders for select to authenticated using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy orders_admin_fulfil on public.orders for update to authenticated
 using (payment_status = 'paid' and exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
 with check (payment_status = 'paid' and exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy enquiries_admin_read on public.enquiries for select to authenticated using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy enquiries_admin_update on public.enquiries for update to authenticated
 using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy jobs_admin_read on public.notification_jobs for select to authenticated using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy audit_admin_read on public.audit_events for select to authenticated using (exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));
create policy audit_admin_insert on public.audit_events for insert to authenticated with check (actor = (select auth.uid()) and exists (select 1 from public.admin_memberships where user_id = (select auth.uid())));

create function public.save_product(p_product jsonb, p_variants jsonb) returns text
language plpgsql security invoker set search_path = '' as $$
declare v jsonb; product_id text := p_product->>'id';
begin
  if not exists (select 1 from public.admin_memberships where user_id = auth.uid()) then raise exception 'Administrator access required'; end if;
  if jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) = 0 or jsonb_array_length(p_variants) > 100 then raise exception 'Invalid variants'; end if;
  insert into public.products (id,slug,name,content,published,approved)
    values (product_id,p_product->>'slug',p_product->>'name',p_product->'content',(p_product->>'published')::boolean,(p_product->>'approved')::boolean)
    on conflict (id) do update set slug=excluded.slug,name=excluded.name,content=excluded.content,published=excluded.published,approved=excluded.approved;
  for v in select * from jsonb_array_elements(p_variants) loop
    if v->>'product_id' <> product_id then raise exception 'Mismatched variant'; end if;
    insert into public.variants (id,product_id,length,colour,price_minor,available)
      values (v->>'id',product_id,(v->>'length')::integer,v->>'colour',(v->>'price_minor')::bigint,(v->>'available')::boolean)
      on conflict (id) do update set length=excluded.length,colour=excluded.colour,price_minor=excluded.price_minor,available=excluded.available
      where public.variants.product_id=excluded.product_id;
  end loop;
  return product_id;
end $$;
revoke all on function public.save_product(jsonb,jsonb) from public, anon;
grant execute on function public.save_product(jsonb,jsonb) to authenticated;

-- Called exclusively by a verified provider webhook through the isolated server client.
-- Invoker rights, explicit grants, and row locking keep duplicates atomic.
create function public.complete_payment(p_event_id text,p_reference text,p_amount bigint,p_currency text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare target public.orders; inserted_event text;
begin
  select * into target from public.orders where payment_reference=p_reference for update;
  if not found or target.total_minor <> p_amount or target.currency <> p_currency then raise exception 'Payment mismatch'; end if;
  insert into public.payment_events(id,reference) values(p_event_id,p_reference) on conflict do nothing returning id into inserted_event;
  if inserted_event is null then return false; end if;
  if target.payment_status = 'paid' or target.payment_status = 'refunded' then return false; end if;
  update public.orders set payment_status='paid' where id=target.id and payment_status in ('pending','failed');
  insert into public.notification_jobs(order_id,kind) values(target.id,'order-paid') on conflict(order_id,kind) do nothing;
  return true;
end $$;
revoke all on function public.complete_payment(text,text,bigint,text) from public, anon, authenticated;
grant execute on function public.complete_payment(text,text,bigint,text) to service_role;

create function public.claim_notification_job() returns setof public.notification_jobs
language sql security invoker set search_path = '' as $$
  update public.notification_jobs set status='processing',attempts=attempts+1,lease_until=now()+interval '90 seconds'
  where id = (
    select id from public.notification_jobs
    where attempts < 8 and next_attempt_at <= now() and
      (status='pending' or (status='processing' and lease_until < now()))
    order by created_at for update skip locked limit 1
  ) returning *;
$$;
revoke all on function public.claim_notification_job() from public,anon,authenticated;
grant execute on function public.claim_notification_job() to service_role;

create function public.queue_enquiry_notification() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.notification_jobs(enquiry_id,kind) values(new.id,'enquiry-received') on conflict(enquiry_id,kind) do nothing;
  return new;
end $$;
revoke all on function public.queue_enquiry_notification() from public, anon, authenticated;
create trigger enquiry_notification after insert on public.enquiries for each row execute function public.queue_enquiry_notification();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('product-images','product-images',true,4194304,array['image/jpeg','image/png','image/webp']),
 ('enquiry-references','enquiry-references',false,4194304,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do nothing;
create policy product_images_public on storage.objects for select to anon,authenticated using (bucket_id='product-images');
create policy product_images_admin_insert on storage.objects for insert to authenticated with check (bucket_id='product-images' and exists(select 1 from public.admin_memberships where user_id=(select auth.uid())));
create policy product_images_admin_update on storage.objects for update to authenticated
 using(bucket_id='product-images' and exists(select 1 from public.admin_memberships where user_id=(select auth.uid())))
 with check(bucket_id='product-images' and exists(select 1 from public.admin_memberships where user_id=(select auth.uid())));
create policy product_images_admin_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and exists(select 1 from public.admin_memberships where user_id=(select auth.uid())));
create policy enquiry_references_admin_read on storage.objects for select to authenticated using(bucket_id='enquiry-references' and exists(select 1 from public.admin_memberships where user_id=(select auth.uid())));
commit;
