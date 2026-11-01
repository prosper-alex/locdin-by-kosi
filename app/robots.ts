import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow:
        process.env.NEXT_PUBLIC_STORE_MODE === "live"
          ? ["/admin", "/cart", "/checkout", "/order", "/api", "/policies"]
          : ["/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000"}/sitemap.xml`,
  };
}
