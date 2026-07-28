# HLI Donation Portal — Current Donor Flow

_As implemented in `src/pages/index.astro`, snapshot for review/iteration._

## Overview

Single-page, 5-step wizard (steps skip conditionally). Progress bar, Back/Continue nav, and a client-side `state` object drive everything — no page reloads until Stripe redirect/success.

Step sequence is dynamic:
- **Recommended Charities** destination → `1 → 2 → 3 → 4 → 5` (all steps)
- **HLF** or **HLI direct** destination → `1 → 2 → 4 → 5` (Step 3 "Split" is skipped entirely)

---

## Step 1 — Destination

**Question:** "Where would you like to give?"

Three radio-card options (from `src/data/charities.ts` → `donationOptions`):
1. **Happier Lives Fund** — marked "Recommended", tagline "Expert-directed impact"
2. **Recommended Charities** — tagline "Choose your own split"
3. **Happier Lives Institute** — tagline "Fund the research"

Each card has an info (ⓘ) button opening a tooltip with a longer description. Selecting a card sets `state.destination` and visually highlights it (border + checkmark). This choice determines both the step sequence (whether Step 3 appears) and downstream copy/logic (e.g. impact calculator only runs for "recommended").

**Validation:** must select one option to continue.

---

## Step 2 — Amount

**Question:** "How much would you like to give?"

**Frequency toggle** (3-way button group, left to right): **One-time**, **Monthly**, **Pledge**.
- Default selected: **Pledge**, which carries a small rotated "Recommended" sticker badge on its corner.
- Below the toggle is a single shared **currency dropdown** (30 currencies, from `src/data/currencies.ts`) used by whichever amount method is active.

Depending on frequency, one of two mutually exclusive panels shows:

**A. Manual amount panel** (One-time / Monthly) — hidden by default since Pledge is default:
- Currency-prefixed numeric input for a custom amount
- 6 preset amount chips: 25 / 50 / 100 / 250 / 500 / 1000 (in the selected currency, currently just displayed as raw numbers — no currency conversion applied to preset labels)

**B. Pledge calculator panel** (Pledge) — shown by default:
- Annual income input (same shared currency)
- Stepped % selector: **1%, 3%, 5%, 10%** (no default pre-selected — donor must pick one)
- Live result line once both fields are filled: _"That's £250 per month."_
- Under the hood: `monthly amount = income × pct / 100 / 12`, rounded to 2 decimals, written into `state.amount` (the single source of truth used everywhere downstream)

Switching frequency resets `state.amount` to `null` so a stale value from one mode doesn't leak into another.

**Validation:** `state.amount` must be a positive number (via either panel) to continue.

---

## Step 3 — Split (Recommended Charities only)

**Question:** "How would you like to split your donation?"

**A. HLI contribution — stepped selector**
- Options: 0%, 5%, **10% (default, "Recommended")**, 15%, 25%
- "Choose a custom %" checkbox reveals a free-text 0–100 input instead, overriding the stepped choice
- This percentage of the total donation goes to HLI itself; the remainder is split across charities below

**B. Charity split sliders**
- One slider per charity (from `charities.ts`), each with a tier badge ("Top Charity" / "Promising") and info tooltip with a fuller description
- Sliders start at 0%, live-update a "% of remaining allocation" label as dragged
- A running total is shown (`Total: X%`) with an inline warning if it doesn't sum to 100% — sliders **auto-normalize proportionally to 100%** when the donor clicks Continue (no hard block)

**C. Impact calculator** (updates live as sliders/HLI% change)
- **WELLBYs generated**, **years of depression averted** (`WELLBYs ÷ 1.3`), and an **evidence confidence** rating (Very Low → Very High Risk, color-coded) — all computed from `amount × (1 − hliPct%) × charity split% ÷ costPerWellby`, summed and confidence-weighted across charities
- Converts the entered amount to USD first via a live FX rate fetch (frankfurter.app) before running any charity math, since `costPerWellby` figures are USD-denominated
- Per-charity WELLBY breakdown list

**D. Outcome cards** (4 fixed cards, one per charity) — translate the allocated amount into a concrete, relatable outcome count (e.g. "psychotherapy courses funded," "children protected from lead exposure," "children protected from malnutrition") using each charity's `costPerOutcome`.

**E. "Putting your impact in context" card**
- UK Treasury's monetized value of the wellbeing created (WELLBYs × a fixed £/WELLBY figure)
- What an equivalent-impact donation to a "standard charity" would need to be, for comparison

**Validation:** always valid — sliders normalize on advance regardless of current state.

---

## Step 4 — About you

**Question:** "About you" — "We need a few details to process your donation and send you a receipt."

Fields:
- First name, last name (required)
- Email (required, regex-validated)
- Country dropdown (all countries, from `countries.ts`)
- **Gift Aid card** — only revealed if country = United Kingdom: explains the 25% uplift, checkbox declaration with the standard HMRC wording
- "Keep my donation anonymous" checkbox (always visible)

**Validation:** first name, last name, and a syntactically valid email are required. Country/Gift Aid/anonymous are optional.

---

## Step 5 — Review & Pay

**Question:** "Review your donation"

**Summary block** (built dynamically), showing whichever of these apply:
- Giving to: [destination name]
- Amount: `{symbol}{amount}` + `/month` (Monthly or Pledge) or ` one-time` (One-time)
- Pledge row (Pledge only): "5% of £60,000/yr"
- HLI contribution % + per-charity split % (Recommended Charities only)
- Estimated impact: WELLBYs + years of depression averted (Recommended Charities only, if > 0)
- Gift Aid confirmation row (if claimed)

**Trust signals:** "Secure payment via Stripe," "No percentage taken from programme donations," link to full transparency page.

**Payment:**
- On entering this step, a `PaymentIntent`/subscription is created server-side (`POST /api/create-payment-intent`) with amount, currency, frequency, pledge income/%, donor info, destination, splits, and HLI%
- Stripe.js is lazy-loaded from CDN; a Stripe **Payment Element** (card + wallets, HLI-branded appearance) mounts once the intent is ready
- Loading spinner shown while preparing; error state with "Try again" if the API call fails
- "Pay now" button disabled until the Payment Element reports `ready`
- On submit: `stripe.confirmPayment()` with billing name/email from Step 4; inline card errors surface in an alert box; success redirects to `/success`

---

## Cross-cutting mechanics

- **Progress bar**: reflects only the *active* step sequence (3 or 4 steps depending on destination), not a fixed 5-step bar
- **Back/Continue nav**: Back hidden on first step; Continue hidden on last step (replaced by the in-step Pay button)
- **Step transitions**: CSS fade/slide (`leaving` → `entering` → `active`), ~220ms
- **Tooltips**: shared popup positioned near whichever ⓘ button is hovered/focused; Escape or blur dismisses
- **Currency**: one dropdown for the whole flow; symbol synced across the manual amount field, pledge income field, and preset labels; FX rates fetched once on load (USD-based) purely for the Step 3 impact math — the donation amount itself is never converted, only estimated impact figures
- **Error highlighting**: shake/red-border feedback if Continue is clicked while the current step is invalid (Steps 1, 2, 4 only — Step 3 has no hard validation)
