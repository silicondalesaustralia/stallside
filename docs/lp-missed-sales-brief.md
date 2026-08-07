# Vendl Meta Ad Landing Page Build Brief

> **Live route:** `/lp/missed-sales`  
> CTAs link to `/signup` (params preserved) → OTP → `/signup-complete` for conversion pixels. No signup modal in v1.

## Page

**Route:** `/lp/missed-sales`  
**Primary objective:** Create a Vendl account  
**Traffic source:** Cold Meta traffic from the “AU New Video” ad  
**Primary audience:** Australian farm-stall, roadside-stall, honesty-box and small unattended-stall owners  
**Primary CTA:** `Start free`  
**Secondary CTA:** `See how it works` — scrolls to the three-step product section  
**Conversion rule:** One page, one goal. Do not send visitors into the main site unless they deliberately use a small footer link.

---

# 1. Conversion Strategy

The landing page must continue the exact conversation started by the ad:

> Customers drive past because they do not have cash.

The page should immediately show that Vendl fixes this with:

- One printable QR code
- No customer app
- Card, Apple Pay, Google Pay, PayID and cash
- Instant sale alerts
- Automatic stock updates
- No terminal or extra hardware
- A$0 monthly on Free

Do not lead with broad product positioning such as “the operating system for farm stalls”. Cold Meta visitors need a fast, concrete answer to:

1. What is this?
2. How does it stop missed sales?
3. Is it easy?
4. What does it cost?
5. Can I trust it?
6. What happens when I click?

The page should be substantially shorter and more focused than the homepage.

---

# 2. Recommended Page Length

Aim for approximately **7 concise sections**, plus the footer:

1. Minimal header
2. Hero
3. Payment-method trust strip
4. Three-step “how it works”
5. Product proof / owner outcome section
6. Objection handling
7. Pricing reassurance and final CTA

Avoid turning the page into a full product catalogue. Features such as pre-orders, restock emails and custom branding can appear as compact supporting benefits, not full standalone sections.

---

# 3. Visual Direction

## Overall Look

The page should feel:

- Modern
- Premium but approachable
- Rural without looking rustic or old-fashioned
- Product-led
- Mobile-first
- Fast and uncluttered

Use the existing Vendl visual system from the homepage, but simplify it for conversion.

## Visual Style

Use:

- Large rounded cards
- Soft shadows
- Generous whitespace
- Subtle gradients
- Light green-tinted backgrounds
- Strong dark-green headings
- Warm amber accents from the Vendl logo
- Real product UI mock-ups
- Crisp payment icons
- Simple line icons
- Subtle motion only where it helps explain the product

Avoid:

- Heavy farm textures
- Timber backgrounds
- Cartoon farm illustrations
- Long blocks of centred copy
- Excessive badges
- Multiple competing colours
- Generic stock photography in every section
- Large navigation menus
- Carousels
- Auto-playing audio

## Suggested Palette

Reuse the actual Vendl brand tokens where available. If the current codebase does not expose them, use these as a close fallback:

- Deep green: `#123D2A`
- Primary green: `#1F6A45`
- Soft green: `#EAF4ED`
- Amber: `#E7A62B`
- Soft amber: `#FFF4D8`
- Ink: `#17211B`
- Muted text: `#647168`
- Border: `#DCE7DF`
- Off-white: `#F8FAF8`
- White: `#FFFFFF`

## Typography

Use the same fonts as the homepage. If unavailable:

- Headings: `Manrope`, `Inter`, or the existing display font
- Body: `Inter` or the current site body font

Recommended sizes:

- Desktop H1: `clamp(3rem, 5vw, 5rem)`
- Mobile H1: `2.4rem–2.8rem`
- Section H2: `clamp(2rem, 3vw, 3.25rem)`
- Body: `1rem–1.125rem`
- Buttons: `1rem`, semibold

---

# 4. Header

## Layout

Use a very slim header.

**Left:** Vendl logo  
**Right:** Primary CTA button

Do not include the full homepage navigation.

### Desktop

