import type { Product } from "@/lib/types";

const variants = (prefix: string, base: number) =>
  [8, 10, 12, 16, 20].flatMap((length, index) =>
    ["Natural black", "Warm brown"].map((colour, colourIndex) => ({
      id: `${prefix}-${length}-${colourIndex ? "brown" : "black"}`,
      length,
      colour,
      priceMinor: base + index * 150000 + colourIndex * 50000,
      available: !(length === 20 && colourIndex === 1),
    })),
  );

// Illustrative development catalogue. The live checkout explicitly rejects these records.
export const previewProducts: Product[] = [
  {
    id: "traditional",
    slug: "traditional-locs",
    name: "Traditional locs",
    collection: "traditional",
    description:
      "A timeless foundation. Beautifully textured, uniform locs with a natural finish, made to feel like you.",
    image: "/images/traditional.webp",
    imageAlt:
      "Illustrative bundle of textured black traditional loc extensions",
    detail: "Defined texture · straight finish",
    material: "Illustrative synthetic hair option",
    locsPerBundle: 20,
    leadTime: "1–2 weeks",
    variants: variants("traditional", 650000),
    approved: false,
  },
  {
    id: "fluffy",
    slug: "fluffy-locs",
    name: "Fluffy locs",
    collection: "fluffy",
    description:
      "A softer silhouette with beautiful volume. Airy, textured locs for an effortlessly expressive look.",
    image: "/images/fluffy.webp",
    imageAlt: "Illustrative soft textured fluffy loc extensions",
    detail: "Soft texture · airy volume",
    material: "Illustrative synthetic hair option",
    locsPerBundle: 20,
    leadTime: "1–2 weeks",
    variants: variants("fluffy", 700000),
    approved: false,
  },
  {
    id: "curly",
    slug: "curly-end-locs",
    name: "Curly-end locs",
    collection: "curly-end",
    description:
      "Structure meets a little freedom. Defined locs flow into soft curls, with movement in every strand.",
    image: "/images/curly.webp",
    imageAlt: "Illustrative black loc extensions with warm copper curly ends",
    detail: "Defined locs · loose curly ends",
    material: "Illustrative synthetic hair option",
    locsPerBundle: 20,
    leadTime: "1–2 weeks",
    variants: variants("curly", 750000),
    approved: false,
  },
  {
    id: "loop",
    slug: "loop-locs",
    name: "Loop locs",
    collection: "loop",
    description:
      "A considered beginning. Pre-looped loc extensions made for a neat, versatile finish.",
    image: "/images/loop.webp",
    imageAlt: "Illustrative bundle of black pre-looped loc extensions",
    detail: "Pre-looped · versatile finish",
    material: "Illustrative synthetic hair option",
    locsPerBundle: 20,
    leadTime: "1–2 weeks",
    variants: variants("loop", 700000),
    approved: false,
  },
];

export const collections = [
  {
    slug: "traditional",
    name: "Traditional",
    description: "The timeless original.",
    image: "/images/traditional.webp",
  },
  {
    slug: "fluffy",
    name: "Fluffy",
    description: "A little softer. A little fuller.",
    image: "/images/fluffy.webp",
  },
  {
    slug: "curly-end",
    name: "Curly-end",
    description: "Texture with a twist.",
    image: "/images/curly.webp",
  },
  {
    slug: "loop",
    name: "Loop",
    description: "Your next beginning.",
    image: "/images/loop.webp",
  },
];
