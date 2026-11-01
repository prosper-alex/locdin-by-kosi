import { notFound } from "next/navigation";
import Link from "next/link";
const policies: Record<
  string,
  { title: string; paragraphs: [string, string][] }
> = {
  shipping: {
    title: "Shipping & delivery",
    paragraphs: [
      [
        "Local and international",
        "The store is designed for Nigerian and international orders. Supported destinations and delivery costs will be shown at checkout. Current preview destinations, rates and transit estimates are illustrative, not shipping offers.",
      ],
      [
        "Production comes first",
        "Made-to-order items have a production period before dispatch. A transit estimate begins after dispatch and is separate from the production period. Confirmed timings will be shown with the final catalogue.",
      ],
      [
        "Currency and import charges",
        "NGN is the checkout currency. Your bank may convert the charge and apply fees. Import duties, taxes and carrier charges depend on your destination and the final agreed shipping terms. The business must confirm how these are handled before live checkout.",
      ],
      [
        "Your destination",
        "Use a complete delivery address and telephone number with country code. If your destination is not listed, request a quote rather than selecting a different country.",
      ],
    ],
  },
  returns: {
    title: "Returns & order changes",
    paragraphs: [
      [
        "Before placing an order",
        "The business is reviewing its cancellation, return, refund and custom-order terms. No binding final-sale or refund promise is made by this preview.",
      ],
      [
        "Custom work",
        "A custom enquiry is a request for a quotation. It is not a paid order or an agreement to start production. Final specifications and relevant terms must be agreed before payment.",
      ],
      [
        "If something needs attention",
        "Keep your order reference and contact the studio through its verified support channel once available. The final policy will explain the process for damaged, incorrect or otherwise affected orders.",
      ],
    ],
  },
  privacy: {
    title: "Privacy information",
    paragraphs: [
      [
        "Preview data",
        "The bag and delivery/display preferences are stored in your browser. Preview checkout does not save personal contact or address data to a database; a temporary cookie records only an illustrative total, destination and bundle count. Preview enquiry submissions are validated but are not stored or sent.",
      ],
      [
        "When connected",
        "Live checkout and enquiries will collect the contact, address and preference information needed to fulfil the request. Payment is handled by the configured payment provider. Reference uploads are intended for private studio review.",
      ],
      [
        "Before launch",
        "The final privacy notice must identify the responsible business, contact details, processors, retention periods, customer rights and applicable international data handling. This draft requires review before live collection opens.",
      ],
    ],
  },
  terms: {
    title: "Store terms",
    paragraphs: [
      [
        "A preview, clearly",
        "This site currently demonstrates the intended shopping experience. Sample products, generated imagery, rates and production estimates require approval. Completing preview checkout does not create an order or take a payment.",
      ],
      [
        "Product and payment information",
        "Live orders require approved specifications, clear bundle quantities and server-verified NGN totals. Any additional display currency must be identified as an estimate unless actual charging in that currency is configured.",
      ],
      [
        "Launch review",
        "The business must approve its identity, order acceptance rules, delivery terms, cancellation/refund terms and applicable consumer provisions before the store accepts real purchases.",
      ],
    ],
  },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  return {
    title: policies[policy]?.title || "Not found",
    robots: { index: false, follow: true },
  };
}
export default async function Policy({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const content = policies[policy];
  if (!content) notFound();
  return (
    <article className="container editorial-page">
      <div className="policy-note">
        Draft information · awaiting business review before live orders.
      </div>
      <h1>{content.title}</h1>
      <div className="prose">
        {content.paragraphs.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <p style={{ marginTop: 30 }}>
          Need help? <Link href="/contact">Get in touch with the studio.</Link>
        </p>
      </div>
    </article>
  );
}
