---
name: CRAFT
description: A Saint Petersburg barbershop landing page built as documentary streetwear editorial — real work, not a styled set.
colors:
  ink: "#1C1114"
  ink-soft: "#4A3A3D"
  ink-faint: "#7C6B6D"
  paper: "#F3EEE6"
  paper-dim: "#EAE2D3"
  paper-deep: "#E0D5C3"
  accent: "#3C5A48"
  accent-dark: "#2C4436"
typography:
  display:
    fontFamily: "Unbounded, Arial Narrow, sans-serif"
    fontSize: "clamp(2.1rem, 6vw + 1rem, 6rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Unbounded, Arial Narrow, sans-serif"
    fontSize: "clamp(1.9rem, 2.4vw + 1.1rem, 2.75rem)"
    fontWeight: 800
    lineHeight: 0.98
  body:
    fontFamily: "Golos Text, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Golos Text, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  1: "0.5rem"
  2: "0.875rem"
  3: "1.5rem"
  4: "2.25rem"
  5: "3.5rem"
  6: "5.5rem"
  7: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.95em 1.7em"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.95em 1.7em"
---

# Design System: CRAFT

## Overview

**Creative North Star: "The Documentary Lookbook"**

CRAFT is proven through real work, not styled around it. The system borrows the grammar of a contemporary Russian menswear lookbook — the documentary-editorial register Saint Petersburg's own fashion export made internationally recognizable — rather than the salon-spa or barber-pole vocabulary the category defaults to. Raw, unglamorized photography; oversized cropped type; a disciplined, slightly off-kilter grid; a palette that stays almost achromatic so the one accent color reads as a decision, not a theme.

The system was chosen through Impeccable's direction-seed process (a structural randomizer meant to break the model's own "safe default" habit) and confirmed by the client over a dice-assigned alternative and two catalog challengers. Its explicit anti-references are the generic black-and-gold luxury barbershop template, barber-pole and scissors iconography, glassmorphism, decorative gradients, and same-size icon-card grids — all rejected as the category's rut, not merely "not chosen."

Density is low and confident: long stretches of quiet paper-toned space between a small number of fully committed moments (the full-bleed hero photograph, the asymmetric gallery mosaic, the dark proof/final-CTA bands). Nothing is decorated for its own sake — no shadows, no rounded corners, no gradients, no glass. What reads as "premium" here is restraint and precision, not ornament.

**Key Characteristics:**
- Flat ink-on-paper throughout — zero border-radius, zero box-shadow, by invariant, not oversight.
- One accent color, used sparingly and always at full saturation — never diluted into a tint or wash.
- Every headline, list, and stat aligns to the same shared content margin as the header — no element sits closer to the frame edge than another.
- Lists over cards: services, reviews, and hours are typographic rows with hairline rules, never bordered tiles.
- Real client photography (hero, team, gallery) is duotone-graded to match the system; three of the gallery's nine slots remain clearly-labeled placeholders pending the last work-example shots.
- The gallery mosaic assigns each slot an aspect ratio that matches its photo's orientation: 2×2 desktop cells resolve to 3:4 portrait, the 4-column bands to ~3:2 landscape. New photography is commissioned to those ratios rather than cropped against them.

## Colors

The palette is almost achromatic on purpose — one near-black warm ink, one warm paper ground, and a single sparing green accent drawn from the shop's own real interior color (paired with a desaturated near-black burgundy standing in for the second, to avoid the gold-luxury cliché a literal burgundy+gold pairing would read as).

### Primary
- **Overworked Green** (`#3C5A48`): the only saturated color in the system. Reserved for the booking CTA, active/hover states, the hours "stamp," and hairline accents on hover. Never used as a background field or fill larger than a button.

### Neutral
- **Near-Black Burgundy** (`#1C1114`): primary text color and the dominant "ink" — desaturated hard enough to read as near-black at a glance, so it never drifts toward the gold-luxury cliché. Also the fill for dark bands (proof strip, final CTA, footer border).
- **Ink Soft** (`#4A3A3D`): secondary/body text on paper — tinted from the ink hue rather than a neutral gray, per the system's contrast rule.
- **Ink Faint** (`#7C6B6D`): tertiary text — captions, micro-labels, placeholder notes.
- **Paper** (`#F3EEE6`): primary ground and text-on-dark color.
- **Paper Dim** (`#EAE2D3`): alternating section ground (Why CRAFT, Gallery, Reviews) — one step warmer/deeper than Paper, used to separate sections without a rule or shadow.
- **Paper Deep** (`#E0D5C3`): placeholder-image and map-placeholder fill.

### Named Rules
**The One-Ink Rule.** Exactly one saturated color exists in this system. If a second accent is ever needed, desaturate it until it reads as a neutral, or don't ship it.

## Typography

**Display Font:** Unbounded (variable, 700–900), stack `'Unbounded', 'Golos Text', 'Arial Narrow', sans-serif`
**Body Font:** Golos Text (variable, 400–700), stack `'Golos Text', 'Segoe UI', sans-serif`

