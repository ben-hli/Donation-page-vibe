# HLI Donation Portal — Design System

## Brand Colours

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1c5fb8` | CTA buttons, selected states, links |
| `--color-white` | `#ffffff` | Cards, form backgrounds |
| `--color-grey` | `#b4c3cb` | Borders, secondary elements |
| `--color-yellow` | `#ffe655` | "Recommended" badges |
| `--color-orange` | `#fc9736` | Accent highlights |

### Derived Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#f4f7fa` | Page background |
| `--color-text` | `#1a2332` | Body text |
| `--color-text-secondary` | `#4a5e6e` | Labels, helper text |
| `--color-border` | `#d8e4eb` | Subtle borders |
| `--color-primary-light` | `#e8f0fb` | Selected option backgrounds |
| `--color-primary-dark` | `#1449a0` | Button hover state |

## Typography

- **Font**: System UI stack (no external font dependencies)
- **Scale** (fluid with `clamp()`):
  - H1/Display: `clamp(1.5rem, 4vw, 2rem)`
  - H2: `clamp(1.125rem, 2.5vw, 1.375rem)`
  - Body: `1rem`
  - Small/Label: `0.875rem`
  - Caption: `0.75rem`
- **Line height**: 1.6 for body, 1.2–1.3 for headings
- **Letter spacing**: `0.04em` for uppercase labels

## Spacing

Base unit: `4px`. Common values: 4, 8, 12, 16, 20, 24, 32, 48, 64px.

## Components

### Option Cards (Step 1)
- `1px solid var(--color-border)`, radius `12px`
- Selected state: blue border + `--color-primary-light` background + ✓ mark
- Hover: subtle shadow lift + border → primary

### Stepped HLI Slider (Step 3)
- Row of radio buttons styled as pill segments
- Selected pill: filled blue
- "10% — Recommended" label on the third option

### Charity Split Sliders (Step 3)
- Custom range input with blue thumb and filled track
- Sum indicator shown below: "Total: 100%"
- Sliders auto-normalize to 100% on Continue

### Tooltips (ⓘ buttons)
- Triggered by hover + focus on `<button class="info-btn">`
- Absolute-positioned card, max-width 280px, soft shadow
- Arrow indicator pointing to trigger

### Progress Bar
- Numbered circles connected by horizontal lines
- Completed: filled blue with ✓
- Current: blue outline ring
- Upcoming: grey outline ring
- Label text below each circle

### Buttons
- Primary: `background: var(--color-primary)`, white text, `border-radius: 10px`
- Back: transparent, `color: var(--color-text-secondary)`
- Hover on primary: `--color-primary-dark`, `translateY(-1px)`

### Impact Calculator (Step 3)
- Large display number for years of depression averted
- Soft card background, centred layout
- Updates in real time as sliders change

## Motion

- Step transitions: fade + `translateY(6px)` over `250ms`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Hover lifts: `translateY(-1px)` on cards, `scale(1.01)` on buttons

## Layout

- Page max-width: `640px`, centred with `auto` margins
- Mobile: full width, `16px` horizontal padding
- Form card: white background, `--shadow-md`, `--radius` 16px
- Progress bar: sits above the card, full container width
