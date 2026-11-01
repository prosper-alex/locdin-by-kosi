import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { validSignature, verifiedCharge } from "./payment";
describe("payment verification", () => {
  it("accepts a matching HMAC and rejects modified payloads", () => {
    const body = '{"event":"charge.success"}';
    const signature = createHmac("sha512", "test-secret")
      .update(body)
      .digest("hex");
    expect(validSignature(body, signature, "test-secret")).toBe(true);
    expect(validSignature(`${body} `, signature, "test-secret")).toBe(false);
    expect(validSignature(body, "bogus", "test-secret")).toBe(false);
  });
  it("requires provider success and exact amount/currency/reference", () => {
    const expected = { reference: "LK-test", amount: 10000, currency: "NGN" };
    const event = { ...expected, status: "success" };
    expect(verifiedCharge(event, expected)).toBe(true);
    expect(verifiedCharge({ ...event, amount: 1 }, expected)).toBe(false);
    expect(verifiedCharge({ ...event, currency: "USD" }, expected)).toBe(false);
    expect(verifiedCharge({ ...event, reference: "other" }, expected)).toBe(
      false,
    );
    expect(verifiedCharge({ ...event, status: "pending" }, expected)).toBe(
      false,
    );
  });
});
