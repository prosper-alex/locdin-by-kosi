"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/international";
import { useStore } from "./store-provider";
export function ProductCard({ product }: { product: Product }) {
  const { currency } = useStore();
  const price = Math.min(...product.variants.map((v) => v.priceMinor));
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 600px) 48vw, (max-width: 1000px) 45vw, 24vw"
        />
        <span className="product-image-action" aria-hidden="true">
          <ArrowUpRight size={20} strokeWidth={1.5} />
        </span>
      </Link>
      <div className="product-card-info">
        <div>
          <h3>
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p>{product.detail}</p>
        </div>
        <Link
          className="product-arrow"
          href={`/products/${product.slug}`}
          aria-label={`Choose ${product.name}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="product-price">
        {currency !== "NGN" ? "Approx. " : "From "}
        {money(price, currency)} <span>/ {product.locsPerBundle} locs</span>
      </p>
    </article>
  );
}
