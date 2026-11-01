# Loc’din by Kosi

A Next.js / React / TypeScript storefront based on the supplied WhatsApp design. Grok left empty source folders and `public/brand/mark.jpg`; this implementation continues from those assets. The confirmed brief now includes international checkout, with NGN as the base charge currency.

## Run locally

Use Node 22 (`.nvmrc`). A project-local Node 22 runtime is also installed as a development dependency for this machine.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Preview mode works without credentials. If you use an environment file, copy `.env.example` to `.env.local`, keep `NEXT_PUBLIC_STORE_MODE=preview`, and set `NEXT_PUBLIC_SITE_URL` to the exact browser-facing origin. Use `127.0.0.1` consistently rather than alternating with `localhost`.

## What works

- Responsive homepage, four collections, searchable/filterable/sortable catalogue, product configuration, bundle quantities, persistent bag, and related editorial/help routes.
- Destination/display preferences. NGN is the actual charge currency. USD/GBP/EUR in preview are explicitly illustrative conversions, not live FX or extra settlement currencies. Live mode offers NGN only until genuine multi-currency pricing is implemented.
- Destination-specific shipping, international address fields, separate production/transit estimates, duties information, and server-verified order totals.
- Full guest checkout preview with no charge or real order, plus a custom-enquiry preview that does not persist or deliver personal details.
- Supabase-backed catalogue, invited admin authentication, product/variant editing and photo replacement, order fulfilment/tracking updates, private enquiries, and shipping settings once configured.
- A disabled-by-default Paystack server adapter, verified webhook handling, scoped guest order access, idempotent payment processing, and a retryable notification outbox/Resend worker.

The current catalogue supports **made-to-order availability**, controlled per variant. Ready-to-ship stock reservations, multiple product-gallery images, customer accounts, promotions, and multi-currency settlement are not implemented. Do not use it for stock-limited ready-to-ship items without adding atomic reservations.

## Connect Supabase

