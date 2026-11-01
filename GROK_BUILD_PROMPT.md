# Loc’din by Kosi — implementation brief for Grok

Act as a lead full-stack engineer, ecommerce UX specialist, and UI design director. Build Loc’din by Kosi into a carefully crafted, responsive ecommerce website. Deliver working journeys, a maintainable implementation, and verified results.

## Evidence and assumptions

Inspect project instructions and these assets before coding:

- `WhatsApp Image Oct 30 2026.jpeg`: primary visual authority for composition, colours, atmosphere, typography, and content hierarchy.
- `logo.jpeg`: supplied brand mark; preserve its proportions and identity.
- `Inspolink.md`: client's ecommerce inspiration link. Inspect it if accessible; state any access limitation instead of claiming to have reviewed it.

The starting workspace contains reference assets, not an established application. Verify this before scaffolding and preserve any subsequent user work.

Confirmed requirements (1 November 2026): this is a handmade loc-extension business serving Nigerian and international customers. NGN is the base transaction currency, products may be made to order, and custom orders require a quotation. International checkout is required, not limited to enquiries. Support destination-aware shipping, international address formats, explicit charge currency, verified international payment acceptance, and clear duties/tax handling. Present these controls discreetly within the overall black-and-copper UI. Supported destinations, shipping prices, provider credentials, and any additional settlement currencies require configuration before live transactions.

Prices, processing times, product composition, quantities, worldwide shipping, and other commercial claims visible in the reference are provisional. Keep them centrally editable. Clearly mark development sample data and prevent unapproved sample products from being sold live.

## Fixed technical direction

- Next.js App Router with React and TypeScript in strict mode.
- Tailwind CSS with CSS variables for brand tokens. Use accessible Radix primitives when needed for dialogs, menus, and selection controls; style them to the reference.
- Supabase Postgres for catalogue, variants, orders, enquiries, configuration, and administrative access records.
- Supabase Auth for invited administrators. Guest checkout is the launch default; customer accounts are deferred.
- Supabase Storage for public product imagery and private enquiry attachments.
- `@supabase/supabase-js` and `@supabase/ssr`, following current official integration guidance. Use generated database types.
- Next.js Server Components for catalogue and editorial content; Client Components for cart, product configuration, and interactive controls.
- Next.js server functions/Route Handlers for trusted mutations, checkout initiation, callbacks, and integrations. Keep validation and business rules in reusable server modules.
- Zod for validation, React Hook Form for complex forms, and React context plus a reducer for the small persistent guest cart. Introduce additional state tooling only for a demonstrated need.
- Vitest for critical pricing/order logic and Playwright for essential browser journeys.
- Vercel as the proposed deployment target; Supabase as the managed backend. Document required plans and configuration without assuming paid features or purchasing services.

Use currently supported, mutually compatible stable versions. Check official documentation, pin installed versions, and commit the lockfile. Do not use canary releases or deprecated Supabase auth-helper packages.

Do not add Express, a separate API service, an ORM, Realtime subscriptions, or a second CMS without a concrete requirement. Use reviewed SQL migrations and the typed Supabase client initially. Public catalogue data may be cached and invalidated after admin edits. Never share-cache sessions, carts, orders, or other personal data.

## Design direction

The reference depicts warm luxury: near-black backgrounds, warm charcoal surfaces, ivory text, copper/gold details, tactile hair photography, elegant serif headlines, and occasional handwritten accents.

Suggested starting tokens, subject to contrast verification:

- Background: `#090807`.
- Surface: `#15110E`.
- Primary text: `#F4EEE7`.
- Secondary text: `#C4B7AA`.
- Copper: `#CB915E`.
- Subtle border: `#3D2D21`.

Typography refinement approved 1 November 2026: use Lora for warm, refined editorial headlines and DM Sans for body text, product names, controls and form/summary titles. Keep ordinary body copy at 16px, shopping support text at 14px and secondary metadata around 13px. Use restrained serif italics for accents. Preserve the increased local/section spacing and subtle, reduced-motion-aware hero/arrow animation documented in DESIGN.md. Verify licensing and load fonts efficiently; do not revert to the earlier Cormorant/Manrope pairing or the reference's tiny text.

Create a strong editorial hero and carefully spaced product grids. Avoid excessive gradients, glitter, glass panels, large pill-shaped containers, decorative dashboards, and unnecessary animation. Typography, cropping, spacing, and material detail should carry the premium identity.

