"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { ArrowUpRight, Check } from "lucide-react";
import { useStore } from "./store-provider";
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}
export function EnquiryForm() {
  const { preview, destinations, country } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!preview && loaded && captchaRef.current && window.turnstile && siteKey)
      widgetRef.current = window.turnstile.render(captchaRef.current, {
        sitekey: siteKey,
        theme: "dark",
        action: "custom-order",
        callback: (token: string) => setCaptcha(token),
        "expired-callback": () => setCaptcha(""),
      });
    return () => {
      if (widgetRef.current) window.turnstile?.remove(widgetRef.current);
    };
  }, [loaded, preview, siteKey]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const body = new FormData(event.currentTarget);
    body.set("captcha", captcha);
    try {
      const response = await fetch("/api/enquiries", { method: "POST", body });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your request couldn’t be saved. Please try again.",
        );
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Please check your connection and try again.",
      );
      if (widgetRef.current) window.turnstile?.reset(widgetRef.current);
      setCaptcha("");
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="success-panel">
        <Check size={36} strokeWidth={1} />
        <h2>
          {preview
            ? "Your vision, previewed."
            : "Your request is with the studio."}
        </h2>
        <p style={{ marginTop: 20 }}>
          {preview
            ? "This was a preview submission. Your details and reference image were not saved or sent to the business. Connect the store backend to enable real enquiries."
            : "Your custom-order request has been saved. The studio can review your preferences and delivery destination before preparing a quote."}
        </p>
        <button
          className="button button-outline"
          onClick={() => setSuccess(false)}
        >
          Start another request <ArrowUpRight size={17} />
        </button>
      </div>
    );
  return (
    <form className="enquiry-form stack" onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Delivery country
          <select name="country" defaultValue={country}>
            {destinations.map((d) => (
              <option value={d.code} key={d.code}>
                {d.name}
              </option>
            ))}
            <option value="Other destination">Another destination</option>
          </select>
        </label>
        <label>
          Phone <span className="muted">Optional, with country code</span>
          <input type="tel" name="phone" autoComplete="tel" maxLength={30} />
        </label>
      </div>
      <label>
        Your starting style
        <select name="style" required>
          <option value="">Choose a direction</option>
          <option>Traditional locs</option>
          <option>Fluffy locs</option>
          <option>Curly-end locs</option>
          <option>Loop locs</option>
          <option>Something entirely my own</option>
        </select>
      </label>
      <div className="form-row">
        <label>
          Length
          <input
            name="length"
            placeholder="e.g. 16 inches, or help me choose"
            maxLength={30}
          />
        </label>
        <label>
          Colour
          <input
            name="colour"
            placeholder="e.g. natural black with copper tips"
            maxLength={100}
          />
        </label>
      </div>
      <label>
        Approximate number of locs
        <input
          type="number"
          name="quantity"
          min={1}
          max={2000}
          required
          defaultValue={60}
        />
        <span className="file-help">
          Individual locs, rather than number of bundles.
        </span>
      </label>
      <label>
        Tell us more
        <textarea
          name="notes"
          required
          minLength={10}
          maxLength={3000}
          placeholder="The texture, thickness, finish, and anything else you’re imagining. For another destination, include your country here."
        />
      </label>
      <label>
        A little inspiration{" "}
        <span className="muted">Optional reference image</span>
        <input
          type="file"
          name="reference"
          accept="image/jpeg,image/png,image/webp"
        />
        <span className="file-help">
          JPEG, PNG or WebP · up to 4 MB. Share an image you have permission to
          use.
        </span>
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {!preview && (
        <>
          {siteKey && (
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              onLoad={() => setLoaded(true)}
            />
          )}
          <div ref={captchaRef} />
          {!siteKey && (
            <p className="small muted">
              Enquiry submission will be available once the store’s verification
              service is connected.
            </p>
          )}
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button"
        type="submit"
        disabled={busy || (!preview && !captcha)}
      >
        {busy
          ? "Reviewing your request…"
          : preview
            ? "Preview your request"
            : "Send your custom request"}
        <ArrowUpRight size={17} />
      </button>
      <p className="small muted">
        {preview
          ? "Studio preview: this form won’t send or store your personal details."
          : "Your details will be used to respond to this enquiry. No payment is taken."}
      </p>
    </form>
  );
}
