import { NextResponse } from "next/server";
import { validSignature, verifiedCharge } from "@/lib/payment";
import { serviceClient } from "@/lib/supabase/server";
import { boundedText } from "@/lib/request";
export async function POST(request: Request) {
  if (
    process.env.NEXT_PUBLIC_STORE_MODE !== "live" ||
    !process.env.PAYSTACK_SECRET_KEY
  )
    return new NextResponse(null, { status: 503 });
  let raw: string;
  try {
    raw = await boundedText(request, 100000);
  } catch {
    return new NextResponse(null, { status: 413 });
  }
  if (
    raw.length > 100000 ||
    !validSignature(
      raw,
      request.headers.get("x-paystack-signature") || "",
      process.env.PAYSTACK_SECRET_KEY,
    )
  )
    return new NextResponse(null, { status: 401 });
  try {
    const event = JSON.parse(raw);
    if (event.event !== "charge.success")
      return NextResponse.json({ received: true });
    if (
      typeof event.data?.reference !== "string" ||
      !Number.isSafeInteger(event.data?.id)
    )
      return new NextResponse(null, { status: 400 });
    const db = serviceClient();
    const { data: order, error } = await db
      .from("orders")
      .select("total_minor,currency,payment_reference")
      .eq("payment_reference", event.data.reference)
      .maybeSingle();
    if (error) throw error;
    if (
      !order ||
      !verifiedCharge(event.data, {
        reference: order.payment_reference,
        amount: order.total_minor,
        currency: order.currency,
      })
    )
      return new NextResponse(null, { status: 400 });
    const result = await db.rpc("complete_payment", {
      p_event_id: `charge.success:${event.data.id}`,
      p_reference: order.payment_reference,
      p_amount: order.total_minor,
      p_currency: order.currency,
    });
    if (result.error) throw result.error;
    return NextResponse.json({ received: true });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