Prepare an appropriately cropped derivative of the supplied logo while preserving the original. Its black margins must not make the header mark appear tiny. Do not trace or redesign it without instruction.

Use approved photography where available. Never stretch the WhatsApp mockup into the website or use its tiny embedded product photos as final catalogue assets. If suitable separate assets are missing, use clearly documented local placeholders, preserve the intended composition, and include an asset-replacement checklist. Do not invent customer endorsements or claims.

## Routes and scope

Implement these launch routes:

- `/`: homepage.
- `/shop`: searchable catalogue with collection filtering and sorting.
- `/collections/[slug]`: collection listing.
- `/products/[slug]`: product configuration and details.
- `/custom-order`: quotation enquiry.
- `/cart` and `/checkout`: guest purchase journey.
- `/order/confirmation`: payment status and order acknowledgement, securely scoped to the current checkout.
- `/about`, `/faq`, `/contact`, `/care`.
- `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms`.
- `/admin/login`, `/admin/products`, `/admin/orders`, `/admin/enquiries`, `/admin/settings`, with necessary detail/edit screens.

Policy drafts must be clearly identified in development and reviewed before launch. Do not fabricate binding refund or shipping terms.

Homepage sequence: concise announcement strip; navigation; photography-led hero using “Your locs. Your style. Your way.”; confirmed service information; collections; craftsmanship story; featured products; final shopping invitation; practical footer.

Collections inferred from the reference: Traditional, Fluffy, Curly-End, Loop, and Custom Orders. Keep catalogue collections editable. Present Custom Orders as an enquiry path rather than implying every custom combination has a fixed purchasable price.

Include a functional mobile menu, search, product filtering, and cart count. Omit account and wishlist icons until those features exist. Support URL-based filters and clear empty results.

## Product and purchasing rules

Each product must explain what is being purchased: a single loc, bundle, or set. Display loc count, material, available dimensions, relevant care guidance, production time, and price basis.

Use sellable variants with stable identifiers. Dimensions may include length, colour, thickness, texture, and material, but only implement combinations supported by real catalogue data. Each variant owns its price, currency, availability, and applicable lead time. Disable invalid combinations and require necessary selections before adding to cart.

Keep cart quantity distinct from locs per bundle. Show selected options, unit price, quantity, subtotal, delivery charge, and total. Persist variant identifiers and quantities locally, but revalidate product status, prices, options, and availability on the server before checkout. Explain changed prices and unavailable items instead of silently charging a new total.

Store currency amounts as integer minor units; never calculate payment totals using floating-point arithmetic. Use one currency per order. Preserve immutable product names, options, prices, addresses, and delivery estimates in order snapshots.

Guest checkout collects only required contact and delivery details. Validate serviceable destinations. Shipping rules must be explicit; an unknown shipping charge blocks payment or routes to an enquiry. Do not silently assume free shipping.

Separate ready-to-ship inventory from made-to-order products. Ready-to-ship stock needs atomic reservation and release/expiry to prevent overselling. Made-to-order products need an availability/capacity rule and disclosed production timing. Keep production time distinct from delivery time.

Custom enquiries collect name, email, optional phone, delivery country, desired style/options, quantity or loc count, notes, and optional reference image. Submission must persist successfully before showing success. A requested date is a preference, never a promised delivery date. Allow only bounded image uploads, use private storage and short-lived signed access, and apply server-side abuse protection.

## Payments and notifications

The payment provider is a launch dependency, not a settled business decision. Support one provider initially through a small adapter. The merchant must confirm its legal operating country, approved provider account, currencies, and international acceptance before live activation. Do not install several payment integrations speculatively.

Implement a clearly marked development payment adapter so the journey can be verified without live credentials. Live mode must refuse to start checkout if required configuration is missing.

Trusted server code must recalculate totals, persist a pending order, and initiate provider checkout. Verify payment authenticity server-side, including signature, transaction reference, amount, and currency. A browser redirect alone never establishes payment success.

Use idempotency and uniqueness constraints for initiation and webhook processing. Support duplicate/out-of-order callbacks, abandoned checkout, payment failure, pending verification, and success. Enforce valid payment transitions so stale events cannot downgrade a paid order. Record refunds independently from fulfilment.

