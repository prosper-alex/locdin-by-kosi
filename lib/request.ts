import "server-only";
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next may normalise request.url to localhost. The actual Host header preserves
  // the browser-facing loopback/domain; a configured canonical URL takes priority.
  const host = request.headers.get("host");
  const expected =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `${new URL(request.url).protocol}//${host}` : "");
  if (!expected) throw new Error("The store origin is not configured.");
  if (!origin || new URL(origin).origin !== new URL(expected).origin)
    throw new Error("Please submit this form from the store website.");
}
export async function smallJson(request: Request) {
  const raw = await boundedText(request, 24000);
  return JSON.parse(raw) as unknown;
}
export async function boundedText(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new Error("The submitted form is too large.");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("The submitted form is too large.");
    }
    parts.push(value);
  }
  return Buffer.concat(parts).toString("utf8");
}
