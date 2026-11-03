"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Globe2,
  Menu,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "./drawer";
import { useStore } from "./store-provider";
import { currencies } from "@/lib/international";
import type { Currency } from "@/lib/types";

const links = [
  { href: "/", name: "Home" },
  { href: "/shop", name: "Shop" },
  { href: "/about", name: "Our story" },
  { href: "/custom-order", name: "Custom locs" },
];
export function RegionSelector({ compact = false }: { compact?: boolean }) {
  const { country, currency, setRegion, destinations, preview } = useStore();
  const [open, setOpen] = useState(false);
  const [draftCountry, setDraftCountry] = useState(country);
  const [draftCurrency, setDraftCurrency] = useState<Currency>(currency);
  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraftCountry(country);
          setDraftCurrency(currency);
        }
        setOpen(next);
      }}
      trigger={
        <button
          className={`region-button ${compact ? "compact" : ""}`}
          aria-label="Choose delivery country and display currency"
        >
          <Globe2 size={14} />
          <span>
            {compact
              ? country
              : destinations.find((d) => d.code === country)?.name ||
                country}{" "}
            <span className="region-divider">/</span> {currency}
          </span>
          <ChevronDown size={12} />
        </button>
      }
      title="Make yourself at home."
      description="Choose where your locs are headed and how you would like to see prices."
    >
      <form
        className="stack region-form"
        onSubmit={(event) => {
          event.preventDefault();
          setRegion(draftCountry, draftCurrency);
          setOpen(false);
        }}
      >
        <label>
          Deliver to
          <select
            aria-label="Deliver to"
            value={draftCountry}
            onChange={(event) => setDraftCountry(event.target.value)}
          >
            {destinations.map((d) => (
              <option value={d.code} key={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Display currency
          <select
            aria-label="Display currency"
            value={draftCurrency}
            onChange={(event) =>
              setDraftCurrency(event.target.value as Currency)
            }
          >
            {(preview ? currencies : ["NGN"]).map((c) => (
              <option value={c} key={c}>
                {c}
                {c !== "NGN" ? " — estimate" : " — checkout currency"}
              </option>
            ))}
          </select>
        </label>
        <div className="quiet-note">
          <p>All orders are charged in Nigerian naira (NGN).</p>
          <p>
            {preview
              ? "Other currencies use illustrative preview rates, not live exchange rates. Your bank determines its own conversion and fees."
              : "Your bank may convert your payment into your local currency and apply its own fees."}
          </p>
        </div>
        <button className="button" type="submit">
          Save preferences <ArrowUpRight size={17} />
        </button>
        <Link
          href="/custom-order"
          className="text-link"
          onClick={() => setOpen(false)}
        >
          Don’t see your destination? Ask us
        </Link>
      </form>
    </Drawer>
  );
}
export function Header() {
  const pathname = usePathname();
  const { count } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const elements = [announcementRef.current, headerRef.current].filter(
      (element): element is HTMLElement => element !== null,
    );
    const updateHeight = () => {
      const height = elements.reduce(
        (total, element) => total + element.getBoundingClientRect().height,
        0,
      );
      document.documentElement.style.setProperty(
        "--site-chrome-height",
        `${height}px`,
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-chrome-height");
    };
  }, []);
  return (
    <>
      <div className="announcement" ref={announcementRef}>
        <span>Handmade locs. A world of possibilities.</span>
        <Link href="/policies/shipping">
          International delivery <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header" ref={headerRef}>
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Loc’din by Kosi home">
            <Image src="/brand/mark.jpg" width={54} height={54} alt="" />
            <span>
              LOC’DIN<small>BY KOSI</small>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="header-region">
              <RegionSelector compact />
            </div>
            <Link
              className="icon-button search-link"
              href="/shop?search=1"
              aria-label="Search loc extensions"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <Link
              className="icon-button bag-link"
              href="/cart"
              aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              {count > 0 && <span className="bag-count">{count}</span>}
            </Link>
            <div className="mobile-nav">
              <Drawer
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                trigger={
                  <button className="icon-button" aria-label="Open navigation">
                    <Menu size={24} />
                  </button>
                }
                title="Loc’din by Kosi"
                description="Your locs. Your style. Your way."
              >
                <nav className="mobile-links" aria-label="Mobile navigation">
                  {[
                    ...links,
                    { href: "/faq", name: "FAQs" },
                    { href: "/contact", name: "Contact" },
                  ].map((link) => (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      key={link.href}
                    >
                      {link.name}
                      <ArrowUpRight size={20} />
                    </Link>
                  ))}
                </nav>
              </Drawer>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
