"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  requireAdmin,
  sessionClient,
  supabaseConfigured,
} from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function login(form: FormData) {
  if (!supabaseConfigured())
    redirect("/admin/login?error=Connect+Supabase+to+enable+sign-in");
  const email = z.email().safeParse(form.get("email"));
  const password = z.string().min(8).max(200).safeParse(form.get("password"));
  if (!email.success || !password.success)
    redirect("/admin/login?error=Enter+a+valid+email+and+password");
  const db = await sessionClient();
  const result = await db.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });
  if (result.error)
    redirect(
      "/admin/login?error=We+could+not+sign+you+in.+Check+your+details.",
    );
  let allowed = false;
  try {
    await requireAdmin();
    allowed = true;
  } catch {
    await db.auth.signOut();
  }
  if (!allowed)
    redirect("/admin/login?error=This+account+is+not+an+invited+administrator");
  redirect("/admin/products");
}
export async function logout() {
  const db = await sessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}
const text = (form: FormData, field: string, max = 250) =>
  z.string().trim().min(1).max(max).parse(form.get(field));
export async function saveProduct(form: FormData) {
  const { db, user } = await requireAdmin();
  const id = z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .parse(form.get("id"));
  const slug = z
    .string()
    .regex(/^[a-z0-9-]{1,100}$/)
    .parse(form.get("slug"));
  const existingImage = text(form, "image", 1000);
  let image = existingImage;
  if (!(
    image.startsWith("/images/") ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL &&
      image.startsWith(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`,
      ))
  ))
    throw new Error(
      "Choose a local preview image or an uploaded studio image.",
    );
  const file = form.get("photo");
  if (file instanceof File && file.size) {
    if (file.size > 4 * 1024 * 1024)
      throw new Error("Choose an image below 4 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    let extension = "";
    if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])))
      extension = "jpg";
    else if (
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      extension = "png";
    else if (
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP"
    )
      extension = "webp";
    else throw new Error("Use a JPEG, PNG or WebP image.");
    const path = `${id}/${randomUUID()}.${extension}`;
    const result = await db.storage.from("product-images").upload(path, bytes, {
      contentType: extension === "jpg" ? "image/jpeg" : `image/${extension}`,
      upsert: false,
    });
    if (result.error) throw new Error("The photo could not be uploaded.");
    image = db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }
  const product = {
    id,
    slug,
    name: text(form, "name", 100),
    published: form.get("published") === "on",
    approved: form.get("approved") === "on",
    content: {
      collection: z
        .enum(["traditional", "fluffy", "curly-end", "loop"])
        .parse(form.get("collection")),
      description: text(form, "description", 2000),
      image,
      imageAlt: text(form, "imageAlt"),
      detail: text(form, "detail"),
      material: text(form, "material"),
      leadTime: text(form, "leadTime", 100),
      locsPerBundle: z.coerce
        .number()
        .int()
        .min(1)
        .max(1000)
        .parse(form.get("locsPerBundle")),
    },
  };
  const ids = form.getAll("variantId").map(String);
  const variants = ids.map((variantId, index) => {
    const price = String(form.get(`price-${index}`));
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(price))
      throw new Error(
        "Enter a valid NGN price with at most two decimal places.",
      );
    const [whole, fraction = ""] = price.split(".");
    const priceMinor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return {
      id: z
        .string()
        .regex(/^[a-z0-9-]{1,120}$/)
        .parse(variantId),
      product_id: id,
      length: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .parse(form.get(`length-${index}`)),
      colour: text(form, `colour-${index}`, 100),
      price_minor: z.number().int().positive().parse(priceMinor),
      available: form.get(`available-${index}`) === "on",
    };
  });
  if (!variants.length) throw new Error("At least one variant is required.");
  const result = await db.rpc("save_product", {
    p_product: product as Json,
    p_variants: variants as Json,
  });
  if (result.error)
    throw new Error(
      "The product could not be saved. Check for duplicate slugs or variant options.",
    );
  await db
    .from("audit_events")
    .insert({ actor: user.id, action: "save_product", target: id });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}
export async function updateOrder(form: FormData) {
  const { db, user } = await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const status = z
    .enum([
      "awaiting-production",
      "in-production",
      "ready",
      "shipped",
      "delivered",
    ])
    .parse(form.get("status"));
  const tracking = z.string().trim().max(250).parse(form.get("tracking"));
  const order = await db
    .from("orders")
    .select("payment_status")
    .eq("id", id)
    .single();
  if (order.error || order.data.payment_status !== "paid")
    throw new Error("Only verified paid orders can enter fulfilment.");
  const result = await db
    .from("orders")
    .update({ fulfilment_status: status, tracking })
    .eq("id", id);
  if (result.error) throw new Error("The order could not be updated.");
  await db
    .from("audit_events")
    .insert({ actor: user.id, action: `fulfilment:${status}`, target: id });
  revalidatePath("/admin/orders");
}
export async function updateEnquiry(form: FormData) {
  const { db } = await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const status = z
    .enum(["new", "reviewing", "quoted", "closed"])
    .parse(form.get("status"));
  const result = await db.from("enquiries").update({ status }).eq("id", id);
  if (result.error) throw new Error("The enquiry could not be updated.");
  revalidatePath("/admin/enquiries");
}
export async function updateShipping(form: FormData) {
  const { db, user } = await requireAdmin();
  const code = z
    .string()
    .regex(/^[A-Z]{2}$/)
    .parse(form.get("code"));
  const price = String(form.get("rate"));
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(price))
    throw new Error("Enter a valid NGN shipping rate.");
  const [whole, fraction = ""] = price.split(".");
  const result = await db.from("shipping_destinations").upsert({
    code,
    name: text(form, "name", 100),
    region_label: text(form, "regionLabel", 100),
    postal_required: form.get("postalRequired") === "on",
    rate_minor: Number(whole) * 100 + Number(fraction.padEnd(2, "0")),
    transit: text(form, "transit", 100),
    approved: form.get("approved") === "on",
  });
  if (result.error)
    throw new Error("The shipping destination could not be saved.");
  await db
    .from("audit_events")
    .insert({ actor: user.id, action: "save_shipping", target: code });
  revalidatePath("/", "layout");
}
