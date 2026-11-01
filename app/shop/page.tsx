import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { getStore } from "@/lib/store";
import { collections } from "@/data/catalogue";
import { ProductCard } from "@/components/product-card";
import { CatalogueSort } from "@/components/catalogue-sort";
export const metadata: Metadata = {
  title: "Shop handmade loc extensions",
  alternates: { canonical: "/shop" },
};
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    collection?: string;
    sort?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const { products, preview } = await getStore();
  const query = (params.q || "").slice(0, 100);
  let filtered = products.filter(
    (p) =>
      (!params.collection || p.collection === params.collection) &&
      (!query ||
        `${p.name} ${p.description} ${p.detail}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  if (params.sort === "price-asc" || params.sort === "price-desc")
    filtered = [...filtered].sort(
      (a, b) =>
        (Math.min(...a.variants.map((v) => v.priceMinor)) -
          Math.min(...b.variants.map((v) => v.priceMinor))) *
        (params.sort === "price-desc" ? -1 : 1),
    );
  const makeUrl = (collection: string) =>
    `/shop?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(collection ? { collection } : {}), ...(params.sort ? { sort: params.sort } : {}) })}`;
  return (
    <div className="container catalogue-page">
      <div className="page-intro">
        <h1>
          A style that feels
          <br />
          <em>like you.</em>
        </h1>
        <p>
          Explore the textures. Find your finish.
          <br />
          Make your next chapter a loc’d one.
        </p>
      </div>
      <div className="catalogue-tools">
        <nav className="collection-tabs" aria-label="Filter by collection">
          <Link
            href={makeUrl("")}
            aria-current={!params.collection ? "page" : undefined}
          >
            All locs
          </Link>
          {collections.map((c) => (
            <Link
              href={makeUrl(c.slug)}
              aria-current={params.collection === c.slug ? "page" : undefined}
              key={c.slug}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <form action="/shop" className="catalogue-search">
          <Search size={17} />
          <input
            aria-label="Search products"
            name="q"
            placeholder="Find your locs"
            defaultValue={query}
            autoFocus={params.search === "1"}
          />
          {params.collection && (
            <input type="hidden" name="collection" value={params.collection} />
          )}
          <button
            type="submit"
            className="icon-button"
            aria-label="Submit product search"
          >
            <ArrowUpRight size={18} />
          </button>
        </form>
      </div>
      <div className="catalogue-meta">
        <span>
          {filtered.length} {filtered.length === 1 ? "style" : "styles"}
          {query && ` for “${query}”`}
          {preview && " · preview collection"}
        </span>
        <CatalogueSort value={params.sort || "featured"} />
      </div>
      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No locs found just yet.</h2>
          <p>Try another search, or let’s create something personal.</p>
          <Link className="button" href="/shop">
            See all styles <ArrowUpRight size={17} />
          </Link>
          <Link href="/custom-order" className="text-link">
            Ask about a custom style
          </Link>
        </div>
      )}
      <div className="shop-custom">
        <h2>Not quite what you imagined?</h2>
        <Link className="text-link" href="/custom-order">
          Make it your own <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
