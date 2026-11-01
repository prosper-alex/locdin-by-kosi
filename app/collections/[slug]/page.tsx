import { redirect, notFound } from "next/navigation";
import { collections } from "@/data/catalogue";
export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!collections.some((c) => c.slug === slug)) notFound();
  redirect(`/shop?collection=${encodeURIComponent(slug)}`);
}
