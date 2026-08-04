# Build brief: dedicated landing page for Stallside Meta ad (AU)

> **Implemented route:** `/lp/missed-sales`  
> **Components:** `src/components/lp/`  
> Use this doc for content, structure, and design review. Signup completion must remain on `/signup-complete` (existing pixels).

## 1. Purpose

Build a single-purpose landing page for paid traffic arriving from one Meta video ad targeting Australian roadside / honesty stall owners.

The page has exactly one job: **get the visitor to start a free Stallside account.**

It is not a homepage. It does not need to serve existing customers, job seekers, press, or people comparing plans in detail. Every element either moves someone toward signup or gets cut.

Current destination for this ad is `https://stallside.app` (the full marketing homepage). This brief replaces that destination.

---

## 2. Why we're building it

Three problems with sending this ad's traffic to the homepage:

1. **Page weight.** The homepage is a heavy Next.js build — interactive checkout demo, phone mockup, live analytics charts, payment-logo carousel, 16-question FAQ accordion. The audience is rural Australians, frequently on poor mobile reception, sometimes standing at the stall itself. Load time is a live suspect for drop-off.
2. **Exits.** The homepage nav offers About, Gallery, Testimonials, Pricing, Try Demo, and Owner login — six ways to leave before signing up.
3. **Cost hierarchy.** Fee structure (2.5% card fee, separate Stripe fees, absorb-or-pass-on) appears early and often. It's admirably transparent but it front-loads cost before the visitor has decided they want the product.

**Measured context:** the ad currently produces a high CTR at roughly $0.10 per click, but a low click-to-landing-page-view ratio. Traffic quality is not the problem. What happens after the click is.

---

## 3. Audience

Australian owners of unattended / honesty-box stalls. Concretely:

- Backyard egg sellers, small produce growers, flower and plant stalls
- Firewood and hay stacks by the road
- Camp supply boxes, community fridges, honesty car parks

Demographics from the ad set: Australia, ages 25–65, interests spanning homesteading, poultry farming, organic and sustainable agriculture, farmers' markets, local food, baking, and small business ownership.

**Assume about them:**

- Not technical. "QR code" is familiar; "Stripe Connect onboarding" is not.
- Running the stall alongside a job or a farm. Time-poor.
- Already operating on trust — the honesty box works for them. They are not looking to replace it.
- Sceptical of monthly software subscriptions.
- On a phone, on mobile data, possibly with one bar.

**Write for the person, not the category.** Say "your stall," not "unattended retail environments."

---

## 4. The ad this page must match

Message match is the single highest-leverage thing in this build. The visitor arrives with these exact words in their head. The page must feel like the obvious next screen.

**Primary text (live):**

> How many people drive past your honesty stall because they don't have cash?
>
> Stallside gives your stall its own QR code. Customers scan, choose what they're taking, and pay by cash, PayID or card + many other payment options.
>
> You get an alert the second something sells, and your stock count updates automatically.
>
> Pre-orders, restock alerts and your own branding are included from day one.
>
> No monthly fees. No terminal. No extra hardware.
>
> Cash and PayID are always free. For card payments, you only pay a small transaction fee when a sale is made.

**Headline:** Your Stall, Minus the Missed Sales

**Description:** Take payments, track stock and get instant sale alerts.

**CTA button:** Sign up

**Creative:** vertical video shot at a real roadside stall — weathered timber, hand-painted eggs sign. Deliberately lo-fi and unpolished. That texture is doing real work; the page should not feel like a slicker, more corporate place than the ad implied.

---

## 5. Hard constraints

These are not negotiable. Everything in section 6 is subordinate to these.

### Performance

The primary technical requirement. Target a rural Australian mobile connection, not office wifi.

- **LCP under 2.5s on a throttled 4G connection.** Test on Slow 4G in devtools, not on your laptop.
- **Total page weight under 500KB** on first load, images included.
- No client-side JS required to render above-the-fold content. Server-render or statically generate.
- Hero video: **poster image loads first, video is lazy-loaded and never autoplays with sound.** If the video costs more than ~150KB before interaction, use a static frame and let them tap to play.
- Every below-fold image lazy-loaded, correctly sized, modern format (WebP/AVIF), explicit `width`/`height` to prevent layout shift.
- System font stack, or at most one variable webfont subset to Latin. No font families loaded for a single heading.
- No carousels, no scroll-jacking, no parallax, no animation libraries.

### Structure

- **No navigation bar.** No header links. The logo may appear but must not link away.
- **One CTA, repeated.** Same wording every time. It goes to `https://stallside.app/signup`.
- **No footer link farm.** Legal minimum only: Terms, Privacy, Contact. Small, grey, bottom.
- Page should be readable end to end in under 90 seconds.

