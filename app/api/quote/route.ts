import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { priceCart } from "@/lib/pricing";
import { quoteSchema } from "@/lib/validation";
import { assertSameOrigin, smallJson } from "@/lib/request";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = quoteSchema.parse(await smallJson(request));
    const store = await getStore();
    return NextResponse.json(
      priceCart(
        input.lines,
        input.country,
        store.products,
        store.destinations,
        store.preview,
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && !error.message.startsWith("[")
            ? error.message
            : "Please review your bag and delivery country.",
      },
      { status: 400 },
    );
  }
}
