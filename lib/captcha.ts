import "server-only";
export async function verifyCheckoutCaptcha(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token || !process.env.NEXT_PUBLIC_SITE_URL)
    throw new Error("Please complete the checkout verification.");
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10000),
    },
  );
  const body = await response.json();
  if (
    !body.success ||
    body.action !== "checkout" ||
    body.hostname !== new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
  )
    throw new Error(
      "Verification expired. Please verify again before continuing.",
    );
}
