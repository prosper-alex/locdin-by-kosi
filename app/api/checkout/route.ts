import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStore } from "@/lib/store";
import { checkoutSchema } from "@/lib/validation";
import { priceCart } from "@/lib/pricing";
import { isInternational } from "@/lib/international";
import { assertSameOrigin, smallJson } from "@/lib/request";
import { serviceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { verifyCheckoutCaptcha } from "@/lib/captcha";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = checkoutSchema.safeParse(await smallJson(request));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Please complete your contact, delivery, and consent details.",
        },
        { status: 400 },
      );
    const input = parsed.data;
    const store = await getStore();
    const destination = store.destinations.find(
      (d) => d.code === input.country,
    );
    if (destination?.postalRequired && !input.postalCode.trim())
      throw new Error("A postal code is required for this destination.");
    const quote = priceCart(
      input.lines,
      input.country,
      store.products,
      store.destinations,
      store.preview,
    );
    const jar = await cookies();
    if (store.preview) {
      // No customer details stored and no payment/order created in this demonstrator.
      jar.set(
        "locdin_preview",
        JSON.stringify({
          total: quote.total,
          country: input.country,
          count: quote.items.reduce((n, i) => n + i.quantity, 0),
        }),
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/order",
          maxAge: 3600,
        },
      );
      return NextResponse.json({ url: "/order/confirmation", external: false });
    }
    if (
      process.env.LIVE_CHECKOUT_ENABLED !== "true" ||
      process.env.COMMERCE_POLICIES_APPROVED !== "true"
    )
      throw new Error(
        "Online payment is not available yet. Please request a quote instead.",
      );
    if (
      isInternational(input.country) &&
      process.env.INTERNATIONAL_PAYMENTS_ENABLED !== "true"
    )
      throw new Error(
        "International payments are being configured. Please request a quote.",
      );
    await verifyCheckoutCaptcha(input.captcha);
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!secret || !siteUrl?.startsWith("https://"))
      throw new Error("Secure payment is not configured yet.");
    const db = serviceClient();
    const token = randomBytes(32).toString("hex");
    const reference = `LK-${input.idempotencyKey}`;
    const accessHash = createHash("sha256").update(token).digest("hex");
    // An existing idempotency key is never replaced or assigned a different buyer/token.
    const { data: order, error } = await db
      .from("orders")
      .insert({
        idempotency_key: input.idempotencyKey,
        access_hash: accessHash,
        email: input.email,
        customer: {
          name: input.name,
          phone: input.phone,
          address: input.address,
          address2: input.address2,
          city: input.city,
          region: input.region,
          postalCode: input.postalCode,
          country: input.country,
        },
        quote: quote as unknown as Json,
        total_minor: quote.total,
        currency: "NGN",
        payment_reference: reference,
      })
      .select("id")
      .single();
    if (error || !order)
      throw new Error(
        "This checkout may already have started. Check your payment status before trying a new checkout.",
      );
    jar.set("locdin_order", `${order.id}.${token}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 86400,
    });
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          amount: String(quote.total),
          currency: "NGN",
          reference,
          callback_url: `${siteUrl}/order/confirmation`,
        }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      },
    );
    const body = await response.json();
    if (
      !response.ok ||
      !body.status ||
      typeof body.data?.authorization_url !== "string" ||
      new URL(body.data.authorization_url).hostname !== "checkout.paystack.com"
    )
      throw new Error(
        "Payment could not be started. No payment has been confirmed; check your order status before retrying.",
      );
    return NextResponse.json({
      url: body.data.authorization_url,
      external: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be started.",
      },
      { status: 400 },
    );
  }
}
