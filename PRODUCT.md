# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no UI framework. Built and served via Vite (zero-config, no framework runtime): `npm run dev` for a local dev server with live reload, `npm run build` outputs a deploy-ready static bundle to `dist/`, `npm run preview` serves that build locally. Images and other files that must keep a stable, unhashed path (favicon, OG image, gallery/hero photos referenced by absolute URL) live in `public/assets/`, copied verbatim into `dist/`; `css/` and `js/` are processed, minified, and hashed by Vite.

## Users

Men in Saint Petersburg, primarily near the central/Ligovsky area, looking for a barbershop for a haircut, beard grooming, kids' haircuts, or a quick clipper/styling service. They arrive comparing local options on trust signals (ratings, reviews, exact prices) and want the fastest possible path from "this looks legit" to a confirmed booking, rather than a phone call.

## Product Purpose

CRAFT is a men's barbershop at Ligovsky Prospekt 71A, Saint Petersburg, open daily 10:00–21:00. This project replaces their existing Taplink micro-site (https://taplink.cc/craftspb) with a full production single-page website. Success means a visitor understands the offer in seconds, trusts the shop via real ratings/reviews and specific local details, and completes an online booking.

## Positioning

A contemporary, independent Saint Petersburg barbershop — editorial, modern, slightly industrial, fashion/lifestyle-influenced — distinct from generic "black + gold luxury barbershop" templates. Backed by real neighborhood presence (Ligovsky Prospekt) and strong local ratings (Yandex 5.0 / 292 reviews, 2GIS 4.9 / 145 ratings), plus an honestly priced, broad service menu (adult, kids, beard, waxing).

## Operating Context

Single physical location, walk-in service plus appointments. Booking happens through a third-party platform (YCLIENTS), not custom backend logic on this site. Customer contact channels beyond booking: phone call, WhatsApp, Telegram, VK, Instagram.

## Capabilities and Constraints

- Static single-page site, no backend/server logic, no CMS. Built via Vite; see Stack.
- Primary conversion action: the booking CTA links out to YCLIENTS: `https://n234517.yclients.com/company/231076/personal/menu?o=m-1`.
- Real logo, hero photo, and team photo were supplied by the owner and are in use (`public/assets/images/logo.png`, `hero-main.jpg`, `team.jpg`). The gallery's six slots remain clearly-labeled placeholders pending real shop photography.
- Real customer reviews (3, with reviewer name and date) were supplied and are in use, replacing the earlier sample placeholders. Yandex/2GIS aggregate counts stay in Evidence on Hand.

## Brand Commitments

- Name: **CRAFT** — Barbershop, Saint Petersburg.
- The physical shop's interior uses dark burgundy + a refined/"noble" green. Offered as a candidate palette anchor for the digital brand, not a locked spec — naive burgundy+gold treatments read as the generic luxury-barbershop cliché this project explicitly avoids, so the exact values are resolved carefully in the visual-direction pass (desaturated/near-black burgundy as dominant, green used sparingly as a sharp accent, generous neutral).
- Visual direction (explicit, binding): editorial, modern, masculine without macho clichés, slightly industrial, fashion/lifestyle-influenced, strong typography, photographic, restrained color palette, high visual contrast, premium but approachable.
- Explicitly to avoid: generic black + gold luxury aesthetic, barber pole clichés, moustache/scissors icons, excessive cards, excessive rounded corners, decorative gradients, glassmorphism, generic AI-landing-page aesthetics, excessive centered text.

## Evidence on Hand

- Address: Ligovsky Prospekt 71A, Saint Petersburg
- Hours: open daily 10:00–21:00
- Phone: +7 (812) 952-57-15
- WhatsApp: deep link to a dedicated number, prefilled with a greeting message (`whatsapp://send?phone=79990643618&text=...`) — distinct from the shop's listed landline; used specifically for WhatsApp booking/contact.
- Telegram: @craftcutspb
- VK: https://vk.ru/craftcutspb
- Instagram: https://www.instagram.com/hairurg.spb/
- Booking platform: YCLIENTS — https://n234517.yclients.com/company/231076/personal/menu?o=m-1
- Ratings: Yandex 5.0 (292 reviews), 2GIS 4.9 (145 ratings) — 437 combined, shown as a single total in the proof strip.
- Real reviews in use: Юрий Воробьёв (29 мая), Саша Импишов (20 ноября 2025), Даниил Кунавин (22 февраля 2025) — full text in `index.html`'s Reviews section.
- Track record: 23,985 haircuts performed; barbers have 5+ years of experience. Sourced from the owner's prior Taplink copy, shown in the site's "О нас" section.
- Parking: available near the entrance — call ahead to arrange. Noted in Contacts.
- Services & prices (confirmed, ₽):
  - Men's haircut — 1700
  - Haircut + beard — 2400
  - Kids haircut — 1300
  - Beard trim — 1100
  - One-guard clipper cut — 600
  - Multi-guard clipper cut — 1500
  - Styling — 500
  - Waxing, one area — 300

## Product Principles

1. **Booking is the product.** Every section should reduce friction toward the YCLIENTS CTA, not just inform.
2. **Trust through specificity.** Real ratings, exact address, exact hours, and honest prices beat vague premium signaling.
3. **Editorial restraint over luxury cliché.** Distinctiveness comes from typography, photography, and layout discipline — not ornament, gradients, or stock "premium" tropes.
4. **Local and independent, not generic.** The shop's real SPb neighborhood identity (Ligovsky Prospekt) and its actual color heritage (burgundy/green) anchor the brand, not a template aesthetic.
5. **Every claim must be real.** No fabricated testimonials, review quotes, stats, or credentials beyond what's confirmed here; sample/placeholder content is always clearly distinguishable from real content.

## Accessibility & Inclusion

No specific standard mandated by the client, but the brief explicitly requires excellent accessibility, semantic HTML, proper focus states, and `prefers-reduced-motion` support — treated as a WCAG 2.1 AA baseline target.
