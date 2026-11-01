import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { ProductDetail } from "@/components/product-detail";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getStore();
  const product = products.find((p) => p.slug === slug);
  return {
    title: product?.name || "Product not found",
    description: product?.description,
    alternates: { canonical: `/products/${slug}` },
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products } = await getStore();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
