"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
function Sort({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="sort-label">
      Sort by
      <select
        aria-label="Sort products"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          router.push(`/shop?${next}`);
        }}
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
export function CatalogueSort(props: { value: string }) {
  return (
    <Suspense fallback={<span>Sort by featured</span>}>
      <Sort {...props} />
    </Suspense>
  );
}
