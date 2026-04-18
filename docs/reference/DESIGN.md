# Design System Specification: The Eternal Vault

## 1. Overview & Creative North Star
This design system is built to facilitate the transition between the present and the future. Our Creative North Star is **"The Eternal Vault."** 

Unlike standard DeFi projects that feel frantic or ephemeral, this system must feel permanent, institutional, and immutable. We achieve this by moving away from "standard" UI patterns—like boxed grids and heavy borders—and moving toward a **High-End Editorial** experience. The layout should embrace intentional asymmetry, generous white space (breathing room), and a sophisticated layering of translucent materials. We are not just building a dashboard; we are building a digital monument for one’s legacy.

---

## 2. Colors & Tonal Architecture
The palette is anchored in deep, oceanic navies to evoke stability, with high-frequency emerald accents to represent "life" and "activity."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. 
Structure must be created through **Tonal Shifting**. A section is defined by moving from `surface` (#041329) to `surface-container-low` (#0d1c32). This creates a sophisticated, seamless transition that feels "carved" rather than "drawn."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent plates. 
- **Base Layer:** `surface` (#041329)
- **Primary Content Area:** `surface-container` (#112036)
- **Floating Elements/Cards:** `surface-container-high` (#1c2a41) or `highest` (#27354c)
- **Sunken Elements (Inputs):** `surface-container-lowest` (#010e24)

### The "Glass & Gradient" Rule
To elevate the "Institutional" feel, use **Glassmorphism** for modal overlays and navigation bars. 
- **Material:** `surface` at 70% opacity with a `24px` backdrop-blur.
- **CTAs:** Main action buttons should not be flat. Use a subtle linear gradient from `primary` (#4edea3) to `on-primary-container` (#009466) at a 135-degree angle to give the element a "jewel" like quality.

---

## 3. Typography
We utilize a dual-font pairing to balance technical precision with editorial authority.

- **Display & Headlines (Manrope):** Use Manrope for all `display-` and `headline-` tokens. This font’s geometric construction feels tech-forward yet "built to last." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments to create an authoritative, magazine-style header.
- **Body & UI (Inter):** Use Inter for all `title-`, `body-`, and `label-` tokens. Its high x-height ensures absolute legibility for complex legal and cryptographic data.
- **Hierarchy Strategy:** Create "High-Contrast" pairings. Place a `label-sm` (all caps, tracked out +10%) directly above a `headline-lg` to create a sophisticated, curated look.

---

## 4. Elevation & Depth
In "The Eternal Vault," depth is a sign of security. We do not use "drop shadows" in the traditional sense.

### The Layering Principle
Depth is achieved by stacking the `surface-container` tiers. If a card sits on a `surface-container-low` background, the card itself must be `surface-container-high`. This "tonal lift" is cleaner and more modern than artificial shadows.

### Ambient Shadows
When an object must "float" (e.g., a primary action modal), use an **Ambient Glow** instead of a shadow:
- **Shadow Color:** `surface-tint` (#4edea3) at 5% opacity.
- **Blur:** 40px to 60px.
- **Spread:** -10px.
This creates a subtle "active" aura around the component rather than a heavy black smudge.

### The "Ghost Border" Fallback
If a boundary is required for accessibility, use a **Ghost Border**:
- **Stroke:** `outline-variant` (#44474d) at 20% opacity. 
- Never use 100% opacity for lines.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `on-primary-container`), `on-primary` text. `xl` roundedness (0.75rem).
- **Secondary:** Surface-container-highest fill with a "Ghost Border."
- **Tertiary:** No fill, `primary` text, with an underline that only appears on hover.

### The Vitality Card (Signature Component)
Specifically for inheritance status. Use `surface-container-high` with a 2px left-side accent bar of `primary` (#4edea3). Forbid the use of dividers between line items; use `1.5rem` of vertical padding and a background shift to `surface-container-highest` on hover.

### Input Fields
- **State:** "Sunken." Use `surface-container-lowest` as the background.
- **Focus:** No heavy borders. On focus, the "Ghost Border" increases to 40% opacity, and a subtle `surface-tint` glow (8px blur) appears.

### Chips (Status Indicators)
- **Active Status:** `primary-container` background with `primary` text. 
- **Legacy/Inactive:** `secondary-container` background with `secondary` text.
- **Shape:** Always `full` (pill-shaped) to contrast against the `xl` card corners.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** Align text to the left but place primary actions or status indicators on an offset "floating" grid to the right.
- **Use "Life" Accents:** Use the `primary` emerald green sparingly. It should only represent "Active" status, "Security Verified," or "Success."
- **Nesting Surfaces:** Use `surface-container-low` for page backgrounds and `surface-container-high` for content modules.

### Don’t:
- **No Divider Lines:** Never use a `<hr>` or 1px line to separate content. Use whitespace or a tonal change.
- **No Pure Black:** The darkest point in the UI should be `surface-container-lowest` (#010e24), never #000000.
- **No Default Inter Sizing:** Avoid the "browser default" feel. Always use the specific Typography Scale tokens (e.g., `body-md` is 0.875rem, not 1rem).
- **No Sharp Corners:** Avoid the `none` or `sm` roundedness tokens for main containers. Stick to `xl` (0.75rem) to maintain a "friendly-institutional" feel.