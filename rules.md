# Rules — AnimaLearn

Project-specific conventions and hard constraints. Follow these for any change, big or small.

## 0. Non-negotiable, fix-first

- **Duplicate script files.** The repo currently has two copies of every core script — root-level (`app.js`, `auth.js`, `config.js`, `db.js`, `pages.js`, `router.js`, `sw.js`, `utils.js`, `animations.js`) and `js/*.js`. `index.html` and `sw.js` load **only** `js/*.js`. The root copies were edited more recently than the `js/` copies, which strongly suggests recent work was done in files the app doesn't actually load.
  - Until this is resolved: **treat `js/` as the only real source**, and manually diff any root-level file against its `js/` counterpart before trusting either.
  - The fix is to pick one location (recommend `js/`, since `index.html`/`sw.js` already point there), delete the other copy entirely, and never let both exist again.

## 1. No build step, ever
- No bundler, no transpiler, no npm install for the app itself. Everything is plain `<script>` tags and CDN links in `index.html`.
- Script load order in `index.html` is meaningful and fragile: `config.js` → `utils.js` → `auth.js` → `db.js` → `router.js` → `animations.js` → `pages.js` → `app.js`. A new file must be inserted at the correct point in this chain, not just appended.
- Don't introduce ES modules (`import`/`export`) unless you're prepared to convert every script and update `index.html` accordingly — right now everything relies on implicit globals.

## 2. State discipline
- `state` (defined once in `config.js`) is the only source of truth in the browser. There is no reactive framework — every function that mutates `state` is responsible for calling whatever render/update function reflects that change (e.g. `updateNotifBadge()`, `renderNotifDropdown()`, `navigate()`).
- Don't create parallel local copies of things already in `state` (notes, progress, notifications, theme) — read/write `state` directly to avoid drift.

## 3. Firestore access
- All Firestore reads/writes go through `db.js`. Don't call `db.collection(...)` directly from `pages.js`/`animations.js`/etc. — keep the data-access layer centralized so security-rule assumptions stay in one place.
- Every write is scoped under `users/{uid}/...`. Never write to a path that isn't under the current user's own `uid`.
- Wrap Firestore calls in try/catch and surface failures via `showToast(..., "error")` — this is the existing pattern in `db.js`, keep it consistent.

## 4. Animations
- New animations go in the `ANIMATIONS` object in `animations.js`, keyed by a short lowercase id, with `title`, `description`, `params` (array of slider configs), and a `render(ctx, w, h, params, time, colors)` function.
- Always pull colors from `getCanvasColors()` — never hardcode hex colors inside a `render()` function, or the animation will look broken on theme toggle.
- `render()` must be a pure function of its arguments (no reading `state` directly) so it stays swappable/testable and works correctly with `state.animParams`/`state.animSpeed` already threaded in by `startAnimation`.
- Call `stopAnimation()` before starting a new one — never let two `requestAnimationFrame` loops run concurrently (the router already does this on every `navigate()` call; don't bypass the router to show an animation).

## 5. Adding a new topic
1. Add an entry to `TOPICS` in `config.js`: `id` (unique, short), `title`, `subject`, `subjectLabel`, `difficulty` (`beginner`/`intermediate`/`advanced`), `animation` (must match an existing or new `ANIMATIONS` key), `description`, `theory` (LaTeX via `\( \)` / `\[ \]`), `refs` (array of existing `REFERENCES` ids, or add new ones first).
2. Add a corresponding nav entry in the sidebar in `index.html` under the right subject group.
3. If the topic needs a new animation, follow the "Animations" rule above first.
4. Prefer reusing an existing `ANIMATIONS` entry across related topics (already done extensively, e.g. `harmonic` powers SHM, resonance, projectile motion, quantum basics) over building a new one, per the PRD's content-bottleneck concern — only build new when the concept genuinely needs different visuals.

## 6. Styling
- Theme colors are CSS custom properties (`--bg`, `--text`, `--text2`, `--accent`, `--accent-hover`, `--card`, `--border`, `--input-bg`, `--canvas-bg`, `--grid-color`), defined per theme in `styles.css` and toggled via the `dark` class on `<html>`. Always use `var(--...)` in inline styles/CSS — never hardcode a color that should adapt to theme.
- Tailwind is loaded via the CDN JIT script (`cdn.tailwindcss.com`) — utility classes work directly in markup with no config file. Don't assume a `tailwind.config.js` exists or is read.
- Font stack: "Space Grotesk" for display/headings, "DM Sans" for body — keep this consistent in any new UI.

## 7. Service worker / caching
- Any time a script is added, removed, or renamed, update the `urlsToCache` array in `sw.js` to match.
- Bump `CACHE_NAME` (currently `animalearn-v3.01.01`) on every deploy that changes cached files, or returning users will keep getting stale JS until they hard-refresh.

## 8. Security / secrets
- The Firebase config in `config.js` (apiKey, etc.) is expected to be public — that's normal for Firebase web apps; access control is enforced by Firestore security rules, not by hiding this config. Don't try to move it to an env var or backend — there is no backend.
- Never write app logic that trusts client-supplied `uid` for anything other than "this is the currently authenticated user's own data" — always scope reads/writes to `state.uid` from the live `onAuthStateChanged` session, not a value passed around manually.

## 9. Git / commits
- Sharvil has a known recurring issue where commits get attributed to an alternate GitHub account (`omega100crust`) across projects. Before committing on this repo, verify `git config user.name` / `user.email` are correct if authorship looks wrong in a commit.
- New branch `main` may need `git push --set-upstream origin main` on first push (already hit once on this project).

## 10. Testing
- There are currently no automated tests. If adding any, start with the PRD's proposed smoke test: every `TOPICS[i].animation` value resolves to a real key in `ANIMATIONS`, and each `render()` runs one frame without throwing, for all 33 topics.
