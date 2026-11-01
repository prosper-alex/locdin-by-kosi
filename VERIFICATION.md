# Verification — 1 November 2026

## Passed locally

- TypeScript strict type check.
- ESLint.
- Next.js production build, including all page/API routes and the administrator session proxy.
- 21 unit/PostgreSQL tests across pricing, payment verification and real PostgreSQL migration/access behaviour (PGlite).
- All 5 Playwright browser journeys using the installed Chrome browser: responsive homepage/image loading/overflow at 1440, 768, 390 and 360 pixels; region/currency preferences; product configuration/persistent bag/international checkout preview; enquiry preview/search/mobile navigation/admin setup boundary; price tampering and cross-origin rejection.
- Production dependency audit: zero reported vulnerabilities. The full dependency audit still reports 16 moderate development-tool advisories. ESLint 9 is pinned for compatibility with the installed Next.js lint plugins; that tooling needs a coordinated upgrade when compatible releases are available. No blind major-version overrides were applied.
- Impeccable mechanical detector: no findings on application/components at the inspection pass.
- Asset provenance scan: all 7 public rasters have origin/prompt metadata.

## Extension hydration follow-up

Reproduced the reported warning by injecting Grammarly's exact `data-new-gr-c-s-check-loaded` and `data-gr-ext-installed` attributes into the body before React loaded. The regression test failed before the fix and passed after adding `suppressHydrationWarning` only to `<body>` in `app/layout.tsx`. The test also opens the region drawer to verify client interactivity. Descendant hydration checks remain active. The focused browser regression, TypeScript check, and lint on changed files passed; the earlier five browser journeys were not rerun for this attribute-only change.

## Independent design review

### Typography, spacing and motion refinement

The user approved warm, refined serif headlines. Lora replaces the editorial face; DM Sans handles body/shopping content. Body copy is now 16px, shopping support 14px and metadata generally 13px. Section spacing is 112px desktop, 88px tablet and 72px mobile, with larger card-detail gaps and aligned product prices. A short hero entrance, copper underline and arrow feedback respect reduced motion.

All seven current Playwright checks passed, including the extension-hydration regression and reduced-motion interaction. Updated captures cover 1440/768/390/360 widths and desktop/mobile international checkout. The independent typographic/layout assessor reopened all six final captures and returned **ship** for the concrete typography/spacing issues, with no material remaining defects at that scope. Development overlay content in the desktop capture remains an evidence limitation. The production build, type check and lint passed for the refinement. No backend behaviour or live configuration changed.

The refinement detector reported no non-advisory findings. Its remaining 66 advisories concern component/responsive font sizes and existing surface colours outside the primary documented token set; the raw report is `.impeccable/review/refinement-detector.json`. These are documentation/ramp consistency advisories, not a claim of a clean advisory scan.

### Initial storefront review

The finish reviewer requested two material fixes: form boundaries needed stronger contrast, and mobile input text needed to be 16px. Both were implemented. Address rows stack on mobile; product navigation icons now use arrows.

The reviewer reopened all six final captures and returned **ship**, with both material findings resolved. This closes the specific fix list for local preview; it is not live-commerce certification or a second whole-surface audit. An optional development issue badge remains visible in the desktop homepage evidence; mobile captures are clean. This badge is not part of the production design.

Evidence: `.impeccable/review/desktop.png`, `tablet.png`, `mobile.png`, `mobile-small.png`, `checkout-desktop.png`, and `checkout-mobile.png`.

## What has not been exercised

- Supabase cloud deployment, project-specific advisors, actual invited-user login/session refresh, real Storage uploads or real provider emails. Local PostgreSQL Auth/Storage schemas are test stubs, not the hosted services.
- Paystack merchant activation, international-card acceptance, sandbox/live charges, webhook delivery from the provider, cancellation/refunds or reconciliation with its dashboard.
- Turnstile validation against configured real hostname/site credentials.
- Resend delivery, verified sender configuration or a running notification schedule. Queue locking/lease behaviour is tested locally.
- Native Safari/iPhone focus behaviour or actual shipping/carrier operations.
- Real product materials, prices, photographs, fulfilment promises, customs/tax amounts, customer policy text or business contact information.

The app remains a functional preview with server integrations prepared and disabled by default. No hosted database was modified, no site was deployed, no schedule was enabled, no emails were sent and no financial transactions were initiated.

## Required before opening sales

Follow README.md: connect the provisioned Supabase project, run advisors/integration checks, replace sample products and photos, approve serviceable destination rates, finalise policies/customs handling and actual contact details, configure verified payment/email/Turnstile credentials, test the provider sandbox end to end, configure endpoint rate limits and monitoring, and confirm backup/retention arrangements. Ready-to-ship stock and multi-currency settlement require additional implementation if the business needs them.
