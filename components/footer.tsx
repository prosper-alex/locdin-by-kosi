"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RegionSelector } from "./header";
import { useStore } from "./store-provider";
export function Footer() {
  const { preview } = useStore();
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link href="/" className="footer-wordmark">
            LOC’DIN <span>BY KOSI</span>
          </Link>
          <p>
            Rooted in craft.
            <br /> Made for your individuality.
          </p>
          <Link className="text-link" href="/custom-order">
            Let’s create your locs <ArrowUpRight size={16} />
          </Link>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/shop">Shop all locs</Link>
          <Link href="/custom-order">Custom orders</Link>
          <Link href="/about">Our story</Link>
          <Link href="/care">Loc care</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/faq">FAQs</Link>
          <Link href="/policies/shipping">Shipping & delivery</Link>
          <Link href="/policies/returns">Returns & changes</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div className="footer-region">
          <h3>Loc’d in, wherever you are.</h3>
          <p>
            Made in Nigeria.
            <br /> For your corner of the world.
          </p>
          <RegionSelector />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Loc’din by Kosi</span>
        <div>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/terms">Terms</Link>
          <Link href="/admin">Studio access</Link>
        </div>
      </div>
      {preview && (
        <div className="preview-bar">
          Studio preview <span>·</span> Illustrative products, imagery &
          shipping rates. No live payments.
        </div>
      )}
    </footer>
  );
}