- Max width: `1200px`
- Height: approximately `72px`
- Logo left
- Small reassurance text near CTA: `A$0 monthly on Free`
- CTA: `Start free`

### Mobile

- Height: approximately `64px`
- Logo left
- Compact CTA right: `Start free`

## Header Copy

**Reassurance:**  
`A$0 monthly on Free`

**Button:**  
`Start free`

## Header Behaviour

- Sticky after the visitor scrolls beyond the hero CTA
- White or slightly translucent background
- Backdrop blur
- Fine bottom border
- Do not animate aggressively

---

# 5. Hero Section

## Conversion Goal

The hero must answer the ad’s question immediately and make the solution visually obvious before the visitor scrolls.

## Desktop Layout

Two-column layout:

- Left: headline, supporting copy, CTA, reassurance
- Right: layered product composition

Recommended split:

- Copy: 52%
- Visual: 48%

The hero should fit mostly within the first viewport on a common laptop.

## Mobile Layout

Order:

1. Eyebrow
2. H1
3. Supporting copy
4. CTA
5. Reassurance
6. Payment icons
7. Product visual

Do not push the CTA below a large image on mobile.

## Hero Copy

### Eyebrow

`Built for unattended stalls`

### H1

# Stop losing sales when customers don’t have cash.

### Supporting Copy

Give your stall one QR code so customers can choose what they are taking and pay on their phone — even when nobody is there.

### Primary CTA

`Start free`

### CTA Microcopy

`No card details · No terminal · Setup takes minutes`

### Optional Text Link

`See how it works ↓`

Do not use two equal-weight buttons.

## Hero Benefit Chips

Show three compact chips beneath the CTA or integrated beside the visual:

- `A$0 monthly on Free`
- `No customer app`
- `Instant sale alerts`

## Hero Visual

Create a clean, layered product demonstration rather than using a generic image alone.

Recommended composition:

1. A real roadside egg or produce stall photo as the base
2. A clearly visible Vendl QR poster attached to the stall
3. A customer phone mock-up showing:
   - stall name
   - product selection
   - payment options
4. A smaller owner-phone notification:
   - `New sale · A$12.00`
   - `Green Valley Eggs`
5. A compact stock badge:
   - `Dozen eggs: 8 left`

The visual should communicate the entire loop:

**Scan → choose → pay → owner notified**

Use gentle floating motion on desktop only. Disable or simplify for reduced-motion users.

---

# 6. Payment Trust Strip

Place directly under the hero.

## Purpose

Cold visitors need to immediately recognise familiar payment options. This should look polished and credible, not like a long feature section.

## Layout

A full-width rounded strip within the page container.

### Intro Copy

`Let customers pay the way they already prefer`

### Icons

Use official or existing site assets for:

- Cash
- PayID
- Visa
- Mastercard
- American Express
- Apple Pay
- Google Pay
- Link

Zip and Klarna may be omitted from this campaign landing page unless they are central to the target stall type. Keeping the strip concise is more valuable than showing every possible method.

### Supporting Line

`No card reader. Payments happen on the customer’s phone.`

## Mobile Behaviour

- Horizontally scrollable icon row or wrapped two-line layout
- No tiny icons
- Ensure PayID is visible without needing to scroll if the campaign is Australian

---

# 7. Problem-to-Outcome Section

## Layout

A short, high-contrast section with one strong idea.

Use a soft amber or pale green card.

## Copy

### Small Label

`The sale you never see`

### Heading

## Someone stops. Wants the eggs. Has no cash. Drives off.

### Body

That is a sale your cash tin cannot record. Vendl gives them another way to pay before they leave — without adding a terminal, staff member or complicated checkout.

### Supporting Proof Points

- `One QR poster per stall`
- `Customers use their own phone`
- `You are alerted as soon as they confirm or pay`

## Design

Use a simple left-to-right visual sequence:

`Stops at stall` → `Scans QR` → `Pays` → `You get the sale`

On mobile, stack vertically.

---

# 8. How It Works

## Heading

## Up and running in three simple steps

## Supporting Copy

Print the QR, place it at your stall and let Vendl handle the rest.

## Three Cards

### Card 1

