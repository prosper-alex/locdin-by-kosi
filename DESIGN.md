---
name: Loc’din by Kosi
description: Handmade loc extensions in the approved near-black, ivory and copper identity.
colors:
  background: "#090807"
  surface: "#15110e"
  raised: "#1d1712"
  text: "#f4eee7"
  muted: "#bcb0a3"
  copper: "#cf9b70"
  copper-hover: "#e1b68e"
  border: "#352b23"
  control-border: "#80664f"
  control-border-hover: "#ad8a6d"
  danger: "#edb5a3"
  action-ink: "#17100b"
  placeholder: "#a99888"
  selected-option: "#251a11"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(56px, 5.1vw, 78px)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    lineHeight: 1.8
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
  shopping:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
  metadata:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
  product-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  form-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.4
  action:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  square: "0"
  circular: "50%"
spacing:
  field-gap: "12px"
  form-stack: "28px"
  card-gap: "32px"
  image-caption: "22px"
  price-gap: "16px"
  mobile-card-column: "20px"
  mobile-card-row: "48px"
  summary-inset: "36px"
  section: "112px"
  section-tablet: "88px"
  section-mobile: "72px"
components:
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.action-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "13px 25px"
  button-primary-hover:
    backgroundColor: "{colors.copper-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.copper}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "13px 25px"
  button-outline-hover:
    backgroundColor: "{colors.copper-hover}"
    textColor: "{colors.background}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "12px 14px"
  status-tag:
    textColor: "{colors.copper}"
    rounded: "{rounded.square}"
    padding: "4px 10px"
  order-summary:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.square}"
    padding: "36px"
---

# Design System: Loc’din by Kosi

## Overview

**Creative North Star: "Near-black, ivory and copper"**

The approved reference and supplied logo establish a near-black, ivory and copper identity for handmade loc extensions. Editorial serif headlines and tactile loc photography carry the storefront; readable sans-serif controls keep shopping, international delivery and administration practical.

The system is flat, warm and restrained. Square surfaces, fine separators and generous storefront spacing coexist with denser checkout forms and private administrative tables. International preferences appear as ordinary navigation and checkout controls, with clear charge-currency information.

**Key Characteristics:**

- Near-black grounds with ivory type and copper actions.
- Lora headlines paired with DM Sans body, product names and controls.
- Square surfaces, fine warm separators and texture-led photography.
- Responsive commerce with restrained destination and currency controls.

This name describes the confirmed identity; it introduces no new creative direction. The normative source is `app/globals.css`, with motion in `app/motion.css`, font loading in `app/layout.tsx` and behavior in the representative header, drawer, product card and checkout components. The route-specific composition remains in `.impeccable/surfaces/app-page-tsx.md`.

## Colors

A warm copper accent joins ivory text and brown-black tonal surfaces. The frontmatter owns exact color values.

### Primary

- **Copper** (`copper`): solid purchase actions, emphasized serif italics, active navigation, selected controls, icons and keyboard focus.
- **Light copper** (`copper-hover`): filled primary and outline action hover.
- **Action ink** (`action-ink`): dark text over solid copper actions.

### Neutral

- **Near-black** (`background`): page ground, fields and quiet information notes.
- **Warm surface** (`surface`): drawer, order summary and photo loading grounds.
- **Raised brown-black** (`raised`): declared source palette token; no current component assignment was observed. Do not infer an extra elevation layer from its name.
- **Ivory** (`text`): headings, labels and primary content.
- **Warm stone** (`muted`): explanatory content and secondary metadata.
- **Fine warm border** (`border`): decorative dividers, navigation separators and structural edges.
- **Control bronze** (`control-border`): the stronger standard input, select and textarea boundary.
- **Hover bronze** (`control-border-hover`): standard field hover boundary.
- **Placeholder stone** (`placeholder`): hint text inside fields.
- **Selected brown** (`selected-option`): selected length-option fill.
- **Error peach** (`danger`): inline field and submission errors; pair with explanatory text.

**The Control Boundary Rule.** Decorative separators and form-control outlines have different jobs. Preserve the stronger control boundary on standard fields, including hover and focus states.

## Typography

**Display Font:** Lora, with Georgia and serif fallbacks. The variable font loads normal and italic styles through `next/font` in `app/layout.tsx`.

**Body Font:** DM Sans, with sans-serif fallback, also loaded as a variable font through `next/font`. Product and collection names, form and summary titles, navigation, controls and prices use this family.

