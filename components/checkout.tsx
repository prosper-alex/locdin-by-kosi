"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { useStore } from "./store-provider";
import { money, isInternational } from "@/lib/international";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import type { Quote } from "@/lib/types";
import type { z } from "zod";
import { HumanCheck } from "./human-check";

export function Checkout() {
  const { lines, ready, country, currency, setRegion, destinations, preview } =
    useStore();
  const [quoteResult, setQuoteResult] = useState<{
    key: string;
    quote: Quote | null;
    error: string;
  }>({ key: "", quote: null, error: "" });
  const [submitError, setSubmitError] = useState("");
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof checkoutSchema>, unknown, CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country, lines, address2: "", region: "", postalCode: "" },
  });
  const selectedCountry = useWatch({ control, name: "country" });
  const destination = destinations.find((d) => d.code === selectedCountry);
  const captcha = useWatch({ control, name: "captcha" });
  const setCaptcha = useCallback(
    (token: string) => setValue("captcha", token),
    [setValue],
  );
  const quoteKey = JSON.stringify({ lines, country: selectedCountry });
  const quote = quoteResult.key === quoteKey ? quoteResult.quote : null;
  const quoteError = quoteResult.key === quoteKey ? quoteResult.error : "";
  useEffect(() => {
    setValue("country", country);
  }, [country, setValue]);
  useEffect(() => {
    setValue("idempotencyKey", crypto.randomUUID());
  }, [setValue]);
  useEffect(() => {
    setValue("lines", lines);
    if (!ready || !lines.length) return;
    const controller = new AbortController();
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, country: selectedCountry }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Unable to calculate your order.");
        return body as Quote;
      })
      .then((quote) => {
        if (!controller.signal.aborted)
          setQuoteResult({ key: quoteKey, quote, error: "" });
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setQuoteResult({ key: quoteKey, quote: null, error: error.message });
      });
    return () => controller.abort();
  }, [lines, ready, selectedCountry, setValue, quoteKey]);
  async function submit(input: CheckoutInput) {
    setSubmitError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error || "We couldn’t start checkout. Please try again.",
        );
      if (body.external) window.location.assign(body.url);
      else router.push(body.url);
    } catch (error) {
      setValue("captcha", "");
      setCaptchaAttempt((value) => value + 1);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Please check your connection and try again.",
      );
    }
  }
  if (!ready)
    return (
      <div className="container page-space" role="status">
        Preparing checkout…
      </div>
    );
  if (!lines.length)
    return (
      <div className="container page-space empty-state">
        <h1>Your bag comes first.</h1>
        <p>Choose your locs, then we’ll take care of the next step.</p>
        <Link href="/shop" className="button">
          Explore the collection <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  const fieldError = (name: keyof CheckoutInput) =>
    errors[name] ? (
      <span className="field-error" role="alert">
        {String(errors[name]?.message || "Please review this field.")}
      </span>
    ) : null;
  return (
    <div className="container page-space">
      <Link className="back-link" href="/cart">
        <ArrowLeft size={15} /> Back to your bag
      </Link>
      <div className="checkout-heading">
        <h1>A few final details.</h1>
        <p>
          {preview
            ? "Preview checkout · sample products and shipping. No payment is collected."
            : "Delivery details, clear totals, then secure payment."}
        </p>
      </div>
      <div className="checkout-grid">
        <form
          className="checkout-form"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <section className="form-section">
            <h2>Let’s stay in touch.</h2>
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
              {fieldError("email")}
            </label>
          </section>
          <section className="form-section">
            <h2>Where are your locs headed?</h2>
            <div className="stack">
              <label>
                Delivery country
                <select
                  {...register("country", {
                    onChange: (event) =>
                      setRegion(event.target.value, currency),
                  })}
                >
                  {destinations.map((d) => (
                    <option value={d.code} key={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {fieldError("country")}
              </label>
              <label>
                Full name
                <input
                  autoComplete="shipping name"
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                {fieldError("name")}
              </label>
              <label>
                Address
                <input
                  autoComplete="shipping address-line1"
                  {...register("address")}
                  aria-invalid={Boolean(errors.address)}
                />
                {fieldError("address")}
              </label>
              <label>
                Apartment, suite, etc. <span className="muted">Optional</span>
                <input
                  autoComplete="shipping address-line2"
                  {...register("address2")}
                />
              </label>
              <div className="form-row">
                <label>
                  City
                  <input
                    autoComplete="shipping address-level2"
                    {...register("city")}
                    aria-invalid={Boolean(errors.city)}
                  />
                  {fieldError("city")}
                </label>
                <label>
                  {destination?.regionLabel || "State / region"}
                  <input
                    autoComplete="shipping address-level1"
                    {...register("region")}
                  />
                  {fieldError("region")}
                </label>
              </div>
              <div className="form-row">
                <label>
                  Postal code
                  {!destination?.postalRequired && (
                    <span className="muted">Optional for this destination</span>
                  )}
                  <input
                    autoComplete="shipping postal-code"
                    {...register("postalCode")}
                    aria-invalid={Boolean(errors.postalCode)}
                  />
                  {fieldError("postalCode")}
                </label>
                <label>
                  Phone with country code
                  <input
                    type="tel"
                    autoComplete="shipping tel"
                    placeholder={
                      selectedCountry === "NG" ? "+234" : "+ country code"
                    }
                    {...register("phone")}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {fieldError("phone")}
                </label>
              </div>
            </div>
          </section>
          <label className="checkbox-label">
            <input type="checkbox" {...register("consent")} />
            <span>
              I understand that the charge currency is NGN and have reviewed the{" "}
              <Link href="/policies/shipping" target="_blank">
                delivery information
              </Link>{" "}
              and{" "}
              <Link href="/policies/returns" target="_blank">
                order terms
              </Link>
              .
              {isInternational(selectedCountry) &&
                " Import duties and bank conversion fees may apply."}
            </span>
          </label>
          {fieldError("consent")}
          {!preview && <HumanCheck key={captchaAttempt} onToken={setCaptcha} />}
          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
          <button
            className="button"
            style={{ marginTop: 24 }}
            type="submit"
            disabled={isSubmitting || !quote || (!preview && !captcha)}
          >
            {isSubmitting
              ? "Preparing your order…"
              : preview
                ? "Preview the final step"
                : "Continue to secure payment"}
            <LockKeyhole size={16} />
          </button>
        </form>
        <aside className="order-summary">
          <h2>Your chosen locs.</h2>
          {quote ? (
            <>
              {quote.items.map((item) => (
                <div className="checkout-summary-item" key={item.variantId}>
                  <div className="summary-thumb">
                    <Image src={item.image} alt="" fill sizes="55px" />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.length}″ / {item.colour} × {item.quantity}
                    </p>
                  </div>
                  <span>{money(item.unitPrice * item.quantity, currency)}</span>
                </div>
              ))}
              <div className="summary-lines">
                <div>
                  <span>Subtotal</span>
                  <span>{money(quote.subtotal, currency)}</span>
                </div>
                <div>
                  <span>Shipping{preview ? " estimate" : ""}</span>
                  <span>{money(quote.shipping, currency)}</span>
                </div>
                <div className="summary-total">
                  <span>Total{currency !== "NGN" ? " estimate" : ""}</span>
                  <span>{money(quote.total, currency)}</span>
                </div>
              </div>
              <div className="quiet-note">
                <p>
                  Charge currency: NGN
                  <br />
                  <strong>{money(quote.total)}</strong>
                </p>
                {currency !== "NGN" && (
                  <p>
                    Converted display prices are illustrative estimates. Your
                    bank sets its own conversion rate and fees.
                  </p>
                )}
              </div>
              <div className="checkout-info">
                <p>
                  {preview
                    ? "Sample production: 1–2 weeks."
                    : "Production timing is shown on your selected products."}
                  <br />
                  {preview ? "Sample transit" : "Estimated transit"}:{" "}
                  {quote.transit}, after dispatch.
                </p>
                {isInternational(selectedCountry) && (
                  <p>
                    Import duties, taxes or carrier handling fees may be payable
                    on arrival. These are not included in this preview total.
                    Final commercial terms require approval before live
                    checkout.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p
              role={quoteError ? "alert" : "status"}
              className={quoteError ? "form-error" : "muted"}
            >
              {quoteError || "Calculating shipping and checking your items…"}
            </p>
          )}
          <Link className="text-link small" href="/custom-order">
            Ask about another destination
          </Link>
        </aside>
      </div>
    </div>
  );
}
