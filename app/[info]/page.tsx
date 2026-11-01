import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
const pages: Record<
  string,
  {
    title: string;
    heading: string;
    intro: string;
    sections: { title: string; body: string }[];
  }
> = {
  about: {
    title: "Our story",
    heading: "Rooted in craft. Made for you.",
    intro:
      "Loc’din by Kosi is a handmade loc-extension brand built around a simple idea: your hair should leave room for your individuality.",
    sections: [
      {
        title: "The beauty is in the details.",
        body: "From a traditional finish to a softer texture or a curl at the end, each style offers a different way to express yourself. We care about the small choices that make your locs feel personal.",
      },
      {
        title: "Your vision has a place here.",
        body: "Looking for a particular length, colour or finish? Our custom-order process begins with your idea and a conversation about what is possible, followed by a quote before you commit.",
      },
      {
        title: "From Nigeria, beyond borders.",
        body: "We serve Nigerian and international customers. Destination-specific shipping and an explicit checkout currency help you understand your order before paying.",
      },
    ],
  },
  care: {
    title: "Loc care",
    heading: "A little care. A lasting feeling.",
    intro:
      "The right routine depends on your extension material, how your locs are installed, and your scalp. Start with guidance from your stylist.",
    sections: [
      {
        title: "Know your material.",
        body: "Confirm whether your extensions are synthetic or human hair before choosing products, heat or washing methods. Never assume all loc styles respond to the same treatment.",
      },
      {
        title: "Keep your routine gentle.",
        body: "Avoid pulling or tension at the roots, and ask your stylist how to clean and dry your specific installation. Stop any product or practice that causes irritation.",
      },
      {
        title: "Ask before experimenting.",
        body: "For advice about heat, colour changes, swimming or styling products, share your exact loc style and material with the studio or your qualified stylist first.",
      },
    ],
  },
  contact: {
    title: "Contact",
    heading: "Let’s talk locs.",
    intro:
      "Have a style in mind, need help choosing, or want to check delivery to your country? Start with a custom enquiry and tell us a little about what you need.",
    sections: [
      {
        title: "Something personal?",
        body: "Use the custom-order form to share your preferred style, length, colour, loc count and destination. You can also attach a reference image.",
      },
      {
        title: "An existing order?",
        body: "Keep your order reference handy and use the studio’s verified contact details once the shop opens. Business email, telephone and support hours are awaiting confirmation; we won’t publish invented contact information.",
      },
    ],
  },
};
const faqs = [
  [
    "How many locs are in a bundle?",
    "Each product page states its bundle size. In the preview catalogue, a bundle contains 20 locs. The quantity control selects bundles; it does not select individual locs. Final bundle specifications will be confirmed before launch.",
  ],
  [
    "Can I choose my length and colour?",
    "Yes. Choose an available combination on the product page. For a colour, thickness or finish outside the listed options, send a custom-order enquiry.",
  ],
  [
    "Do you deliver internationally?",
    "International checkout is part of the store. Choose your delivery country to see the applicable shipping option. Destinations and rates in this preview are illustrative and must be confirmed before live orders open. For an unlisted country, request a shipping quote.",
  ],
  [
    "Which currency will I pay in?",
    "NGN is the base checkout currency. Other display currencies in this preview are illustrative estimates, not live exchange rates. Your payment provider or bank may convert the NGN charge and apply its own fees.",
  ],
  [
    "Are customs duties included?",
    "The preview does not calculate customs duties or import taxes. Depending on the final shipping terms and your destination, these may be collected by customs or the carrier. Reviewed terms will be available before live purchases are enabled.",
  ],
  [
    "How long will my locs take?",
    "Production and delivery are separate. Made-to-order locs need time to be crafted, followed by transit to your destination. The preview shows sample estimates; confirmed timing will be shown before live checkout.",
  ],
  [
    "Can I change or return an order?",
    "Return, cancellation and custom-order terms are awaiting business review. Read the published policy before placing a real order; the preview does not accept payments.",
  ],
];
export async function generateMetadata({
  params,
}: {
  params: Promise<{ info: string }>;
}): Promise<Metadata> {
  const { info } = await params;
  return {
    title:
      info === "faq"
        ? "Frequently asked questions"
        : pages[info]?.title || "Not found",
    alternates: { canonical: `/${info}` },
  };
}
export default async function InfoPage({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  if (info === "faq")
    return (
      <div className="container editorial-page">
        <h1>
          A little clarity.
          <br />
          <em>A lot more confidence.</em>
        </h1>
        <p className="lede">
          The things you might be wondering before getting loc’d.
        </p>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <Link
          className="button button-outline"
          style={{ marginTop: 35 }}
          href="/contact"
        >
          Still have a question?
        </Link>
      </div>
    );
  const page = pages[info];
  if (!page) notFound();
  return (
    <article className="container editorial-page">
      <h1>{page.heading}</h1>
      <p className="lede">{page.intro}</p>
      {info === "about" && (
        <div className="editorial-image">
          <Image
            src="/images/craft.webp"
            alt="Illustrative close-up of loc texture and copper hair accessories"
            fill
            sizes="(max-width: 760px) 100vw, 900px"
          />
        </div>
      )}
      <div className="prose">
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <Link className="button" href="/custom-order">
          Start a conversation
        </Link>
      </div>
    </article>
  );
}
