"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Globe2,
  Minus,
  Plus,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/international";
import { useStore } from "./store-provider";
export function ProductDetail({ product }: { product: Product }) {
  const { currency, add, preview } = useStore();
  const [length, setLength] = useState<number | null>(null);
  const [colour, setColour] = useState("Natural black");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const variant = product.variants.find(
    (v) => v.length === length && v.colour === colour,
  );
  const lengths = [...new Set(product.variants.map((v) => v.length))];
  const colours = [...new Set(product.variants.map((v) => v.colour))];
  function addToBag() {
    if (!variant?.available) {
      setError("Choose an available length and colour to add your locs.");
      return;
    }
    add(variant.id, quantity);
    setAdded(true);
    setError("");
  }
  return (
    <div className="container product-page">
      <Link href="/shop" className="back-link">
        <ArrowLeft size={15} /> Back to the collection
      </Link>
      <div className="product-detail-grid">
        <div className="detail-photograph">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          {preview && (
            <span className="image-label">Illustrative product image</span>
          )}
        </div>
        <div className="detail-copy">
          <p className="detail-collection">{product.detail}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">
            {currency !== "NGN" ? "Approx. " : !variant ? "From " : ""}
            {money(
              variant?.priceMinor ||
                Math.min(...product.variants.map((v) => v.priceMinor)),
              currency,
            )}{" "}
            <span>/ bundle of {product.locsPerBundle}</span>
          </p>
          <p className="detail-description">{product.description}</p>
          <fieldset className="option-group">
            <legend>
              Length{" "}
              <span>{length ? `${length} inches` : "Choose your length"}</span>
            </legend>
            <div className="length-options">
              {lengths.map((l) => (
                <button
                  type="button"
                  aria-pressed={length === l}
                  onClick={() => {
                    setLength(l);
                    setAdded(false);
                    setError("");
                  }}
                  key={l}
                >
                  {l}″
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="option-group">
            <legend>
              Colour <span>{colour}</span>
            </legend>
            <div className="colour-options">
              {colours.map((c) => {
                const unavailable =
                  length !== null &&
                  !product.variants.some(
                    (v) => v.length === length && v.colour === c && v.available,
                  );
                return (
                  <button
                    type="button"
                    key={c}
                    aria-pressed={colour === c}
                    disabled={unavailable}
                    onClick={() => {
                      setColour(c);
                      setAdded(false);
                    }}
                  >
                    <span
                      className={
                        c === "Natural black"
                          ? "swatch swatch-black"
                          : "swatch swatch-brown"
                      }
                    />
                    {c}
                    {unavailable ? " — unavailable" : ""}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="purchase-row">
            <div className="quantity-control">
              <button
                type="button"
                aria-label="Decrease bundle quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={14} />
              </button>
              <output aria-label="Bundle quantity">{quantity}</output>
              <button
                type="button"
                aria-label="Increase bundle quantity"
                disabled={quantity >= 20}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              className="button"
              onClick={addToBag}
              disabled={Boolean(variant && !variant.available)}
            >
              {added ? (
                <>
                  Added to your bag <Check size={18} />
                </>
              ) : (
                <>
                  Add to bag <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {added && (
            <Link className="text-link added-link" href="/cart">
              View your bag & continue <ArrowRightIcon />
            </Link>
          )}
          <p className="small muted">
            {product.locsPerBundle} locs per bundle. Quantity selects bundles,
            not individual locs.
          </p>
          <div className="delivery-inline">
            <Globe2 size={19} />
            <span>
              International delivery available.
              <br />
              <small>
                Shipping calculated for your destination at checkout.
              </small>
            </span>
          </div>
          {currency !== "NGN" && (
            <p className="small muted">
              Display estimate only. Checkout charges are in NGN.
            </p>
          )}
          <div className="product-disclosures">
            <details open>
              <summary>
                The details <Plus size={16} />
              </summary>
              <p>
                {product.material}. {product.locsPerBundle} handmade locs per
                bundle.{" "}
                {preview ? "Sample production estimate: " : "Production: "}
                {product.leadTime}, before shipping. Product specifications and
                sample timing require approval before launch.
              </p>
            </details>
            <details>
              <summary>
                Delivery & international orders <Plus size={16} />
              </summary>
              <p>
                Choose your delivery country at checkout to see the shipping
                cost and transit estimate. Production and transit times are
                separate. Import duties and bank conversion fees may apply.
              </p>
              <Link href="/policies/shipping">Read delivery information</Link>
            </details>
            <details>
              <summary>
                Keeping your locs beautiful <Plus size={16} />
              </summary>
              <p>
                Care needs vary by material and installation method. Ask your
                stylist for a routine suitable for your locs and confirm
                material-specific advice with us.
              </p>
              <Link href="/care">Explore loc care</Link>
            </details>
          </div>
          <Link href="/custom-order" className="text-link">
            Looking for something different? Let’s customise{" "}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={16} />;
}
