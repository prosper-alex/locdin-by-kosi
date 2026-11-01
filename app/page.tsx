import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Hand,
  SlidersHorizontal,
} from "lucide-react";
import { collections } from "@/data/catalogue";
import { getStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
export default async function Home() {
  const { products } = await getStore();
  return (
    <>
      <section className="hero">
        <div className="hero-photograph">
          <Image
            src="/images/hero.webp"
            alt="Illustrative campaign portrait of a woman wearing long textured black locs"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 52vw"
          />
          <div className="hero-photo-caption">
            INDIVIDUALLY CRAFTED. UNMISTAKABLY YOU.
          </div>
        </div>
        <div className="hero-copy">
          <h1>
            Your locs.
            <br />
            Your style.
            <br />
            <em>Your way.</em>
          </h1>
          <p>
            Handmade loc extensions, thoughtfully
            <br className="desktop-break" /> crafted to become part of your
            story.
          </p>
          <div className="hero-actions">
            <Link href="/shop" className="button">
              Find your locs <ArrowUpRight size={18} />
            </Link>
            <Link href="/custom-order" className="text-link">
              Make them your own <ArrowRight size={17} />
            </Link>
          </div>
          <span className="hero-signature">Loc’d in style.</span>
        </div>
      </section>
      <div className="service-strip container">
        <div>
          <Hand size={26} strokeWidth={1.25} />
          <p>
            Made by hand<span>Care in every strand.</span>
          </p>
        </div>
        <div>
          <SlidersHorizontal size={25} strokeWidth={1.25} />
          <p>
            Made for you<span>Your length. Your colour. Your style.</span>
          </p>
        </div>
        <div>
          <Globe2 size={26} strokeWidth={1.25} />
          <p>
            Beyond borders<span>From Nigeria to your corner of the world.</span>
          </p>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <h2>Find your kind of loc’d.</h2>
          <Link className="text-link" href="/shop">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="collection-grid">
          {collections.map((collection) => (
            <Link
              href={`/collections/${collection.slug}`}
              key={collection.slug}
              className="collection"
            >
              <div className="collection-image">
                <Image
                  src={collection.image}
                  alt={`Illustrative ${collection.name.toLowerCase()} loc extensions`}
                  fill
                  sizes="(max-width: 600px) 46vw, 24vw"
                />
              </div>
              <div className="collection-caption">
                <div>
                  <h3>{collection.name}</h3>
                  <p>{collection.description}</p>
                </div>
                <ArrowUpRight size={20} strokeWidth={1.25} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="story-section">
        <div className="story-image">
          <Image
            src="/images/craft.webp"
            alt="Illustrative close-up of handmade loc texture and warm copper tones"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </div>
        <div className="story-copy">
          <h2>
            More than locs.
            <br />
            <em>A little more you.</em>
          </h2>
          <p>
            There’s something personal about the way you wear your hair. The
            texture. The length. The feeling when it’s just right.
          </p>
          <p>
            At Loc’din by Kosi, we make loc extensions by hand, with room for
            your individuality in every detail.
          </p>
          <Link href="/about" className="text-link">
            Meet the craft behind the locs <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <h2>Your next signature.</h2>
          <Link href="/shop" className="text-link">
            Shop all locs <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <p className="collection-footnote">
          Every style starts with you. Choose your length and colour on the
          product page.
        </p>
      </section>
      <section className="custom-banner container">
        <div>
          <h2>A vision all your own?</h2>
          <p>
            A different colour. A particular length. A feeling you can’t quite
            put into words.
            <br /> Let’s create your locs together.
          </p>
        </div>
        <Link className="button button-outline" href="/custom-order">
          Let’s make it personal <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