**Number:** `01`

**Title:**  
`Print your stall QR`

**Copy:**  
Create your stall, add what you sell and print the ready-made A4 poster.

**Visual:**  
QR poster preview or printer icon.

---

### Card 2

**Number:** `02`

**Title:**  
`Customers scan and pay`

**Copy:**  
They choose what they are taking and pay by cash, PayID, card, Apple Pay or Google Pay. No app or account required.

**Visual:**  
Customer checkout phone UI.

---

### Card 3

**Number:** `03`

**Title:**  
`You know instantly`

**Copy:**  
You receive a sale alert, the order is logged and your available stock updates automatically.

**Visual:**  
Owner notification and stock counter.

## Section CTA

`Create my free stall`

### Microcopy

`No card details required`

---

# 9. Product Proof Section

## Goal

Show that this is a real, complete product without adding too much page length.

## Desktop Layout

Large product-dashboard visual on one side and concise outcome copy on the other.

Alternate the image direction from the hero.

## Copy

### Eyebrow

`More than a payment QR`

### Heading

## Know what sold, what is left and when to restock.

### Body

Every confirmed sale appears in your Vendl dashboard. Stock counts fall automatically, and low-stock alerts help you restock before the next customer arrives.

### Compact Benefit List

Use tick icons:

- Instant sale notifications
- Live stock counts
- Low-stock warnings
- Orders and sales history
- Pre-orders for collection days
- Restock notifications for regular customers

### Supporting Note

`Every feature is included on Free. Pro only changes the Vendl card fee.`

## Visual

Use an actual dashboard mock-up showing:

- Revenue
- Orders
- Product stock
- Recent sales
- Low-stock alert

Do not use made-up metrics that could look like a customer claim. Label mock data as `Example dashboard` if necessary.

---

# 10. Trust and Objection Section

## Heading

## Made for the way honesty stalls already work

## Intro

Vendl does not replace the trust behind your stall. It gives honest customers more ways to pay and gives you a clearer record of what was taken.

## Objection Cards

Use three accordion items on mobile and three compact cards on desktop.

### Objection 1

**Question:**  
`Do I need a card machine?`

**Answer:**  
No. Customers pay on their own phones. You only need to print and display your Vendl QR poster.

---

### Objection 2

**Question:**  
`Do customers need an app?`

**Answer:**  
No. They scan the QR with their phone camera, choose what they are taking and pay in their browser.

---

### Objection 3

**Question:**  
`What if I’m not technical?`

**Answer:**  
Setup is designed to take only a few minutes. Add your products, print the poster and place it at your stall.

---

### Objection 4

**Question:**  
`Won’t people just scan and not pay?`

**Answer:**  
Vendl works with the same honesty your stall already relies on. It makes paying easier for customers who intended to pay but arrived without enough cash, and logs each confirmed sale immediately.

Keep this answer calm and practical. Do not over-defend the product.

---

# 11. Testimonial Section

Use the existing genuine testimonial, presented more cleanly.

## Layout

One strong testimonial only. Avoid a fake-looking multi-review carousel.

## Copy

> “It was all so easy and fast to set up — your 10-minute setup was generous. I did it all in about three!”

**Attribution:**  
`Marnie · Melbourne, Australia`

Optional supporting quote in smaller type:

> “I was keen to try something that didn’t have so many fees — like PayID.”

Only use this quote if it remains approved and accurately attributed.

## Design

- Rounded white card
- Small five-star visual only if an actual five-star rating was given
- Otherwise do not add stars
- Include a subtle Australian location marker
- Do not use a stock headshot

---

# 12. Pricing Reassurance

## Goal

Remove cost anxiety without turning the page into a pricing comparison page.

## Layout

A concise dark-green or softly tinted pricing card.

## Copy

### Eyebrow

`Start without a monthly bill`

### Heading

## Free is A$0 per month — with every Vendl feature.

### Body

Cash and PayID have no Vendl platform fee. On the Free plan, successful card, Tap & Go and pay-later transactions carry a 2.5% Vendl fee, plus standard Stripe processing fees.

