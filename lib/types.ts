export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type Variant = {
  id: string;
  length: number;
  colour: string;
  priceMinor: number;
  available: boolean;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  description: string;
  image: string;
  imageAlt: string;
  detail: string;
  material: string;
  locsPerBundle: number;
  leadTime: string;
  variants: Variant[];
  approved: boolean;
};
export type CartLine = {
  variantId: string;
  quantity: number;
  expectedUnitPrice: number;
};
export type Destination = {
  code: string;
  name: string;
  regionLabel: string;
  postalRequired: boolean;
  rateMinor: number;
  transit: string;
  approved: boolean;
};
export type Quote = {
  items: {
    variantId: string;
    name: string;
    length: number;
    colour: string;
    image: string;
    quantity: number;
    unitPrice: number;
    locsPerBundle: number;
    leadTime: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: "NGN";
  country: string;
  transit: string;
  preview: boolean;
};
