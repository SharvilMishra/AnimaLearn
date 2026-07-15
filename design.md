# Design — AnimaLearn

## 1. Design philosophy

Cinematic, focused, "study tool" rather than "SaaS dashboard." Dark mode is the default and primary experience (`<html class="dark">` is hardcoded in `index.html`); light mode is a fully-specified alternative, not an afterthought. The palette leans warm/muted rather than the typical blue-on-white or blue-on-black developer-tool look — this is intentional differentiation from generic ed-tech UI.

## 2. Color system

Defined as CSS custom properties in `styles.css`, swapped wholesale by toggling the `dark` class on `<html>`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#2d2727` | `#f9f7f7` | Page background |
| `--card` | `#413543` | `#dbe2ef` | Cards, panels, modals |
| `--text` | `#f0eb8d` | `#112d4e` | Primary text |
| `--text2` | `#dbe2ef` | `#3f72af` | Secondary/muted text |
| `--accent` | `#8f43ee` | `#3f72af` | Primary actions, active states, links |
| `--accent-hover` | `#a566f0` | `#2c5a8f` | Hover state of accent |
| `--border` | `rgba(143,67,238,0.3)` | `rgba(63,114,175,0.3)` | Dividers, outlines |
| `--input-bg` | `#413543` | `#dbe2ef` | Form fields |
| `--canvas-bg` | `#352d35` | `#e8edf5` | Animation canvas background |
| `--grid-color` | `rgba(143,67,238,0.12)` | `rgba(63,114,175,0.15)` | Canvas grid lines |

Notes:
- Dark mode's `--text` is a warm yellow (`#f0eb8d`), not white — a deliberate departure from default dark-UI text color, reinforces the non-generic feel.
- Dark mode's accent is violet/purple (`#8f43ee`); light mode's accent is a steel blue (`#3f72af`) — the two themes use genuinely different hues, not just inverted lightness, so anything hardcoding "purple = brand color" will look wrong in light mode. Always reference the token, not the hex.
- `theme-color` meta tag and manifest both use `#8f43ee` (the dark-mode accent) as the canonical brand color for OS-level chrome (browser tab, PWA splash).

## 3. Typography

- **Display / headings:** "Space Grotesk" (weights 300–700).
- **Body:** "DM Sans" (weights 300–700, italic supported).
- Both loaded from Google Fonts. Math notation is rendered separately via KaTeX (its own font, `KaTeX_*`), which intentionally looks distinct from the surrounding UI type as a visual cue that it's a formula.

## 4. Iconography

Font Awesome 6.5.1 (free, solid + brand icons) throughout — nav icons, buttons, toasts, notification types, OAuth provider buttons (`fa-google`, `fa-github`). No custom icon set; stick to Font Awesome for consistency rather than mixing in SVG icon libraries.

## 5. Layout

- Persistent left sidebar (collapsible/overlay on mobile) with grouped, collapsible nav sections (Mathematics / Physics), each with subject subheaders and topic-level sub-items.
- Fixed header: global search (`Ctrl/Cmd+K`), theme toggle, notification bell + dropdown, auth entry point.
- Main content area swaps entirely per route (`#mainContent.innerHTML`) — no persistent per-page chrome beyond the shell.
- Topic detail pages pair a Canvas animation (with param sliders + play/pause/speed controls) alongside theory notes and references — this side-by-side "see it, then read it" layout is the core pedagogical pattern and should be preserved for any new topic type.

## 6. Motion & animation

- All conceptual animations render on `<canvas>`, hand-drawn per topic (see `architecture.md` §5) — not CSS/SVG animation, not a charting library. This is a deliberate product differentiator per the PRD ("not a generic graphing widget").
- UI micro-motion (toasts sliding in/out, dropdown open/close, sidebar collapse) uses CSS transitions/keyframes, kept short (~300ms) and simple.
- `prefers-reduced-motion` is respected per the PRD — any new animated UI chrome (not the canvas topic animations themselves, which are the content) should check this media query before adding non-essential motion.

## 7. Accessibility

- ARIA labels on primary navigation and icon-only buttons (search, theme toggle, notifications, sidebar toggle) — follow this pattern for any new icon-only control.
- Keyboard shortcut: `Ctrl/Cmd+K` focuses global search from anywhere (guarded against stealing focus while already typing in a field).
- `Escape` closes whatever overlay is open (notifications, auth modal, feedback modal, mobile sidebar) — any new modal/dropdown should hook into this same `Escape` handler in `app.js` rather than inventing its own.

## 8. Content presentation conventions

- Theory text uses inline LaTeX delimiters `\( ... \)` and display delimiters `\[ ... \]`, rendered via `renderLatexText()` in `utils.js`. New topic theory content must use these exact delimiters — anything else won't be picked up by the regex-based renderer.
- Topics are tagged with a `difficulty` (`beginner` / `intermediate` / `advanced`) shown as a badge — keep this three-tier scheme rather than introducing new levels.
- Each subject has a fixed color in `SUBJECT_COLORS` (`config.js`) used for badges/accents on topic cards — reuse existing subject colors for new topics in the same subject rather than picking arbitrary new ones.