You can absorb the Vendl fee or pass it on to customers at checkout. Upgrade to Pro later to remove the Vendl fee.

### Included List

- Unlimited products and options
- Printable QR poster
- Cash and PayID
- Card, Apple Pay and Google Pay
- Sale and low-stock alerts
- Inventory and order tracking
- Pre-orders
- Stall branding

### Primary CTA

`Start free`

### Microcopy

`No card details · Cancel nothing · Upgrade only when it suits you`

## Pricing Link

Small text link beneath the card:

`See full pricing`

This may link to the homepage pricing anchor or dedicated pricing page, but it must not compete visually with the signup CTA.

---

# 13. Final CTA Section

## Design

Use a strong, simple closing block with a dark-green background and a subtle Vendl QR pattern or blurred farm-stall image.

## Copy

### Heading

## Your stall, minus the missed sales.

### Supporting Copy

Set up your QR checkout in minutes and give every customer a way to pay.

### Primary CTA

`Create my free stall`

### Reassurance

`A$0 monthly on Free · No terminal · No card details`

---

# 14. Footer

Keep the footer minimal.

Include:

- Vendl logo
- `Pricing`
- `Terms`
- `Privacy`
- `Contact`
- `Owner login`

Do not include all homepage navigation links.

---

# 15. Mobile Sticky CTA

Show after the hero CTA scrolls out of view.

## Layout

Sticky bottom bar:

- Left: `A$0/mo on Free`
- Right: `Start free`

Respect safe-area insets on iPhone.

Do not show the sticky bar while:

- The signup form is open
- The user is already within the final CTA section
- A cookie or consent interface would overlap it

---

# 16. Signup Behaviour

The primary CTA should take the visitor directly to the shortest available account-creation flow.

Preferred options, in order:

1. Open a focused signup modal or drawer without leaving the landing page
2. Link directly to the owner signup route
3. Link to the main signup page with campaign parameters preserved

Do not link the primary CTA to the homepage.

## Recommended First-Step Fields

Keep the first step minimal:

- Email
- Password, or passwordless magic link
- Country preselected to Australia for this campaign

Ask for stall name, products, payment setup and branding after account creation.

Do not require Stripe connection before account creation.

## Signup Button Copy

Use:

`Create free account`

Avoid:

- Submit
- Register
- Get started now
- Start your journey

## Signup Reassurance

`No card details required. Set up your stall before connecting payments.`

---

# 17. Ad-to-Page Message Match

The landing page must preserve these specific messages from the Meta ad:

| Ad promise | Landing-page treatment |
|---|---|
| Customers drive past without cash | Hero headline |
| Stall gets its own QR code | Hero visual and first “how it works” step |
| Cash, PayID and card options | Hero/payment strip |
| Instant alerts | Hero mock-up and product proof |
| Stock updates automatically | Hero stock badge and proof section |
| Pre-orders and restock alerts | Compact benefit list |
| Own branding | Included in pricing list, not a full section |
| No monthly fee | Hero chip, header reassurance and pricing section |
| No terminal or extra hardware | Hero microcopy and objection section |
| Small transaction fee only on a sale | Pricing section with exact wording |

---

# 18. Copy Rules

## Tone

Use Australian English.

The tone should be:

- Direct
- Practical
- Friendly
- Plain-spoken
- Confident without hype

## Preferred Language

Use:

- stall
- roadside stall
- honesty stall
- customer
- scan
- pay
- sale alert
- stock
- print
- free to start

Avoid:

- omnichannel
- frictionless commerce
- merchant ecosystem
- monetise
- revolutionary
- seamless solution
- transform your business
- unlock growth
- supercharge

## Sentence Length

Keep most paragraphs to two or three sentences. Avoid long text blocks.

---

# 19. Next.js Implementation

## Suggested Component Structure

```text
app/
  lp/
    missed-sales/
      page.tsx
      metadata.ts
      components/
        LandingHeader.tsx
        HeroSection.tsx
        PaymentMethodsStrip.tsx
        MissedSaleSection.tsx
        HowItWorks.tsx
        ProductProof.tsx
        ObjectionSection.tsx
        TestimonialCard.tsx
        PricingReassurance.tsx
        FinalCTA.tsx
        MobileStickyCTA.tsx
```

