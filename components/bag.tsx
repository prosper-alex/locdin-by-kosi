"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { useStore } from "./store-provider";
import { money, isInternational } from "@/lib/international";
export function Bag() {
  const {
    products,
    lines,
    ready,
    currency,
    country,
    setRegion,
    destinations,
    update,
    preview,
  } = useStore();
  const subtotal = lines.reduce(
    (n, l) => n + l.expectedUnitPrice * l.quantity,
    0,
  );
  const destination = destinations.find((d) => d.code === country);
  if (!ready)
    return (
      <div className="container page-space" role="status">
        Opening your bag…
      </div>
    );
  return (
    <div className="container page-space">
      <div className="section-heading">
        <h1>
          Your bag
          <span className="heading-count">
            ({lines.reduce((n, l) => n + l.quantity, 0)})
          </span>
        </h1>
        <Link href="/shop" className="text-link">
          <ArrowLeft size={15} /> Keep exploring
        </Link>
      </div>
      {!lines.length ? (
        <div className="empty-state">
          <ShoppingBag size={40} strokeWidth={1} />
          <h2>Room for your next signature.</h2>
          <p>Your bag is waiting for something that feels like you.</p>
          <Link className="button" href="/shop">
            Find your locs <ArrowUpRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="commerce-grid">
          <div className="bag-items">
            {lines.map((line) => {
              const product = products.find((p) =>
                p.variants.some((v) => v.id === line.variantId),
              );
              const variant = product?.variants.find(
                (v) => v.id === line.variantId,
              );
              if (!product || !variant)
                return (
                  <div key={line.variantId} className="bag-item">
                    <p>This item is no longer available.</p>
                    <button
                      className="text-link"
                      onClick={() => update(line.variantId, 0)}
                    >
                      Remove item
                    </button>
                  </div>
                );
              return (
                <article className="bag-item" key={line.variantId}>
                  <Link
                    className="bag-image"
                    href={`/products/${product.slug}`}
                  >
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="140px"
                    />
                  </Link>
                  <div className="bag-item-details">
                    <h2>
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h2>
                    <p>
                      {variant.length}″ / {variant.colour}
                    </p>
                    <p className="small muted">
                      {product.locsPerBundle} locs per bundle
                    </p>
                    <div className="quantity-control">
                      <button
                        aria-label={`Remove one ${product.name} bundle`}
                        onClick={() =>
                          update(line.variantId, line.quantity - 1)
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <output>{line.quantity}</output>
                      <button
                        aria-label={`Add one ${product.name} bundle`}
                        disabled={line.quantity >= 20}
                        onClick={() =>
                          update(line.variantId, line.quantity + 1)
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    {(!variant.available ||
                      variant.priceMinor !== line.expectedUnitPrice) && (
                      <p className="form-error">
                        This variant changed. Remove it and choose again before
                        checkout.
                      </p>
                    )}
                  </div>
                  <div className="bag-item-end">
                    <button
                      className="icon-button"
                      aria-label={`Remove ${product.name} from bag`}
                      onClick={() => update(line.variantId, 0)}
                    >
                      <X size={17} />
                    </button>
                    <span>
                      {money(line.expectedUnitPrice * line.quantity, currency)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="order-summary">
            <h2>A little closer to loc’d.</h2>
            <label>
              Delivery country
              <select
                value={country}
                onChange={(e) => setRegion(e.target.value, currency)}
              >
                {destinations.map((d) => (
                  <option value={d.code} key={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="summary-lines">
              <div>
                <span>Subtotal</span>
                <span>{money(subtotal, currency)}</span>
              </div>
              <div>
                <span>Shipping{preview ? " estimate" : ""}</span>
                <span>
                  {destination
                    ? money(destination.rateMinor, currency)
                    : "Quote required"}
                </span>
              </div>
              <div className="summary-total">
                <span>Total{currency !== "NGN" ? " estimate" : ""}</span>
                <span>
                  {money(subtotal + (destination?.rateMinor || 0), currency)}
                </span>
              </div>
            </div>
            {currency !== "NGN" && (
              <p className="small">
                Charged in NGN:{" "}
                {money(subtotal + (destination?.rateMinor || 0))}. Display
                conversion is illustrative.
              </p>
            )}
            {isInternational(country) && (
              <p className="small muted">
                International delivery. Import duties may be collected on
                arrival; your bank may apply currency conversion fees.
              </p>
            )}
            <Link href="/checkout" className="button">
              Continue to checkout <ArrowUpRight size={17} />
            </Link>
            <p className="small muted">
              {preview
                ? "Preview checkout only. No payment will be taken."
                : "Final prices and availability are verified before payment."}
            </p>
            <Link className="text-link small" href="/custom-order">
              Need a different destination?
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