### Localisation

- Australian English throughout — "colour", "organised", "cheque".
- All prices in AUD, shown as `A$`.
- **PayID must be named explicitly.** It is Australia-specific, familiar to this audience, and free of Stallside fees. It is a genuine trust signal here in a way it isn't in other markets.
- Use Australian vernacular where natural — "roadside stall", "honesty box", "chooks" is acceptable in a testimonial but not in a headline.

---

## 6. Page structure

Build in this order. Sections marked **[required]** ship in v1; others can follow.

### 6.1 Hero **[required]**

**Headline:** lead with the missed sale. It is the ad's hook and the strongest thing in the whole proposition.

Recommended: *Your stall, minus the missed sales.*

Match the ad headline exactly unless you have a strong reason. Continuity beats cleverness here.

**Subhead:** one sentence, plain, covering what it is and what it costs.

Suggested: *Give your stall its own QR code so customers can pay by card, PayID or cash — even when nobody's there. Free to start, no monthly fee.*

**CTA:** primary button, above the fold on a 375px-wide viewport. Label: **Start free**.

**Supporting line under the CTA:** *No card details. No hardware. Prints on an A4 sheet.*

**Visual:** a still from the ad creative, or a photograph of a real stall with a QR poster on it. **Not** a polished 3D product render, not a floating phone mockup on a gradient. The ad promised a real stall by a real road.

### 6.2 The problem, named **[required]**

Three lines maximum. This is the emotional core and it should be almost uncomfortably specific.

Direction: someone stops, wants the eggs, has no cash, drives off. That's a sale you never knew you lost. It happens more than you think.

Resist explaining the product here. Just name the moment.

### 6.3 How it works **[required]**

Three steps. Numbered — the order is real information, so numbering is earned here.

1. **Print your QR** — one A4 poster per stall. Stick it up.
2. **They scan and pay** — no app, no account. Cash, PayID, card, Apple Pay or Google Pay.
3. **You get told instantly** — sale alert on your phone, stock count updates itself.

Keep each step to a headline and one line. If a step needs a paragraph, the product is being explained wrong.

### 6.4 Objection handling **[required]**

The single biggest objection is trust, and it is already the top FAQ on the homepage. Handle it head-on, high up, not buried in an accordion.

**"Won't people just scan and not pay?"**

The honest answer, roughly: the same reason your honesty box already works. People who stop at an unattended stall came to pay, not to dodge. Stallside doesn't replace that trust — it backs it up, because every sale is logged the moment it happens. And it catches the sales a cash tin quietly loses: the person with nothing smaller than a fifty.

Secondary objections, one line each:

- **Do I need a card machine?** No. A printer for the poster is all. Customers pay on their own phones.
- **Do I need to be there?** No. That's the point.
- **What if I'm not techy?** Print a sheet, stick it up. Setup is a few minutes on your phone.

### 6.5 What you get **[required]**

*(Revision 3 — two tiers with different visual weight. No feature grid, accordion, or expander.)*

**Tier 1 — the loop** (prominent; exactly three items):

- **They pay however they want** — cash, PayID, card, Apple Pay, Google Pay
- **You know instantly** — an alert on your phone the moment something sells
- **Stock looks after itself** — counts drop automatically, and you're warned before you run out

**Tier 2 — the depth** (quieter prose; subordinate):

Heading: *And a fair bit more.*

Body: Pre-orders with a collection day, so you know how much to bake before anyone turns up. Restock emails to the regulars who asked to hear. Your own logo and colours on the stall page and the poster. A running count of everyone who'd have paid by card, if you haven't switched card payments on yet.

Plus a good deal more as you grow into it.

Closing line, set apart: *All of it's on the free plan.*

### 6.6 Pricing **[required]**

Deliberately compressed. Do **not** reproduce the homepage's full pricing matrix.

Lead with: **Free plan. A$0 per month. Every feature.**

Then one clarifying line: cash and PayID are always free; card payments carry a small fee per sale.

Then a text link — *See full pricing* — to `https://stallside.app/#pricing`. This is the one permitted outbound link on the page, because hiding cost entirely damages trust with this audience more than the exit costs us.

Do not put the 2.5% figure, Stripe fee mechanics, or the Pro plan in the hero or mid-page. It is accurate and it belongs on the pricing page.

### 6.7 Social proof

Pull one or two testimonials from `https://stallside.app/testimonials`. Prefer an egg, produce, or firewood seller — closest to the ad's audience. Include a real name and location if available. Skip this section entirely rather than fabricate anything.

### 6.8 Closing CTA **[required]**

Restate the hook, restate the offer, repeat the button. Same label: **Start free**.