Reuse existing homepage components and assets where practical, especially:

- Vendl logo
- Payment icons
- Customer checkout UI
- Owner notification UI
- Dashboard UI
- QR poster
- Existing buttons and design tokens

Do not import the full homepage navigation or footer.

## Rendering

Use a server component for the page shell. Use client components only for:

- Sticky CTA visibility
- Accordion behaviour
- Signup modal
- Small, purposeful animations
- Tracking events

## Images

Use `next/image`.

Requirements:

- Correct width and height
- Responsive `sizes`
- Hero image priority
- WebP or AVIF where supported
- Avoid large uncompressed screenshots
- Use actual UI assets at readable sizes

## Performance Targets

Aim for:

- LCP under 2.5 seconds on mobile
- CLS under 0.1
- Minimal client-side JavaScript
- No background video in the hero
- No autoplay carousel
- No blocking third-party scripts beyond required tracking

---

# 20. Motion

Use subtle motion only:

- Hero notification enters once
- Stock count changes once
- Cards rise slightly on hover
- Payment strip may fade in

Respect `prefers-reduced-motion`.

Do not use:

- Continuous bouncing buttons
- Rotating payment logos
- Auto-scrolling review carousels
- Large parallax effects
- Delayed entrance animations that hide key content

---

# 21. Tracking

Preserve Meta campaign parameters through signup.

## Recommended URL Parameters

Use a consistent campaign structure, for example:

```text
utm_source=facebook
utm_medium=paid_social
utm_campaign=stallside_complete_rego
utm_content=au_new_video
```

Do not use placeholder parameters such as `key1=value1`.

## Required Events

### Page View

- `PageView`
- GA4 `page_view`

### Primary CTA Click

Event: `landing_signup_click`

Parameters:

- `placement`: `header`, `hero`, `how_it_works`, `pricing`, `final`, `mobile_sticky`
- `campaign`: `stallside_complete_rego`
- `creative`: `au_new_video`

### Signup Started

- Meta standard event: `Lead` or the current signup-start event
- GA4: `sign_up_start`

### Signup Completed

- Meta standard event: `CompleteRegistration`
- GA4: `sign_up`

### Secondary Events

- `landing_how_it_works_click`
- `landing_pricing_click`
- `landing_objection_open`
- `landing_signup_modal_open`

Avoid firing `CompleteRegistration` on button click. Fire it only after account creation succeeds.

---

# 22. Accessibility

- One H1 only
- Logical heading order
- Minimum AA colour contrast
- 44px minimum tap targets
- Visible keyboard focus states
- Descriptive alt text for informative visuals
- Empty alt text for decorative images
- Accessible accordion semantics
- Do not rely on colour alone
- Payment logos must have accessible names
- Signup errors must be announced and placed beside the relevant fields

---

# 23. SEO and Indexing

This is a paid-campaign landing page, so organic discovery is secondary.

Recommended metadata:

```ts
export const metadata = {
  title: "Stop Missing Farm Stall Sales | Vendl",
  description:
    "Give your unattended stall a QR checkout so customers can pay by cash, PayID, card, Apple Pay or Google Pay. Start free with no terminal.",
  robots: {
    index: false,
    follow: true,
  },
};
```

Add a self-referencing canonical only if this route is intentionally indexable. Otherwise use `noindex,follow`.

---

# 24. Content to Remove From the Current Landing Page

Remove or redesign:

- The large standalone fear-based paragraph immediately after the hero
- Dense prose about honesty and non-payment
- Long feature lists without product visuals
- Repetitive “free” claims without clear fee disclosure
- Broad homepage-style messaging
- Any large navigation menu
- Multiple competing CTA labels
- Generic image placement that does not explain the product
- The weak transition from problem to “how it works”
- Any text-only section that can be shown more clearly through UI
- Any footer links that distract from signup

Retain the useful core ideas, but present them through a more polished product-led page.

---

# 25. Exact Final Copy — Condensed Page Version

