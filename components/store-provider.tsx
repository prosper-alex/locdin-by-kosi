"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Currency, Destination, Product } from "@/lib/types";
import { currencies } from "@/lib/international";

type StoreContext = {
  products: Product[];
  destinations: Destination[];
  preview: boolean;
  lines: CartLine[];
  ready: boolean;
  country: string;
  currency: Currency;
  count: number;
  added: string;
  add: (variantId: string, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  clear: () => void;
  setRegion: (country: string, currency: Currency) => void;
};
const Context = createContext<StoreContext | null>(null);
type Action =
  | { type: "replace"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "update"; id: string; quantity: number };
function reducer(lines: CartLine[], action: Action): CartLine[] {
  if (action.type === "replace") return action.lines;
  if (action.type === "update")
    return lines
      .map((l) =>
        l.variantId === action.id
          ? { ...l, quantity: Math.min(20, action.quantity) }
          : l,
      )
      .filter((l) => l.quantity > 0);
  const existing = lines.find((l) => l.variantId === action.line.variantId);
  return existing
    ? lines.map((l) =>
        l.variantId === action.line.variantId
          ? {
              ...action.line,
              quantity: Math.min(20, l.quantity + action.line.quantity),
            }
          : l,
      )
    : [...lines, action.line];
}
export function StoreProvider({
  children,
  products,
  destinations,
  preview,
}: {
  children: ReactNode;
  products: Product[];
  destinations: Destination[];
  preview: boolean;
}) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [country, setCountry] = useState("NG");
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [added, setAdded] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("locdin-bag-v1") || "[]",
        ) as CartLine[];
        if (Array.isArray(saved))
          dispatch({
            type: "replace",
            lines: saved
              .filter(
                (l) =>
                  typeof l?.variantId === "string" &&
                  Number.isInteger(l.quantity) &&
                  l.quantity > 0 &&
                  l.quantity <= 20 &&
                  Number.isSafeInteger(l.expectedUnitPrice),
              )
              .slice(0, 50),
          });
        const region = JSON.parse(
          localStorage.getItem("locdin-region-v1") || "{}",
        ) as { country?: string; currency?: Currency };
        if (destinations.some((d) => d.code === region.country))
          setCountry(region.country!);
        if (
          region.currency &&
          currencies.includes(region.currency) &&
          (preview || region.currency === "NGN")
        )
          setCurrency(region.currency);
      } catch {
        /* A fresh bag is recoverable when browser storage is unavailable. */
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [destinations, preview]);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("locdin-bag-v1", JSON.stringify(lines));
      } catch {
        /* In-memory bag remains usable. */
      }
    }
  }, [lines, ready]);
  useEffect(() => {
    if (added) {
      const timer = setTimeout(() => setAdded(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [added]);
  const add = (variantId: string, quantity = 1) => {
    const product = products.find((p) =>
      p.variants.some((v) => v.id === variantId),
    );
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant?.available) return;
    dispatch({
      type: "add",
      line: { variantId, quantity, expectedUnitPrice: variant.priceMinor },
    });
    setAdded(`${product.name} added to your bag`);
  };
  return (
    <Context.Provider
      value={{
        products,
        destinations,
        preview,
        lines,
        ready,
        country,
        currency,
        added,
        count: lines.reduce((n, l) => n + l.quantity, 0),
        add,
        update: (id, quantity) => dispatch({ type: "update", id, quantity }),
        clear: () => dispatch({ type: "replace", lines: [] }),
        setRegion(code, nextCurrency) {
          setCountry(code);
          setCurrency(preview ? nextCurrency : "NGN");
          try {
            localStorage.setItem(
              "locdin-region-v1",
              JSON.stringify({ country: code, currency: nextCurrency }),
            );
          } catch {
            /* Preferences still apply for this visit. */
          }
        },
      }}
    >
      {children}
      <div role="status" className={`bag-toast ${added ? "is-visible" : ""}`}>
        {added}
      </div>
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider is missing.");
  return store;
}
