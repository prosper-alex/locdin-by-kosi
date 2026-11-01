import type { MetadataRoute } from "next";
import { getStore } from "@/lib/store";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
  const { products } = await getStore();
  return [
    "",
    "/shop",
    "/about",
    "/faq",
    "/care",
    "/contact",
    "/custom-order",
    ...products.map((p) => `/products/${p.slug}`),
  ].map((path) => ({ url: `${base}${path}` }));
}