This is the recommended copy in page order.

---

## Header

**Reassurance:**  
A$0 monthly on Free

**CTA:**  
Start free

---

## Hero

**Eyebrow:**  
Built for unattended stalls

# Stop losing sales when customers don’t have cash.

Give your stall one QR code so customers can choose what they are taking and pay on their phone — even when nobody is there.

**CTA:**  
Start free

**Microcopy:**  
No card details · No terminal · Setup takes minutes

**Text link:**  
See how it works ↓

**Benefit chips:**

- A$0 monthly on Free
- No customer app
- Instant sale alerts

---

## Payment Strip

**Heading:**  
Let customers pay the way they already prefer

**Methods:**  
Cash · PayID · Visa · Mastercard · American Express · Apple Pay · Google Pay · Link

**Supporting copy:**  
No card reader. Payments happen on the customer’s phone.

---

## Missed-Sale Section

**Label:**  
The sale you never see

## Someone stops. Wants the eggs. Has no cash. Drives off.

That is a sale your cash tin cannot record. Vendl gives them another way to pay before they leave — without adding a terminal, staff member or complicated checkout.

- One QR poster per stall
- Customers use their own phone
- You are alerted as soon as they confirm or pay

---

## How It Works

## Up and running in three simple steps

Print the QR, place it at your stall and let Vendl handle the rest.

### 01 — Print your stall QR

Create your stall, add what you sell and print the ready-made A4 poster.

### 02 — Customers scan and pay

They choose what they are taking and pay by cash, PayID, card, Apple Pay or Google Pay. No app or account required.

### 03 — You know instantly

You receive a sale alert, the order is logged and your available stock updates automatically.

**CTA:**  
Create my free stall

**Microcopy:**  
No card details required

---

## Product Proof

**Eyebrow:**  
More than a payment QR

## Know what sold, what is left and when to restock.

Every confirmed sale appears in your Vendl dashboard. Stock counts fall automatically, and low-stock alerts help you restock before the next customer arrives.

- Instant sale notifications
- Live stock counts
- Low-stock warnings
- Orders and sales history
- Pre-orders for collection days
- Restock notifications for regular customers

**Supporting note:**  
Every feature is included on Free. Pro only changes the Vendl card fee.

---

## Objections

## Made for the way honesty stalls already work

Vendl does not replace the trust behind your stall. It gives honest customers more ways to pay and gives you a clearer record of what was taken.

### Do I need a card machine?

No. Customers pay on their own phones. You only need to print and display your Vendl QR poster.

### Do customers need an app?

No. They scan the QR with their phone camera, choose what they are taking and pay in their browser.

### What if I’m not technical?

Setup is designed to take only a few minutes. Add your products, print the poster and place it at your stall.

### Won’t people just scan and not pay?

Vendl works with the same honesty your stall already relies on. It makes paying easier for customers who intended to pay but arrived without enough cash, and logs each confirmed sale immediately.

---

## Testimonial

> “It was all so easy and fast to set up — your 10-minute setup was generous. I did it all in about three!”

Marnie · Melbourne, Australia

---

## Pricing

**Eyebrow:**  
Start without a monthly bill

## Free is A$0 per month — with every Vendl feature.

Cash and PayID have no Vendl platform fee. On the Free plan, successful card, Tap & Go and pay-later transactions carry a 2.5% Vendl fee, plus standard Stripe processing fees.

You can absorb the Vendl fee or pass it on to customers at checkout. Upgrade to Pro later to remove the Vendl fee.

- Unlimited products and options
- Printable QR poster
- Cash and PayID
- Card, Apple Pay and Google Pay
- Sale and low-stock alerts
- Inventory and order tracking
- Pre-orders
- Stall branding

**CTA:**  
Start free

**Microcopy:**  
No card details · Upgrade only when it suits you

**Text link:**  
See full pricing

---

## Final CTA

## Your stall, minus the missed sales.

Set up your QR checkout in minutes and give every customer a way to pay.

**CTA:**  
Create my free stall

**Reassurance:**  
A$0 monthly on Free · No terminal · No card details