**Character:** Unbounded is a bold, geometric grotesk with unusually confident, slightly industrial letterforms — it carries the "editorial/industrial" brief without leaning on any of the training-data-default display faces. Golos Text is a clean, quietly professional Cyrillic-native workhorse that never competes with the display face. Both ship as self-hosted woff2 from `public/assets/fonts/`, never from fonts.googleapis.com and never as a system-font fallback in production: the third-party stylesheet put a DNS + TLS handshake in front of first paint, and it handed every visitor's IP to Google, which is a cross-border transfer of personal data under 152-ФЗ. Only the subsets the page renders are shipped — `latin` and `cyrillic` for both faces, plus Golos Text's `latin-ext`.

**Why Golos Text sits inside the display stack.** Unbounded's `latin-ext` subset weighs 118 KB and the only glyph the page needs from it is the ruble sign, which its `latin` subset does not carry. That subset is deliberately not shipped; `₽` falls through to Golos Text's `latin-ext` (19 KB), which does carry U+20BD and sets alongside Unbounded's figures without the download. Any new face added to this system inherits the same rule: ship the subsets the page renders, and let the stack cover the orphan glyph.

### Hierarchy
- **Display** (800, `clamp(2.1rem, 6vw + 1rem, 6rem)`, line-height 0.98): hero headline only. Uppercase, tight tracking (-0.02em), aligned to the same content margin as the header and every other section — never inset differently from its neighbors. The final-CTA headline uses a dedicated smaller display clamp (`clamp(1.55rem, 4vw + 0.6rem, 5.1rem)`) sized specifically so the longest real copy on the page ("Записывайтесь.") never breaks mid-word.
- **Headline** (800, `clamp(1.9rem, 2.4vw + 1.1rem, 2.75rem)`, line-height 0.98): section titles (`Услуги`, `Почему CRAFT`, `О нас`, `Галерея`, `Отзывы`, `Контакты`). Never preceded by a kicker/eyebrow label — the heading carries its own weight.
- **Title** (700–900, 1.1–2rem): mid-weight numerals and marks that sit between Headline and Body — the wordmark, proof-strip/about stat values, primary-service price emphasis. Not a fluid role; picked per-component from this range.
- **Body** (400, 1rem, line-height 1.6): all running copy. Measure capped at 62ch.
- **Label** (700, 0.875rem, uppercase, letter-spacing 0.02em): buttons, nav links, review/rating meta.
- **Micro** (600–700, 0.6–0.75rem, uppercase, wide tracking): the smallest role — wordmark sub-label, proof-strip/about-stat captions, review dates.

### Named Rules
**The No-Kicker Rule.** No section heading is ever preceded by a small tracked label above it. This is a hard ban carried over from the craft floor, not a style preference.

## Layout

Mobile-first, single-column base with generous vertical rhythm (padding-block scale from 2.25rem to 8rem via the spacing tokens). Section grounds alternate between Paper and Paper Dim to create rhythm without rules or shadows. Two structural breakpoints: 640px (tablet — two-column gallery, wider section padding) and 1024px (desktop — six-column hand-placed asymmetric gallery grid, full primary nav, header CTA). Content is capped at a 76rem (1216px) container, with the hero and gallery grid alone permitted to run full-bleed edge-to-edge.

**The gallery grid is hand-placed, not auto-flowed.** Explicit `nth-child` grid-column/row assignments produce a resolved asymmetric mosaic (one tall portrait, one wide landscape, two squares, one wide, one square) — CSS Grid's automatic placement was tried and produced unresolved gaps and overlapping tracks; every future gallery-like grid in this system should be hand-placed the same way rather than trusting `grid-auto-flow`.

## Elevation & Depth

Flat by invariant. No `box-shadow` exists anywhere in the system. Depth and separation are conveyed entirely through flat ground-color changes (Paper / Paper Dim / Ink) and hairline rules (`rgba(28,17,20,0.16)` and `0.32` alpha steps of ink), never through elevation, blur, or glass.

### Named Rules
**The Flat-Ink Rule.** If a component seems to need a shadow to separate from its background, change the ground color or add a hairline rule instead. Shadows are not part of this system's vocabulary.

## Shapes

Square-cornered throughout — `border-radius` is `0px` on every element in the system, including buttons, inputs, and the placeholder image frames. Borders are hairline (1px) and used sparingly: as section-alternation cues, list-row dividers, and the price-list's dotted leader rule. The one deliberate exception is the **stamped stub** — the opening-hours value (`.stub`) is rendered in a dashed border, rotated -1.6°, evoking a punched ticket rather than a data field. It is the system's single ornamental gesture and should not be reused elsewhere without a reason as specific as this one.

## Components

