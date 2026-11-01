import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowUpRight, Check, Clock3 } from "lucide-react";
import { previewMode } from "@/lib/store";
import { money } from "@/lib/international";
import { findOwnedOrder } from "@/lib/orders";
export const metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Confirmation() {
  const jar = await cookies();
  if (previewMode) {
    let summary: { total: number; count: number; country: string } | null =
      null;
    try {
      summary = JSON.parse(jar.get("locdin_preview")?.value || "null");
    } catch {
      /* Invalid preview state is harmless. */
    }
    return (
      <div className="container">
        <div className="success-panel">
          <Check size={40} strokeWidth={1} />
          <span className="status-pill">Preview complete</span>
          <h1>
            Looking good.
            <br />
            <em>Feeling loc’d.</em>
          </h1>
          <p>
            You’ve reached the end of the preview journey. No payment was taken
            and no order was placed.
          </p>
          {summary && (
            <div className="quiet-note">
              <p>
                {summary.count} {summary.count === 1 ? "bundle" : "bundles"} ·
                destination {summary.country}
                <br />
                Illustrative total: {money(summary.total)} NGN
              </p>
              <p>
                Real products, shipping rates and payment configuration are
                required before the shop opens.
              </p>
            </div>
          )}
          <Link className="button" href="/shop">
            Back to the collection <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    );
  }
  const data = await findOwnedOrder(jar.get("locdin_order")?.value);
  const paid = data?.payment_status === "paid";
  const total = data?.total_minor;
  return (
    <div className="container">
      <div className="success-panel">
        {paid ? (
          <Check size={40} strokeWidth={1} />
        ) : (
          <Clock3 size={40} strokeWidth={1} />
        )}
        <h1>
          {paid ? "You’re on your way to loc’d." : "Checking your payment."}
        </h1>
        <p>
          {paid
            ? `Payment of ${money(total!)} has been verified. Your locs are a little closer.`
            : "Payment has not been confirmed here. If you completed payment, wait a moment and refresh. Please don’t pay again while verification is pending."}
        </p>
        {!paid && (
          <Link className="button" href="/order/confirmation">
            Refresh order status
          </Link>
        )}
        <Link className="text-link" style={{ margin: 20 }} href="/contact">
          Need a hand? Contact us
        </Link>
      </div>
    </div>
  );
}
