import type { CartLine, Destination, Product, Quote } from "./types";

export class CheckoutError extends Error {}
export function priceCart(
  lines: CartLine[],
  country: string,
  products: Product[],
  destinations: Destination[],
  preview: boolean,
): Quote {
  if (!lines.length || lines.length > 50)
    throw new CheckoutError(
      "Your bag is empty or has too many items. Please review it.",
    );
  const destination = destinations.find((d) => d.code === country);
  if (!destination)
    throw new CheckoutError(
      "Shipping to this destination needs a quote. Please contact us before checking out.",
    );
  if (!preview && !destination.approved)
    throw new CheckoutError(
      "Shipping for this destination is not available yet.",
    );
  const seen = new Set<string>();
  const items = lines.map((line) => {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 20 ||
      seen.has(line.variantId)
    )
      throw new CheckoutError("Please review the quantities in your bag.");
    seen.add(line.variantId);
    const product = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant || !variant.available)
      throw new CheckoutError(
        "An item is no longer available. Please update your bag.",
      );
    if (!preview && !product.approved)
      throw new CheckoutError(
        "This product is a preview and cannot be purchased yet.",
      );
    if (line.expectedUnitPrice !== variant.priceMinor)
      throw new CheckoutError(
        "A price has changed. Remove and re-add the item to review the current price.",
      );
    if (!Number.isSafeInteger(variant.priceMinor) || variant.priceMinor <= 0)
      throw new CheckoutError("An item needs a valid price before checkout.");
    return {
      variantId: variant.id,
      name: product.name,
      length: variant.length,
      colour: variant.colour,
      image: product.image,
      quantity: line.quantity,
      unitPrice: variant.priceMinor,
      locsPerBundle: product.locsPerBundle,
      leadTime: product.leadTime,
    };
  });
  if (!Number.isSafeInteger(destination.rateMinor) || destination.rateMinor < 0)
    throw new CheckoutError("A shipping quote is required.");
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const total = subtotal + destination.rateMinor;
  if (!Number.isSafeInteger(total))
    throw new CheckoutError("This order needs a custom quote.");
  return {
    items,
    subtotal,
    shipping: destination.rateMinor,
    total,
    currency: "NGN",
    country,
    transit: destination.transit,
    preview,
  };
}