1. Create the Supabase project. Review `supabase/migrations/20261101032340_storefront.sql`, then apply it to the intended fresh development project using the SQL Editor or your reviewed migration workflow. Nothing has been applied to a hosted project by this task.
2. Optionally load `supabase/seed.sql` **in development only**. It contains illustrative catalogue/shipping data, with sale and shipping approvals false. Regenerate it with `node_modules/.bin/node scripts/create-seed.mjs` after changing sample data.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY` in `.env.local` or the host’s secret store. Never prefix the secret key with `NEXT_PUBLIC_`.
4. Invite the administrator in Supabase Auth and complete their password setup. Set the project’s Site URL/redirect allowlist to the intended deployment domain. Use the trusted SQL Editor to insert that Auth user’s UUID into `public.admin_memberships`. There is no browser self-promotion or public admin registration.
5. Open `/admin/login`. Server actions and database policies both require membership. The `/admin` proxy refreshes sessions; hiding UI alone never grants access.
6. Set `STORE_DATA_SOURCE=supabase` while leaving `NEXT_PUBLIC_STORE_MODE=preview` to review your actual database without accepting money or real enquiries. Replace sample images/content, edit variants, and configure shipping destinations in the studio.
7. Regenerate `lib/supabase/database.types.ts` from the provisioned schema with the installed Supabase CLI’s type-generation command after checking its current `--help`. The existing bootstrap types match the checked-in schema; they have not been generated from a remote project.

The migration creates public product-image storage and private enquiry-reference storage. Product uploads are administrator-only; enquiry uploads go through the protected server endpoint. Private reference links last five minutes. All exposed tables have explicit grants and RLS. Anonymous clients cannot read orders/enquiries or arbitrarily write orders.

## International transactions and live payments

International purchasing is a first-class journey, not an enquiry-only fallback. Unlisted destinations still require a shipping quote, because the store must not guess a charge.

Before switching to live mode:

- Approve real product specifications, material, bundle quantities, prices, photography and production estimates. Product approval and publication are separate fields.
- Configure actual destination rates, address requirements and transit estimates; approve each supported destination. Unsupported countries cannot purchase by selecting an arbitrary rate.
- Replace draft policies with reviewed business terms, including how customs/import duties/taxes are handled. Set `COMMERCE_POLICIES_APPROVED=true` only afterwards. The current implementation models shipping charges, not a tax engine or DDP calculation.
- Confirm the merchant’s provider account, NGN support and international-card acceptance. The included Paystack adapter is provisional; credentials and provider sandbox acceptance have not been tested. If another provider is chosen, replace the isolated initialise/webhook implementation.
- Configure Turnstile site/secret keys for the actual hostname. Live checkout and enquiries validate tokens server-side, including action and hostname.
- Configure `PAYSTACK_SECRET_KEY` server-side. Set the provider webhook URL to `/api/payments/webhook`; payment success requires a valid HMAC and matching reference, amount and currency. Browser redirects never mark an order paid.
- Set `INTERNATIONAL_PAYMENTS_ENABLED=true` only after merchant international acceptance is verified, and `LIVE_CHECKOUT_ENABLED=true` only after the whole sandbox purchase/callback/reconciliation flow passes. Use an HTTPS `NEXT_PUBLIC_SITE_URL`.
- Set `NEXT_PUBLIC_STORE_MODE=live` and redeploy/restart; public environment flags are build-time values. Missing flags/configuration or unapproved data block checkout.

Pending orders contain immutable price/address snapshots. A high-entropy, hashed capability in an HTTP-only cookie scopes guest confirmation access for 24 hours. Duplicate webhook events cannot queue confirmation twice; stale events cannot downgrade an already paid/refunded order. If transaction initialisation is uncertain, the same idempotency key is not reused to create a second order. Recovery is conservative: inspect the provider/reference and current status before starting again.

Refunds, payment failures and reconciliation need operational handling in the payment provider. The studio cannot mark orders paid or edit historical amounts. A verified paid order can have its fulfilment/tracking updated. Automated refund execution is not implemented.

## Notifications

Order payment and real enquiry creation enqueue notification jobs atomically. Configure `RESEND_API_KEY`, a verified `EMAIL_FROM`, `STUDIO_EMAIL`, and a random `CRON_SECRET`. A trusted scheduler may invoke `GET /api/notifications/process` with `Authorization: Bearer <CRON_SECRET>`; no schedule has been created or enabled by this task.

The worker claims one job at a time with row locks and a lease, sends at most three per invocation, uses a provider idempotency key, and retries up to eight times with backoff. Paid-order confirmations go to the customer with the studio copied privately; enquiry notifications go to the studio and point to the protected enquiry view. Delivery integration is unverified without real credentials. No confirmation message claims an email was delivered before it has been.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The unit suite runs actual PostgreSQL through PGlite with minimal Auth/Storage schema stubs. It checks the migration, public/private row access, admin boundaries, immutable payment amounts, transaction rollback, duplicate callback processing and notification creation, alongside pricing and HMAC tests. This is not a substitute for Supabase cloud advisors and integration tests on the provisioned project.

Browser tests cover 1440/768/390/360 widths, image loading, overflow, region/currency selection, variant selection, bag persistence, international checkout preview, enquiry preview, mobile navigation/search, and price/origin rejection. This Mac’s bundled Playwright Chromium is unsupported; the config uses installed Chrome if available, or accepts `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Other environments should install their supported Playwright Chromium.

Screenshot evidence lives under `.impeccable/review/`. No live payment, real email, cloud storage, hosted Auth session or production deployment was exercised. See `VERIFICATION.md` for final results and remaining limitations.

## Assets and launch inputs

`ASSETS.md` records the generated illustrative images and provenance. Replace them with approved product photography before sale. The source logo and original WhatsApp image are preserved. Customer testimonials, support email/telephone, delivery promises and final-sale rules have not been invented.

Needed from the business: actual contact details and support hours; approved catalogue and images; production capacity; serviceable countries and real shipping rates; payment account approval; policies and duties treatment; verified email sender; deployment/domain settings; retention and backup/recovery arrangements. Configure deployment-level rate limits for public endpoints and run Supabase security/performance advisors before enabling live traffic.

Official implementation references: [Next.js App Router](https://nextjs.org/docs/app), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Paystack payments](https://paystack.com/docs/payments/accept-payments/), [Paystack webhooks](https://paystack.com/docs/payments/webhooks/), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Resend send API](https://resend.com/docs/api-reference/emails/send-email).