### Buttons
- **Shape:** square corners (0px), inline-flex, uppercase label, 0.02em tracking.
- **Primary** (`.btn--accent`): Accent (`#3C5A48`) fill, Paper text, padding `0.95em 1.7em`. Hover/focus darkens to `#2C4436`; active scales to 0.98.
- **Outline** (`.btn--outline`): transparent fill, Ink text, hairline-strong border. Hover/focus inverts to solid Ink fill with Paper text.

### Price List / Review List (signature pattern)
Both services and reviews are set as typographic lists with hairline row dividers — never as bordered cards or tiles. The price list additionally uses a dotted leader rule (`border-bottom: 2px dotted`) between item name and price, ledger-style. The two primary services (`Мужская стрижка`, `Стрижка + борода`) step up in size and weight and take the Accent color on their price — the system's method for emphasis-without-a-card.

### The Stamped Stub (signature component)
`.stub`: `border: 1px dashed currentColor`, `transform: rotate(-1.6deg)`, tabular numerals. Used exactly twice (proof strip, contacts) for the shop's opening hours — the one place in the system where a physical, slightly imperfect artifact stands in for a plain data field.

### Cookie Consent Banner
Bottom-anchored bar on the Ink ground, square corners, hairline top edge — the same surface vocabulary as the proof strip and the closing CTA, so it reads as part of the page and not as a platform overlay. Not a modal: nothing here blocks reading, because the decision is not large enough to justify trapping the visitor in it.

Three rules it must keep:
- **Both answers are equal.** "Принять" (`.btn--accent`) and "Отклонить" (`.btn--on-ink`) are the same size, the same distance from the text, and equally legible. Declining is a state the page honours, not a dialog that returns next visit.
- **It never covers the booking CTA.** Above the sticky bar on mobile (`bottom: var(--sticky-cta-h)`), and while a decision is outstanding `html.consent-pending` lifts `.hero__content` by the banner's measured height so the hero's own CTA stays clear. `--sticky-cta-h` and `--cookie-banner-h` are both measured in JS; the CSS values are pre-script fallbacks.
- **`.cookie-banner[hidden]` must stay in the stylesheet.** The component's own `display: flex` outranks the UA sheet's `[hidden] { display: none }`, and without that rule the banner shows on every load regardless of the stored decision.

### Consent-Gated Third-Party Frame (map)
The Yandex map is not embedded on load; it is built when — and only when — cookies are accepted. `.map-frame` renders a stub carrying the address, one line stating what loading the map does, and a button that grants consent and fills the frame in one action. With consent already stored the iframe builds itself on load, no click. The stub doubles as the permanent fallback when the widget is blocked or JS is off (`<noscript>` hides the button, and the two map links below the frame do the work).

Any future third-party embed in this system follows the same shape and the same gate: `window.craftConsent.onGrant(...)`. The page makes no third-party request until the visitor has read what it costs and agreed to it.

### Navigation
Desktop: inline text links, uppercase, 0.875rem, an underline that grows in from the left on hover/focus (not a static underline). Mobile: a full-screen Ink-colored panel with 2rem Unbounded links, triggered by a three-line toggle that morphs to an X.

## Do's and Don'ts

### Do:
- **Do** keep the accent color (`#3C5A48`) confined to interactive/active moments — CTA, hover, the stub, hairline accents on focus. It should never cover more than a button's worth of area at once.
- **Do** set lists (services, reviews, hours) as typographic rows with hairline dividers, per the price-list pattern, before reaching for a card.
- **Do** keep every headline, list, and stat aligned to the shared content margin — consistency of the edge, not proximity to it, is what reads as considered here.
- **Do** duotone-grade any real photography added to the system, consistent with the flat, near-achromatic ground. All nine gallery slots now carry real shop photography.
- **Do** keep the focus ring visible against whatever ground it lands on. The Accent ring reads 6.6:1 on Paper but only 2.4:1 on Ink, so the Ink-grounded sections (hero, proof strip, mobile panel, final CTA, back-to-top) override `outline-color` to Paper. A new dark section must do the same.
- **Do** check any text color against its actual ground before shipping it. `--ink-faint` was `#7C6B6D` (4.35:1 on Paper — under the floor, on 12–14px text) and is now `#6E5D5F` (5.36:1 on Paper, 4.81:1 on Paper Dim).

### Don't:
- **Don't** introduce a second saturated color. If the palette feels thin, deepen the one accent or lean on Ink/Paper contrast instead.
- **Don't** add `border-radius`, `box-shadow`, gradients, or backdrop blur as decoration. The header's `backdrop-filter` is functional (legibility over a scrolling photo), not decorative — it is the only sanctioned use.
- **Don't** put a kicker/eyebrow label above a section heading, ever.
- **Don't** reuse the `.stub` (stamped-ticket) treatment outside of opening-hours content — it is a named, singular device, not a generic "interesting border" utility.
- **Don't** animate a number in a way that misstates what it is. The haircut tally is a fixed historical total: the odometer rolls it into place once, on first sight, and stops. It previously incremented every 1.5s, which implied a haircut every ninety seconds around the clock and made a true figure read as fabricated. Motion may reveal a fact; it may not invent one.
