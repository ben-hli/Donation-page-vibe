# HLI Donation Portal — Claude Instructions

## Project Overview

A static multi-step donation portal for the Happier Lives Institute (HLI), built with Astro.
Donors select a destination, enter an amount, optionally split between charities, provide their
details, and pay via Stripe. It is a single-page experience (`src/pages/index.astro`).

## Stack

- **Framework**: Astro (static output, no SSR)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with custom properties — no CSS framework
- **Interactivity**: Vanilla JS in Astro `<script>` tags — no frameworks
- **Payments**: Stripe Checkout (integration pending — see TODO)
- **Forms**: Donor data passed to Stripe as session metadata

## Folder Structure

```
src/
├── components/    # Reusable .astro components
├── layouts/       # BaseLayout.astro
├── pages/         # index.astro (main), 404.astro
├── data/          # charities.ts, currencies.ts
└── styles/        # global.css
public/
└── images/        # hli-logo.png, etc.
```

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Main donation form — all 4–5 steps |
| `src/data/charities.ts` | Donation options and charity data with impact figures |
| `src/data/currencies.ts` | Supported currencies list |
| `src/layouts/BaseLayout.astro` | HTML shell with SEO meta |
| `src/styles/global.css` | Design tokens and base reset |
| `DESIGN.md` | Full design system reference |

## Donation Flow

1. **Destination** — HLF (recommended), Recommended Charities, or HLI directly
2. **Amount** — Amount, currency, one-off or monthly
3. **Split** (Recommended Charities only) — 4 charity sliders + HLI% stepped selector + impact calculator
4. **About you** — Name, email, country, Gift Aid (UK)
5. **Review** — Summary + Stripe payment CTA

Step 3 is skipped for HLF and HLI donations.

## Business Logic

- **HLI percentage slider**: When "Recommended Charities" is selected, a stepped control
  (0%, 5%, 10%, 15%, 25%) lets donors add a contribution to HLI. Default: 10% (labelled "Recommended").
- **Charity splits**: Percentages of the non-HLI allocation. Default: 25% each. Sliders
  auto-normalize to sum to 100% when the user advances.
- **Impact calculator**: `Σ (amount × (1 − hliPct/100) × charityPct/100 × charity.yearsPerDollar)`
  For HLF: `amount × 3`. Updates in real time.
- **Gift Aid**: Show declaration when country = United Kingdom.

## TODO: Stripe Integration

The review step has a placeholder "Complete Donation" button. To integrate:
1. Create Stripe products for one-off and recurring donations
2. Use Stripe Checkout — build `line_items` from form state
3. Pass donor info and splits as `metadata` on the Checkout Session
4. Add `/success` and `/cancel` pages
5. Serverless function (Netlify/Vercel) to create the session server-side

## Conventions

- Follow `DESIGN.md` for all visual decisions
- TypeScript interfaces for all data in `src/data/`
- Vanilla JS only — no npm UI packages
- Scoped `<style>` in `.astro` files; tokens in `global.css`
- File naming: `PascalCase.astro`, `camelCase.ts`, `kebab-case.css`
