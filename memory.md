# Memory — AnimaLearn

Running log of context, decisions, and things worth remembering between sessions. Newest entries at the top. Update this file whenever a non-trivial decision is made or a bug with a non-obvious cause is fixed.

---

## 2026-07-15 — Admin broadcast system, revised to single-site (no separate admin app)

Superseded the earlier plan below: instead of a second Vercel project, the admin panel now lives **inside the main AnimaLearn app** at a hidden `#admin` route.

- **`js/config.js`:** added `ADMIN_UID` constant (placeholder, needs the real UID pasted in — see setup below).
- **`index.html`:** added a shield icon button (`#adminBtn`) in the header, `display:none` by default.
- **`js/utils.js`:** `updateUserUI()` now shows `#adminBtn` only when `state.uid === ADMIN_UID`.
- **`js/router.js`:** new `"admin"` route.
- **`js/pages.js`:** `renderAdminPage()` (shows a "Restricted" message for anyone whose UID doesn't match; otherwise the broadcast form + list), `initAdminPage()`, `renderAdminBroadcastList()`, `sendAdminBroadcast()`, `deleteAdminBroadcast()`.
- **`js/db.js`:** `sendBroadcastDb()`, `deleteBroadcastDb()`, `listenAdminBroadcastList()` — all short-circuit unless `state.uid===ADMIN_UID`, mirroring the real enforcement that lives in the Firestore security rule.
- The underlying broadcast delivery mechanism for regular users (real-time listener, merge into the notification bell, `lastSeenBroadcastAt` read-tracking) is unchanged from the entry below — only the admin-side sending UI moved from a separate site into this app.
- Setup doc moved/renamed to `firestore-rules-addition.md` at the project root (was previously inside the now-deleted `AnimaLearn-Admin/` folder). Same required manual steps as before: create one dedicated Firebase Auth account, get its UID, paste into `js/config.js` and the Firestore rule, publish the rule. Nobody but that one account will ever see the shield icon or be able to write to `broadcasts`.
- The admin now logs in through the **same sign-in modal every user sees** — no separate login page, no separate deployment to keep in sync.

## 2026-07-15 — Admin broadcast system built (original separate-site plan, superseded above)

- Added a lightweight admin-only notification broadcast system, scoped to just notifications (no content/topic editing, no user management — deliberately kept small).
- **Main app (`js/db.js`, `js/auth.js`, `js/app.js`, `js/utils.js`, `js/config.js`):** added a `broadcasts` top-level Firestore collection, a real-time listener (`listenForBroadcasts`) started unconditionally in `init()`, and merge logic (`mergeBroadcastsIntoNotifications`) that folds broadcast docs into the existing `state.notifications` array so the existing bell/dropdown/badge UI needed zero redesign. Read-tracking uses a single `lastSeenBroadcastAt` timestamp (on the user doc if signed in, `localStorage` if guest) instead of per-user fan-out writes — avoids needing Cloud Functions.
- **New sibling project `AnimaLearn-Admin/`:** separate static site (same no-build vanilla JS pattern), reuses the main app's design tokens. Single dedicated Firebase Auth account is the "admin login" (not a hardcoded password check in JS — that would be bypassable via view-source). Real enforcement is a Firestore security rule restricting writes to `broadcasts` to that one UID. Setup steps and the rule to paste are in `AnimaLearn-Admin/firestore-rules-addition.md`.
- **Still needed before this works live:** create the admin Firebase Auth account in the console, get its UID, paste into `AnimaLearn-Admin/config.js` (`ADMIN_UID`) and into the Firestore rule, publish the rule, deploy `AnimaLearn-Admin` as its own Vercel project. None of this was done by Claude — it can't create Firebase Auth users or touch the Vercel/Firebase consoles.
- Hit and fixed a self-inflicted bug while editing `js/db.js`: a `str_replace` edit inserted literal `\r` text (backslash + r) instead of actual carriage returns, which broke JS syntax. Caught it by running `new Function(source)` as a syntax check on every edited file before calling it done — worth doing that check after any edit to these minified single-line-per-function files going forward, since a visual diff is easy to misread.

## 2026-07-15 — Docs bootstrap + duplicate-file discovery

- Generated `architecture.md`, `phases.md`, `rules.md`, `design.md` (this file's siblings) from a fresh export of the project (`AnimaLearn.zip`).
- **Found and flagged a structural issue**: the export contains two copies of every core script — one at project root, one under `js/`. `index.html` and `sw.js` both load exclusively from `js/`. File timestamps show the **root-level copies are newer**, meaning recent VS Code edits were likely made to files the deployed app never actually loads. This needs to be resolved before further feature work — see `rules.md` §0 and `architecture.md` §9.
- Observed from a VS Code screenshot around this time: a `git push` on `main` failed with "no upstream branch," resolved via `git push --set-upstream origin main`. Also a known pattern: commits sometimes get attributed to an alternate GitHub account (`omega100crust`) — worth double-checking `git config` before committing on this repo specifically, not just others.
- `prd.md` (dated July 2026, status "Live, actively iterating") is the authoritative product spec this project's docs were derived from. Re-read it before making roadmap decisions — it already has an explicit roadmap (usage tracking → student feedback → topic expansion → visible progress UI → smoke tests) that phases.md mirrors.

## Baseline facts worth not re-deriving each session

- **Stack:** vanilla HTML/CSS/JS, no build step, Tailwind via CDN, Firebase (Auth + Firestore) as the only backend, Vercel hosting, PWA via `manifest.json` + `sw.js`.
- **Firebase project id:** `animalearn-c9790`.
- **Live URL:** anima-learn.vercel.app.
- **Scale:** 33 topics live across Math (Calculus, Linear Algebra, Differential Equations, Sequences & Series) and Physics (Mechanics, Waves & Oscillations, E&M, Modern Physics), 9 reusable Canvas animation types, 22 curated references.
- **Content bottleneck** is the acknowledged #1 risk in the PRD — each topic needs a hand-built animation, not just a data entry. No usage analytics exist yet, so which topics to build next is currently guesswork.
- **Single maintainer** (Sharvil), no tests exist anywhere in the repo.
- **"Made with ❤️ by @Sharvil Mishra"** is in the sidebar footer — this is a personal/portfolio-flavored project, not anonymous.

## Open questions to revisit
- Is `html2pdf.js` (loaded in `index.html`) actually wired to a feature (PDF export of notes/theory), or was it added and never used? Check before removing or building on top of it.
- Firestore security rules aren't in this export — confirm they exist and match the "user can only touch their own `uid`" assumption baked into `db.js` before treating that as verified rather than intended.
- Root vs `js/` duplicate files: once resolved, note the resolution here and delete this open item.
