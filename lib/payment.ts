import { createHmac, timingSafeEqual } from "node:crypto";
export function validSignature(raw: string, supplied: string, secret: string) {
  if (!/^[a-f0-9]{128}$/i.test(supplied)) return false;
  return timingSafeEqual(
    Buffer.from(createHmac("sha512", secret).update(raw).digest("hex"), "hex"),
    Buffer.from(supplied, "hex"),
  );
}
export function verifiedCharge(
  data: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  },
  expected: { reference: string; amount: number; currency: string },
) {
  return (
    data.status === "success" &&
    data.reference === expected.reference &&
    Number.isSafeInteger(data.amount) &&
    data.amount === expected.amount &&
    data.currency === expected.currency
  );
}
