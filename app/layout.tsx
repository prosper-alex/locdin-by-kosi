import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getStore } from "@/lib/store";
import "./globals.css";
import "./motion.css";

const serif = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000",
  ),
  title: {
    default: "Loc’din by Kosi — Your locs. Your way.",
    template: "%s | Loc’din by Kosi",
  },
  description:
    "Discover handmade loc extensions, thoughtfully crafted for your individuality. Shop traditional, fluffy, curly-end and loop locs, or create your own.",
  openGraph: {
    type: "website",
    siteName: "Loc’din by Kosi",
    images: [
      {
        url: "/images/hero.webp",
        width: 1024,
        height: 1280,
        alt: "Loc’din by Kosi campaign preview",
      },
    ],
  },
  robots:
    process.env.NEXT_PUBLIC_STORE_MODE === "live"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {/* Extensions such as Grammarly mutate body attributes before hydration.
          Suppress only this element; descendant hydration checks remain active. */}
      <body suppressHydrationWarning>
        <StoreProvider {...store}>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
