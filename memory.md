# Memory — AnimaLearn

Running log of context, decisions, and things worth remembering between sessions. Newest entries at the top. Update this file whenever a non-trivial decision is made or a bug with a non-obvious cause is fixed.

---

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
