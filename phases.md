# Phases — AnimaLearn

Status legend: ✅ Shipped · 🔧 In progress / needs cleanup · ⏭ Not started

## Phase 0 — Foundation (✅ Shipped)
- Vanilla JS + Tailwind (CDN) + custom CSS design system, no build step.
- Firebase project wired up (Auth + Firestore), `firebaseConfig` in `config.js`.
- App shell: sidebar nav, header (search, theme toggle, notifications, auth), hash-based router (`navigate()`).
- Dark/light theme system with `localStorage` persistence and OS preference fallback.
- PWA basics: `manifest.json`, `sw.js` with versioned cache, install prompt support.

## Phase 1 — Auth & Accounts (✅ Shipped)
- Email/password auth (register + login) via Firebase Authentication.
- Google and GitHub OAuth via `signInWithPopup`.
- `users/{uid}` profile doc created on first sign-in/registration (name, email, difficulty, createdAt).
- Auth state listener (`onAuthStateChanged`) drives `state.user`/`state.uid` and triggers data hydration.
- Difficulty preference captured at registration.

## Phase 2 — Content Engine (✅ Shipped)
- `TOPICS` data model (33 topics) with subject, difficulty, animation key, LaTeX theory text, and reference IDs.
- Custom Canvas animation engine (`ANIMATIONS` registry, `startAnimation`/`stopAnimation`, shared RAF loop).
- 9 distinct animation renderers, several reused across multiple related topics: `limit`, `derivative`, `riemann`, `taylor`, `matrix`, `harmonic`, `fourier`, `vectorfield`, `doublependulum`.
- KaTeX rendering pipeline (`renderLatexText`) for inline (`\( \)`) and display (`\[ \]`) math in theory text.
- Retina-aware canvas sizing (`setupCanvas`), theme-aware color palettes per animation (`getCanvasColors`).
- References library (`REFERENCES`) — books/papers/videos/websites tagged by subject + difficulty.

## Phase 3 — Personalization (✅ Shipped)
- Per-user notes: create/edit/delete, stored in `users/{uid}/notes/{noteId}`, `note-editor` page.
- Per-topic progress tracking: `users/{uid}/progress/{topicId}`.
- Notifications: generated on key account events (login, register, OAuth sign-in), stored in `users/{uid}/notifications/{notifId}`, unread badge + dropdown, mark-all-read.
- Global search (Ctrl/Cmd+K) across topics/notes/references, dedicated `search` page.

## Phase 4 — Platform polish (✅ Shipped)
- Responsive/mobile sidebar (slide-out + overlay).
- `prefers-reduced-motion` and ARIA labels on primary navigation (per PRD; verify coverage — see rules.md).
- Contact/help page, feedback modal (`closeFeedback()` referenced in `app.js`).
- `html2pdf` included (likely for exporting notes or theory to PDF — confirm actual usage before extending).

## Phase 5 — Cleanup & correctness (🔧 In progress)
- **Deduplicate root-level vs `js/` script copies** — resolve which is canonical, delete the other, re-verify all edits landed in the shipped copy. See `architecture.md` §9 and `rules.md`.
- Confirm `sw.js`'s cached file list and `CACHE_NAME` are bumped/accurate after the dedupe.
- No automated tests exist anywhere in the repo — PRD flags this as a real regression risk at 33 topics and growing.

## Phase 6 — Data & feedback loop (⏭ Not started, per PRD roadmap)
1. Basic usage instrumentation: which topics are opened, animation interactions, time spent.
2. Structured feedback from a small group of real students on which animations actually produce the "click" moment.
3. Expand topic coverage based on that data rather than founder intuition alone.
4. Surface progress more visibly in the UI (e.g. "8/12 Calculus topics covered") — data already exists in Firestore, just needs a UI.
5. Lightweight regression protection: smoke tests confirming every topic's `animation` key resolves to a real `ANIMATIONS` entry and renders without throwing.

## Phase 7 — Content scaling strategy (⏭ Not started, open question from PRD)
- Decide whether new topics can share "animation families" (e.g. a generic wave-superposition engine reused across wave topics) instead of one bespoke animation per topic, since hand-built content is the current bottleneck to scaling past 33 topics.