The user-approved direction is warm, refined serif headlines. Reserve Lora for editorial headlines and storytelling; keep shopping names and utility headings in DM Sans. Italic emphasis is copper. Numeric prices use tabular figures where implemented.

### Hierarchy

- **Display:** the hero uses the frontmatter display role with weight 400, 1.16 line height and -0.035em tracking. It changes to 64px at 1150px, 52px at 900px, and `clamp(44px, 8.2vw, 60px)` at 760px and below. Generic page h1 starts at 64px with 1.2 line height; commerce and editorial routes apply local overrides.
- **Headline:** base h2 is Lora 44px/1.2, weight 400, with -0.02em tracking. Story headings use 44px/1.3, reducing to 36px at 1150px and 34px on mobile. Section headings become 36px/1.3 at 900px and 32px/1.3 on mobile.
- **Title:** generic h3 remains Lora 28px/1.2. Product and collection names use DM Sans 500, 20px/1.4, becoming 18px on mobile. Product names use -0.015em tracking. Bag-item titles remain 20px and checkout item names 18px. Form-section and order-summary titles use DM Sans 500, 24px/1.4.
- **Body:** the root default is 16px/1.8. Hero supporting copy uses 16px/1.85 with a 34ch measure; story copy uses 16px/1.9 at 52ch and product descriptions use 16px at 48ch. Long editorial prose uses 16px/1.95 and a 70ch measure.
- **Shopping and metadata:** product and collection descriptions, navigation, labels and most supporting shopping text use 14px. Bundle units, catalogue counts and service metadata use 13px. Product-card prices are 16px with tabular figures. Small announcement, photo-caption and brand-lockup details retain their local smaller sizes; these are not defaults for shopping copy.
- **Action:** semibold DM Sans 14px/1.4. Standard form controls inherit the 16px body size; mobile catalogue search and sorting explicitly use 16px too. Labels use 14px with a 12px gap above controls. Body copy does not use decorative tracking.

## Layout

The shared content measure is 1280px with 56px side gutters on wide screens. At 1150px and below gutters become 32px; at 760px and below they become 20px. The header has its own 1440px maximum, while hero and story regions can extend to 1600px. Editorial articles have a 900px cap.

Storefront sections start at 112px vertical padding, reduce to 88px at 900px and 72px at 760px. The spacing entries in frontmatter are observed recurring values, not a newly imposed mathematical scale. Four-column collection and product grids use 32px gaps, then 18px at 1150px. Products become two columns at 900px with 48px row gaps; collections become two columns at 760px. Mobile grids use 48px row and 20px column gaps. Image-to-caption spacing is 22px, descriptions follow names by 8px and prices follow card information by 16px. Product cards use `auto 1fr auto` grid rows so prices align across each row even when names or descriptions wrap.

The hero and story use paired columns on desktop. At 760px the hero places copy before photography, with wrapped actions; story and product detail become single columns. Commerce and checkout also stack at 760px. Checkout moves the order summary before the form, makes its final action full width and stacks all checkout address rows. Other two-column form rows stack at 380px.

Observed breakpoints: max-width 1150px, 900px, 760px and 380px; min-width 1600px adds hero side borders. The header destination control hides in the intermediate 761–900px range and returns compactly on mobile. Desktop navigation and the search icon yield to drawer navigation at 760px. Admin navigation wraps; tables scroll within their own container.

## Elevation & Depth

No box-shadow vocabulary is implemented. Depth comes from near-black and warm-surface fills, fine borders, photography and a translucent black modal scrim. The right-hand drawer overlays the sticky header; toast feedback sits above the drawer. Header, scrim, drawer and toast layers use z-index 30, 60, 61 and 80 respectively.

The scrim fades in over 0.2s. The drawer enters from the right over 0.35s with `cubic-bezier(0.16, 1, 0.3, 1)`. Most control transitions take 0.2s. Photographs scale to 1.035 over 0.6s with `cubic-bezier(0.2, 0.7, 0.2, 1)`. The hero portrait settles from scale 1.035 to 1 over 900ms; its headline arrives from 10px below and 0.75 opacity over 700ms. A 1px copper underline, 64% of the italic phrase width, draws over 700ms after a 180ms delay. These use `cubic-bezier(0.16, 1, 0.3, 1)` and run once. Selected action arrows shift 2px right and 2px up on hover or keyboard focus over 220ms with the same easing; buttons move 1px down while active. These decorative movements only run with `prefers-reduced-motion: no-preference`. Reduced motion removes hero animations and photo hover scaling, disables smooth scrolling and reduces other animation and transition durations to 0.01ms. Shopping content is visible without entrance animation.

