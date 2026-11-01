import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/server";
import { money } from "@/lib/international";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new NextResponse(null, { status: 401 });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const studio = process.env.STUDIO_EMAIL;
  if (
    process.env.NEXT_PUBLIC_STORE_MODE !== "live" ||
    !apiKey ||
    !from ||
    !studio
  )
    return NextResponse.json(
      { error: "Email delivery is not configured." },
      { status: 503 },
    );
  const db = serviceClient();
  let sent = 0;
  for (let index = 0; index < 3; index++) {
    const claim = await db.rpc("claim_notification_job", {});
    if (claim.error)
      return NextResponse.json(
        { error: "Notification queue unavailable." },
        { status: 503 },
      );
    const job = claim.data[0];
    if (!job) break;
    try {
      let to = studio;
      let subject = "A new custom loc request";
      let text = "";
      let bcc: string | undefined;
      if (job.order_id) {
        const { data, error } = await db
          .from("orders")
          .select("email,payment_reference,total_minor,payment_status")
          .eq("id", job.order_id)
          .single();
        if (error || data.payment_status !== "paid")
          throw new Error("Order unavailable.");
        to = data.email;
        bcc = studio;
        subject = "You’re a little closer to loc’d — payment confirmed";
        text = `Your payment of ${money(data.total_minor)} NGN has been verified.\n\nOrder reference: ${data.payment_reference}\n\nProduction and delivery follow the estimates agreed at checkout. Keep this reference if you need help.\n\nLoc’din by Kosi`;
      } else if (job.enquiry_id) {
        const { data, error } = await db
          .from("enquiries")
          .select("name,id")
          .eq("id", job.enquiry_id)
          .single();
        if (error) throw error;
        text = `A new custom-order request from ${data.name} is saved in your studio.\n\nReference: ${data.id}\nReview it securely at ${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries\n\nPrivate reference images remain in the studio; they are not attached to email.`;
      } else throw new Error("Invalid notification.");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `locdin-${job.id}`,
        },
        body: JSON.stringify({
          from,
          to,
          ...(bcc ? { bcc } : {}),
          subject,
          text,
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error("Email provider rejected delivery.");
      const result = await db
        .from("notification_jobs")
        .update({ status: "sent", lease_until: null })
        .eq("id", job.id);
      if (result.error) throw result.error;
      sent++;
    } catch {
      await db
        .from("notification_jobs")
        .update({
          status: job.attempts >= 8 ? "failed" : "pending",
          next_attempt_at: new Date(
            Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts),
          ).toISOString(),
          lease_until: null,
        })
        .eq("id", job.id);
    }
  }
  return NextResponse.json(
    { sent },
    { headers: { "Cache-Control": "no-store" } },
  );
}
