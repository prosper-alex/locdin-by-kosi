import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { previewMode } from "@/lib/store";
import { assertSameOrigin } from "@/lib/request";
import { serviceClient } from "@/lib/supabase/server";

async function boundedForm(request: Request) {
  const limit = 5 * 1024 * 1024;
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Your request is empty.");
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new Error("Please choose an image smaller than 4 MB.");
    }
    parts.push(value);
  }
  return new Response(new Blob(parts as BlobPart[]), {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const form = await boundedForm(request);
    const input = enquirySchema.safeParse(
      Object.fromEntries(
        [...form.entries()].filter(
          ([key]) => !["reference", "captcha"].includes(key),
        ),
      ),
    );
    if (!input.success)
      throw new Error(
        "Please check your name, email, style, loc count and notes (at least 10 characters).",
      );
    const file = form.get("reference");
    let bytes: Buffer | null = null;
    let ext = "";
    if (file instanceof File && file.size > 0) {
      if (file.size > 4 * 1024 * 1024)
        throw new Error("Please choose an image smaller than 4 MB.");
      bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
        ext = "jpg";
      else if (
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        ext = "png";
      else if (
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      )
        ext = "webp";
      else throw new Error("Please upload a valid JPEG, PNG or WebP image.");
    }
    if (previewMode) return NextResponse.json({ preview: true });
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const token = form.get("captcha");
    if (!secret || typeof token !== "string" || !token)
      throw new Error(
        "Please complete the verification before sending your request.",
      );
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(10000),
      },
    ).then((r) => r.json());
    if (
      !verification.success ||
      verification.action !== "custom-order" ||
      verification.hostname !==
        new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
    )
      throw new Error("Verification expired. Please complete it again.");
    const db = serviceClient();
    const id = randomUUID();
    const path = bytes ? `${id}/reference.${ext}` : null;
    if (bytes && path) {
      const upload = await db.storage
        .from("enquiry-references")
        .upload(path, bytes, {
          contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
          upsert: false,
        });
      if (upload.error)
        throw new Error("Your image couldn’t be uploaded. Please try again.");
    }
    const { name, email } = input.data;
    const { country, phone, style, length, colour, quantity, notes } =
      input.data;
    const details = { country, phone, style, length, colour, quantity, notes };
    const insert = await db
      .from("enquiries")
      .insert({ id, name, email, details, attachment_path: path });
    if (insert.error) {
      if (path) await db.storage.from("enquiry-references").remove([path]);
      throw new Error("Your request couldn’t be saved. Please try again.");
    }
    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Your request couldn’t be saved.",
      },
      { status: 400 },
    );
  }
}
