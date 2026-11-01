import { describe, it, expect } from "vitest";
import { priceCart } from "./pricing";
import { previewProducts } from "@/data/catalogue";
import { previewDestinations } from "./international";
const line = {
  variantId: "traditional-8-black",
  quantity: 2,
  expectedUnitPrice: 650000,
};
describe("authoritative cart pricing", () => {
  it("charges NGN minor units and separates international shipping", () => {
    const quote = priceCart(
      [line],
      "US",
      previewProducts,
      previewDestinations,
      true,
    );
    expect(quote.currency).toBe("NGN");
    expect(quote.subtotal).toBe(1300000);
    expect(quote.shipping).toBe(3500000);
    expect(quote.total).toBe(4800000);
  });
  it("uses a distinct domestic rate", () =>
    expect(
      priceCart([line], "NG", previewProducts, previewDestinations, true).total,
    ).toBe(1650000));
  it("rejects client price manipulation and stale prices", () =>
    expect(() =>
      priceCart(
        [{ ...line, expectedUnitPrice: 1 }],
        "US",
        previewProducts,
        previewDestinations,
        true,
      ),
    ).toThrow("price has changed"));
  it("blocks unlisted countries instead of assuming free delivery", () =>
    expect(() =>
      priceCart([line], "JP", previewProducts, previewDestinations, true),
    ).toThrow("quote"));
  it("blocks illustrative shipping in live mode", () =>
    expect(() =>
      priceCart([line], "NG", previewProducts, previewDestinations, false),
    ).toThrow("Shipping"));
  it("blocks sample products even when a destination is approved", () =>
    expect(() =>
      priceCart(
        [line],
        "NG",
        previewProducts,
        previewDestinations.map((d) => ({ ...d, approved: true })),
        false,
      ),
    ).toThrow("preview"));
  it("rejects unavailable combinations", () =>
    expect(() =>
      priceCart(
        [
          {
            variantId: "traditional-20-brown",
            quantity: 1,
            expectedUnitPrice: 1300000,
          },
        ],
        "US",
        previewProducts,
        previewDestinations,
        true,
      ),
    ).toThrow("available"));
  it("rejects duplicate variants and invalid quantities", () => {
    expect(() =>
      priceCart([line, line], "NG", previewProducts, previewDestinations, true),
    ).toThrow("quantities");
    expect(() =>
      priceCart(
        [{ ...line, quantity: 1.5 }],
        "NG",
        previewProducts,
        previewDestinations,
        true,
      ),
    ).toThrow("quantities");
  });
  it("permits zero shipping only when an explicit rate says so", () =>
    expect(
      priceCart(
        [line],
        "NG",
        previewProducts,
        previewDestinations.map((d) => ({ ...d, rateMinor: 0 })),
        true,
      ).shipping,
    ).toBe(0));
});