Do not introduce new information here.

---

## 7. Verified product facts

Sourced from `stallside.app` as of this brief. **Do not invent features, prices, or claims beyond this list.** If something is needed and isn't here, flag it rather than guessing.

**Plans**

| | Free | Pro |
|---|---|---|
| Monthly cost | A$0 | A$19.99 per site |
| Features | All | All |
| Stallside fee on card / Tap & Go / pay-later | 2.5% | None |
| Stallside fee on cash | None | None |
| Stallside fee on PayID | None | None |
| Stripe processing fees | Apply separately | Apply separately |

Pro becomes cheaper than Free at roughly A$800/month in card sales. Free-plan users can absorb the 2.5% or pass it to the customer at checkout.

**Payment methods:** Cash (customer self-confirms), PayID (AU only), PayTo (AU), card, Apple Pay, Google Pay, Link by Stripe, Klarna and Zip on larger orders.

**Features:** printable QR posters per stand; unlimited products with variants; live stock counts with availability bands (Available / Low stock / Sold out) shown publicly, exact counts private by default; sale and low-stock alerts by email and push; orders and inventory dashboard; pre-orders with order-by deadline and collection day; Collections tracking (Ready / Collected) with buyer messaging; customer restock notifications (owner never sees email addresses); stall branding with logo, colours and social links; card-demand counter for when Stripe isn't connected yet.

**Hardware:** none. A printer for the poster. Customers use their own phones. No terminal or card reader.

**Markets:** AU, US, UK, EU. This page is AU-only.

---

## 8. Tracking

Get this right before launch — the campaign optimises on the registration event and is currently working with very low conversion volume, so every lost signal materially hurts delivery.

- **Meta pixel ID `4334670276795300`** must fire `PageView` on load. Same pixel as the main site.
- The **`CompleteRegistration`** event must fire on successful signup. It fires downstream at `/signup`, so the handoff must not break it.
- **Preserve all query parameters** — `fbclid`, `utm_*`, and anything else — through to `/signup`. Do not strip them on redirect.
- Add a distinguishing UTM (e.g. `utm_content=lp-missed-sales`) so this page's performance is separable in analytics.
- Ensure the page domain is verified in Meta Business Manager and matches the campaign's conversion domain.
- Google tag / GA4 as per the main site, if present.

---

## 9. Design direction

Ground the design in the subject: hand-painted signs, weathered timber, gravel verges, honesty tins, chalkboard prices. The vernacular of a roadside stall is specific and underused — that's where a distinctive page comes from.

Two things to actively avoid:

**Don't out-polish the ad.** The creative is deliberately lo-fi and that's why it works. A glossy SaaS landing page creates a jarring mismatch at the exact moment of decision. Warm, plain, and slightly handmade beats sleek here.

**Don't reach for the default startup landing page.** Cream background, high-contrast serif, terracotta accent, floating phone mockup, three feature cards with circle icons — that combination is a template, not a choice, and this audience is unusually well-served by something that looks like it was made by a person.

Non-negotiable quality floor: responsive to 320px, visible keyboard focus states, `prefers-reduced-motion` respected, real text (never text baked into images), colour contrast meeting WCAG AA.

---

## 10. Out of scope

- The signup flow itself — unchanged, still `/signup`
- Any change to the ad creative or copy
- Pricing page, gallery, demo, testimonials pages
- A/B testing infrastructure. At current conversion volume there is no statistical power to test with; this page ships on judgment, not experiment.
- Non-AU variants

---

## 11. Acceptance checklist

Before this replaces the current destination:

- [ ] LCP under 2.5s on throttled Slow 4G
- [ ] Total first-load weight under 500KB
- [ ] Renders and is readable with JavaScript disabled
- [ ] No navigation bar; only permitted outbound links are pricing, Terms, Privacy, Contact
- [ ] CTA visible above the fold at 375px width
- [ ] Every CTA uses identical wording and points to `/signup`
- [ ] Meta pixel fires `PageView`; `CompleteRegistration` still fires downstream
- [ ] `fbclid` and UTM parameters survive the journey to `/signup`
- [ ] All prices in AUD; PayID named explicitly
- [ ] Australian English throughout
- [ ] Every product claim traceable to section 7
- [ ] Tested on a real phone on mobile data, not just devtools

---

## 12. Deployment note

**Do not switch the ad's destination URL while the ad set is in its learning phase.**

The campaign has recently reset learning and needs several clean days to accumulate signal. Changing the destination adds a variable that will make the results unreadable, and there's a good argument it's a significant enough edit to disturb delivery.

Build and stage the page now. Ship it live, then swap the ad's URL only once learning has completed and a stable cost per registration has been established.