## Shapes

Buttons, standard fields, drawers, image frames, summaries and status tags have square corners. Fine borders are generally 1px. Circles are local exceptions for color swatches and bag-count badges, not a general surface treatment. Collection and product images use a 4:5 portrait frame with clipped hover scaling. The mobile hero photograph uses a 1.12 aspect ratio.

## Components

### Buttons

Copper actions are compact, square and clear. The primary uses a copper fill and border, action-ink text, a 49px minimum height and frontmatter padding. Outline actions retain copper borders and text over a transparent fill; their hover fills light copper and changes text to near-black. The mobile hero action is a local 50px minimum-height variant with 14px by 22px padding. Disabled buttons use 0.4 opacity and a not-allowed cursor. Global keyboard focus is a 2px copper outline offset by 5px.

### Chips

The status tag is a square, fine-border label with copper 13px text and frontmatter padding. Variant-option buttons use explicit pressed state: length options gain copper boundaries, selected brown fill and copper text; color options gain a copper boundary. Do not infer new state colors.

### Cards / Containers

Product cards sit directly on the page ground, without outer card borders or shadows. A portrait image with a small square arrow action leads to DM Sans product naming, 14px detail text and a separate 16px price line with 13px bundle units. Mobile bundle units move below the price; card grid rows keep prices aligned. Order summaries use the warm surface and 36px padding on desktop, reducing to 28px at 900px and below. Their titles use DM Sans 24px/1.4. Quiet notes use the page ground, a decorative fine border and 20px padding. Keep price and bundle-unit information adjacent.

### Inputs / Fields

Standard fields use near-black fill, ivory text, square corners and the stronger control bronze stroke; hover changes the stroke to hover bronze. Focus changes the boundary to copper and adds a 1px copper outline with no offset. Labels precede the control with a 12px gap. Textareas resize vertically; selects retain native appearance. Inline errors use error peach and descriptive text. Mobile control text is 16px, and checkout address rows stack at 760px. Catalogue search and sorting are intentionally borderless local variants within the ruled toolbar.

### Navigation

The sticky near-black header has a fine bottom border, the supplied mark, copper wordmark and 14px desktop navigation. Current links use copper and a fine underline; hover uses copper. Mobile opens a right-hand dialog with 32px serif links and dividing rules. Icon controls retain accessible names; the bag count is a small copper circle.

### Destination Drawer

The destination/currency dialog is a warm-surface panel up to 460px wide with 36px by 40px padding, reduced to 420px and 28px by 24px padding on mobile. A black scrim dims the page. It contains labeled native selects, an explicit NGN charge note and one copper save action. It shares the same drawer primitive as mobile navigation, including a visible close control. The implementation uses Radix Dialog for modal behavior.

### Checkout and Private Administration

Checkout keeps destination-specific labels, optional fields, visible totals, inline errors and consent in the same visual system. Converted display prices remain labeled estimates; charge currency stays explicit. Production and transit are separate notes. Administration uses the shared typography, controls and colors with compact tables, ruled records, wrapped navigation and a restrained login form. It is a private working surface, not a second promotional identity.

## Do's and Don'ts

### Do:

- **Do** retain the supplied mark and approved near-black, ivory and copper identity.
- **Do** use control-border for standard input outlines and border for decorative separators.
- **Do** keep mobile inputs, selects and textareas at 16px and stack checkout address rows at the mobile breakpoint.
- **Do** keep destination, display currency and NGN charge currency legible within the ordinary shopping flow.
- **Do** use Lora for editorial headlines and DM Sans for shopping names, body copy, controls and form/summary titles.
- **Do** preserve 16px body copy, 14px shopping support text, 13px metadata and the responsive section spacing.
- **Do** keep the hero entrance and small arrow feedback restrained, and preserve keyboard focus, explicit labels, inline errors and reduced-motion behavior.
- **Do** keep private administration practical, with wrapped navigation and horizontally scrollable tables.

### Don't:

- **Don’t** substitute the decorative border for a standard input boundary.
- **Don’t** turn square buttons, cards or form fields into rounded pills; circles are reserved for swatches and the bag count.
- **Don’t** add decorative shadows or large hover movement to the flat surfaces.
- **Don’t** treat converted estimates as charge amounts or present sample photography, catalogue or shipping as approved live content.
- **Don’t** promote a development capture badge into the product’s design vocabulary.
