import "server-only";
import { previewProducts } from "@/data/catalogue";
import { previewDestinations } from "./international";
import type { Product, Destination } from "./types";
import { serviceClient } from "./supabase/server";

export const previewMode = process.env.NEXT_PUBLIC_STORE_MODE !== "live";
export async function getStore(): Promise<{
  products: Product[];
  destinations: Destination[];
  preview: boolean;
}> {
  if (previewMode && process.env.STORE_DATA_SOURCE !== "supabase")
    return {
      products: previewProducts,
      destinations: previewDestinations,
      preview: true,
    };
  const db = serviceClient();
  const [products, variants, destinations] = await Promise.all([
    db.from("products").select("*").eq("published", true),
    db.from("variants").select("*"),
    previewMode
      ? db.from("shipping_destinations").select("*")
      : db.from("shipping_destinations").select("*").eq("approved", true),
  ]);
  if (products.error || variants.error || destinations.error)
    throw new Error(
      "The store is temporarily unavailable. Please try again shortly.",
    );
  return {
    products: products.data.map((p) => ({
      ...(p.content as Omit<
        Product,
        "id" | "slug" | "name" | "approved" | "variants"
      >),
      id: p.id,
      slug: p.slug,
      name: p.name,
      approved: p.approved,
      variants: variants.data
        .filter((v) => v.product_id === p.id)
        .map((v) => ({
          id: v.id,
          length: v.length,
          colour: v.colour,
          priceMinor: v.price_minor,
          available: v.available,
        })),
    })),
    destinations: destinations.data.map((d) => ({
      code: d.code,
      name: d.name,
      regionLabel: d.region_label,
      postalRequired: d.postal_required,
      rateMinor: d.rate_minor,
      transit: d.transit,
      approved: d.approved,
    })),
    preview: previewMode,
  };
}