Keep payment states separate from fulfilment states such as awaiting production, in production, ready, shipped, and delivered. Do not dispatch production or confirmation work twice.

Persist notification jobs after order/enquiry creation and retry transient delivery failures. Transactional email needs a configured delivery service and verified sender. Missing email configuration must not erase an order or falsely report successful email delivery. WhatsApp support links require the real business number and must never auto-send messages.

## Data model and permissions

Create reviewed migrations, foreign keys, indexes, constraints, and development seed data for:

- Collections, products, product images, and collection membership.
- Product variants with validated option data and explicit stock/production mode.
- Orders, immutable order items, payment attempts/events, and stock reservations where applicable.
- Custom enquiries and their attachment metadata.
- Shipping zones/rates, store settings, and notification jobs.
- Administrative memberships and audit events for sensitive changes.

Use a proportionate schema; no need for a generic commerce-platform abstraction. Add timestamps and enforce unique slugs, payment references, and event identifiers where relevant.

Enable RLS on every table exposed through the Supabase Data API, with explicit grants and least-privilege policies. Anonymous visitors may read published catalogue content only. Guest orders and enquiries must go through validated server endpoints; never allow public reads of customer information or public arbitrary order writes.

Protect admin operations in server code and database policies using trusted membership records or trusted app metadata, never user-editable metadata. No public admin signup. Use Supabase's current recommended server-side session verification; do not trust an unverified cookie/session object as authorization.

Never expose Supabase secret/service-role keys or payment secrets in browser code. Limit privileged clients to isolated server-only modules with explicit validation and authorization. Public product images and private enquiry images require separate storage policies. Do not log sensitive addresses, tokens, or uploaded files.

Guest confirmation access requires a securely scoped session or high-entropy expiring capability; sequential order IDs and email addresses are not access credentials.

## Administrator workflow

The owner must be able to create/edit/publish products, upload and order images, manage variants and availability, review orders, update production/shipping status, record tracking, review custom enquiries, and edit configured shipping and production information.

Keep the admin interface practical and readable. Validate destructive or consequential changes. Changing a product's current price must not modify existing orders. Payment status must come from verified provider processing, with refunds handled through a documented provider-backed workflow.

## Accessibility, performance, and validation

Target WCAG 2.2 AA: semantic structure, visible focus, labelled inputs, accessible dialogs, announced cart/error feedback, adequate contrast and touch targets, and reduced-motion support. Test keyboard navigation.

Verify at approximately 360px, 390px, 768px, and 1440px widths. Avoid overflow and text clipping. Optimise responsive images with reserved dimensions and intentional crops; prioritise only critical above-the-fold imagery. Use product metadata, canonical URLs, sitemap, robots configuration, and structured data consistent with actual offers. Keep admin, checkout, and private order pages out of search indexing.

Run type checks, linting, production build, focused unit tests, and essential browser tests. Verify pricing tamper rejection, invalid variants, persisted cart recovery, admin authorization, anonymous-data restrictions, duplicate payment callbacks, and guest order privacy. If live provider credentials are unavailable, report the integration as unverified rather than claiming successful live payment testing.

Perform one combined desktop/mobile visual review, fix observed defects in a batch, and confirm the fixes. Report actual measurements and checks; do not invent performance scores.

## Delivery and launch boundaries

Deliver source code, lockfile, reproducible migrations, development seed data, `.env.example` containing placeholders only, setup instructions, verification results, and a short launch checklist.

Start with a short architecture and assumptions summary, then implement coherent end-to-end slices. The user will set up Supabase; prepare migrations and documented configuration so the application can be connected without redesign. Use local sample data for preview when credentials are absent, with a clear development indicator and no live checkout.

Launch dependencies: approved product photos; sellable variants and prices; locs per unit; material claims; production capacity/timing; supported destinations and shipping rates; merchant/payment approval; contact details; reviewed policies; verified email sender; deployment/domain configuration; and verified backup/recovery arrangements appropriate to the selected Supabase plan.

Defer customer accounts, wishlists, loyalty schemes, reviews, live carrier integrations, and advanced analytics until required. International checkout is launch scope; additional settlement currencies depend on merchant/provider support and must never be represented as available before configuration. Proceed with reversible local work; production deployment, live financial operations, and destructive database actions require the user's authorization.

End with what works, what was tested, what remains blocked, and the exact client inputs required. A convincing preview and a live transaction-ready store are separate acceptance milestones.
