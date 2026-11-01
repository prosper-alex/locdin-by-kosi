import { writeFile } from "node:fs/promises";
import { previewProducts } from "../data/catalogue.ts";
import { previewDestinations } from "../lib/international.ts";

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statements = [
  "-- ILLUSTRATIVE DEVELOPMENT DATA ONLY. Never approved for live sale automatically.",
  "begin;",
];
for (const product of previewProducts) {
  const { id, slug, name, variants, approved, ...content } = product;
  if (approved) throw new Error("Development seeds must remain unapproved.");
  statements.push(
    `insert into public.products(id,slug,name,content,published,approved) values(${sqlString(id)},${sqlString(slug)},${sqlString(name)},${sqlString(JSON.stringify(content))}::jsonb,true,false) on conflict(id) do nothing;`,
  );
  for (const variant of variants)
    statements.push(
      `insert into public.variants(id,product_id,length,colour,price_minor,available) values(${sqlString(variant.id)},${sqlString(id)},${variant.length},${sqlString(variant.colour)},${variant.priceMinor},${variant.available}) on conflict(id) do nothing;`,
    );
}
for (const d of previewDestinations)
  statements.push(
    `insert into public.shipping_destinations(code,name,region_label,postal_required,rate_minor,transit,approved) values(${sqlString(d.code)},${sqlString(d.name)},${sqlString(d.regionLabel)},${d.postalRequired},${d.rateMinor},${sqlString(d.transit)},false) on conflict(code) do nothing;`,
  );
statements.push("commit;", "");
await writeFile(
  new URL("../supabase/seed.sql", import.meta.url),
  statements.join("\n"),
);
console.log(
  "Prepared supabase/seed.sql; all sale and shipping approvals remain false.",
);
