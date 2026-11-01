import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,storage,public to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;
  `);
  await db.exec(
    await readFile("supabase/migrations/20261101032340_storefront.sql", "utf8"),
  );
  await db.exec(`
    insert into auth.users values('${owner}'),('${stranger}');
    insert into public.admin_memberships(user_id) values('${owner}');
    insert into public.products(id,slug,name,content,published) values('visible','visible','Visible','{}',true),('hidden','hidden','Hidden','{}',false);
    insert into public.variants(id,product_id,length,colour,price_minor) values('visible-8','visible',8,'Black',650000);
    insert into public.orders(idempotency_key,access_hash,email,customer,quote,total_minor,currency,payment_reference)
      values(gen_random_uuid(),repeat('a',64),'test@example.com','{}','{}',650000,'NGN','LK-test');
  `);
}, 30000);
afterAll(() => db.close());
async function asRole<T>(role: string, user: string, query: () => Promise<T>) {
  await db.exec(
    `set role ${role}; select set_config('request.jwt.claim.sub','${user}',false);`,
  );
  try {
    return await query();
  } finally {
    await db.exec(
      "reset role; select set_config('request.jwt.claim.sub','',false);",
    );
  }
}
describe("actual PostgreSQL migration and access policies", () => {
  it("lets anonymous shoppers see published products, never drafts", async () => {
    const result = await asRole("anon", "", () =>
      db.query<{ id: string }>("select id from public.products"),
    );
    expect(result.rows).toEqual([{ id: "visible" }]);
  });
  it("denies anonymous order reads and arbitrary enquiry inserts", async () => {
    await expect(
      asRole("anon", "", () => db.query("select * from public.orders")),
    ).rejects.toThrow();
    await expect(
      asRole("anon", "", () =>
        db.query(
          "insert into public.enquiries(name,email,details) values('Someone','x@example.com','{}')",
        ),
      ),
    ).rejects.toThrow();
  });
  it("prevents authenticated non-admins from viewing orders or promoting themselves", async () => {
    const result = await asRole("authenticated", stranger, () =>
      db.query("select * from public.orders"),
    );
    expect(result.rows).toHaveLength(0);
    await expect(
      asRole("authenticated", stranger, () =>
        db.query(
          `insert into public.admin_memberships(user_id) values('${stranger}')`,
        ),
      ),
    ).rejects.toThrow();
    await expect(
      asRole("authenticated", stranger, () =>
        db.query(
          "insert into public.products(id,slug,name,content) values('bad','bad','bad','{}')",
        ),
      ),
    ).rejects.toThrow();
  });
  it("allows the owner to read orders but blocks price/payment mutation", async () => {
    const result = await asRole("authenticated", owner, () =>
      db.query("select payment_reference from public.orders"),
    );
    expect(result.rows).toHaveLength(1);
    await expect(
      asRole("authenticated", owner, () =>
        db.query("update public.orders set payment_status='paid'"),
      ),
    ).rejects.toThrow();
    await expect(
      asRole("authenticated", owner, () =>
        db.query("update public.orders set total_minor=1"),
      ),
    ).rejects.toThrow();
  });
  it("rejects payment RPC access for even an invited admin", async () => {
    await expect(
      asRole("authenticated", owner, () =>
        db.query(
          "select public.complete_payment('event:1','LK-test',650000,'NGN')",
        ),
      ),
    ).rejects.toThrow();
  });
  it("processes duplicate payment callbacks once, preserving one notification", async () => {
    await asRole("service_role", "", async () => {
      await expect(
        db.query(
          "select public.complete_payment('event:bad','LK-test',1,'NGN')",
        ),
      ).rejects.toThrow("Payment mismatch");
      const first = await db.query<{ complete_payment: boolean }>(
        "select public.complete_payment('event:1','LK-test',650000,'NGN')",
      );
      expect(first.rows[0].complete_payment).toBe(true);
      const second = await db.query<{ complete_payment: boolean }>(
        "select public.complete_payment('event:1','LK-test',650000,'NGN')",
      );
      expect(second.rows[0].complete_payment).toBe(false);
      await db.query(
        "select public.complete_payment('event:2','LK-test',650000,'NGN')",
      );
    });
    expect(
      (
        await db.query(
          "select * from public.notification_jobs where kind='order-paid'",
        )
      ).rows,
    ).toHaveLength(1);
  });
  it("makes catalogue and variant edits atomic", async () => {
    const product = {
      id: "atomic",
      slug: "atomic",
      name: "Atomic",
      content: {},
      published: false,
      approved: false,
    };
    const invalid = [
      {
        id: "atomic-v",
        product_id: "atomic",
        length: 8,
        colour: "Black",
        price_minor: -10,
        available: true,
      },
    ];
    await expect(
      asRole("authenticated", owner, () =>
        db.query("select public.save_product($1::jsonb,$2::jsonb)", [
          JSON.stringify(product),
          JSON.stringify(invalid),
        ]),
      ),
    ).rejects.toThrow();
    expect(
      (await db.query("select * from public.products where id='atomic'")).rows,
    ).toHaveLength(0);
  });
  it("keeps enquiry images private while allowing public product photos", async () => {
    await db.exec(
      "insert into storage.objects(bucket_id,name) values('product-images','catalogue.webp'),('enquiry-references','private.webp')",
    );
    const result = await asRole("anon", "", () =>
      db.query<{ name: string }>("select name from storage.objects"),
    );
    expect(result.rows).toEqual([{ name: "catalogue.webp" }]);
    const ownerImages = await asRole("authenticated", owner, () =>
      db.query("select name from storage.objects"),
    );
    expect(ownerImages.rows).toHaveLength(2);
  });
  it("leases notification work atomically and recovers an expired lease", async () => {
    await expect(
      asRole("authenticated", owner, () =>
        db.query("select * from public.claim_notification_job()"),
      ),
    ).rejects.toThrow();
    await asRole("service_role", "", async () => {
      const first = await db.query<{ id: string; attempts: number }>(
        "select * from public.claim_notification_job()",
      );
      expect(first.rows).toHaveLength(1);
      expect(first.rows[0].attempts).toBe(1);
      expect(
        (await db.query("select * from public.claim_notification_job()")).rows,
      ).toHaveLength(0);
      await db.query(
        "update public.notification_jobs set lease_until=now()-interval '1 minute' where id=$1",
        [first.rows[0].id],
      );
      const retry = await db.query<{ id: string; attempts: number }>(
        "select * from public.claim_notification_job()",
      );
      expect(retry.rows[0].id).toBe(first.rows[0].id);
      expect(retry.rows[0].attempts).toBe(2);
    });
  });
  it("loads seed data without granting live sale or shipping approval", async () => {
    await db.exec(await readFile("supabase/seed.sql", "utf8"));
    const products = await db.query<{ approved: boolean }>(
      "select approved from public.products where id='traditional'",
    );
    expect(products.rows).toEqual([{ approved: false }]);
    expect(
      (
        await db.query(
          "select * from public.shipping_destinations where approved=true",
        )
      ).rows,
    ).toHaveLength(0);
  });
});
