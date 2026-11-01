import { EnquiryForm } from "@/components/enquiry-form";
export const metadata = { title: "Create your custom locs" };
export default function CustomOrder() {
  return (
    <div className="container enquiry-grid">
      <div className="enquiry-intro">
        <h1>
          Dream it.
          <br />
          <em>We’ll loc it.</em>
        </h1>
        <p>
          A colour you’ve been thinking about. A length that feels just right.
          Something completely your own.
        </p>
        <p>
          Tell us what you have in mind. We’ll review the details and help shape
          your custom locs, with a quote before you commit.
        </p>
        <div className="quiet-note">
          <p>From your vision to your doorstep.</p>
          <p>
            We welcome international requests. Include your destination so we
            can account for shipping alongside your custom design. Submitting a
            request does not place an order.
          </p>
        </div>
      </div>
      <EnquiryForm />
    </div>
  );
}
