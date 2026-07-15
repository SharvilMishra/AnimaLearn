# Architecture — AnimaLearn

## 1. Overview

AnimaLearn is a single-page, no-build, vanilla JS web app. There is no bundler, no framework, and no custom backend — everything runs as plain `<script>` tags loaded in order, talking directly to Firebase from the browser.

```
Browser (index.html)
 ├─ CDN scripts: Tailwind (JIT via CDN), KaTeX, html2pdf, Font Awesome, Google Fonts
 ├─ Firebase compat SDKs: app, auth, firestore (v10.7.1, loaded via <script> tags)
 └─ App scripts (loaded in this exact order):
      js/config.js   → Firebase init, TOPICS + REFERENCES data, global `state`
      js/utils.js    → theme, toasts, KaTeX rendering, notification UI helpers
      js/auth.js     → login/register/OAuth, auth state listener
      js/db.js       → all Firestore reads/writes
      js/router.js   → hash-based navigation, page switch
      js/animations.js → Canvas animation engine + ANIMATIONS registry
      js/pages.js    → HTML string renderers for every page/view
      js/app.js      → global event listeners, init()
```

No module system — every function and the `state` object are globals attached implicitly via `<script>` load order. Load order in `index.html` is load-bearing: a file that references something from a later script will break.

## 2. Runtime data flow

1. `config.js` runs first: initializes Firebase, defines `state` (the single in-memory store), and defines static content (`TOPICS`, `REFERENCES`).
2. `auth.js` registers `auth.onAuthStateChanged`. On login, it hydrates `state.user` / `state.uid`, pulls the user's Firestore profile, then calls `loadUserDataFromFirestore()`.
3. `db.js` (`loadUserDataFromFirestore`) fetches `notes`, `progress`, and `notifications` sub-collections into `state`, then calls `navigate(state.currentPage)` to (re)render now that data exists.
4. `router.js`'s `navigate(page, param)` is the single entry point for changing views. It stops any running animation, updates `state.currentPage`, swaps `#mainContent.innerHTML` using an `render*()` function from `pages.js`, then calls the matching `init*()` function to wire up event handlers for that view. It also pushes to `history` for back/forward support.
5. `pages.js` render functions are pure string templates over `state` + `TOPICS`/`REFERENCES`. `init*()` functions attach listeners the templates couldn't inline (e.g. drag handlers, canvas setup).
6. `animations.js` owns the Canvas rendering loop: `startAnimation(key, canvas)` looks up `key` in the `ANIMATIONS` registry and drives a `requestAnimationFrame` loop, reading live values from `state.animParams` / `state.animPlaying` / `state.animSpeed`.
7. User actions (save note, mark progress, etc.) go through `db.js` functions, which write to Firestore and usually mutate `state` + re-render/toast in the same breath — there is no reactive binding, every mutation site is responsible for updating the DOM it affects.

## 3. State model (`state` in config.js)

Single global object, no framework reactivity — anything that changes `state` must manually call the relevant render/update function afterward.

Key fields: `user`, `uid`, `currentPage`, `currentTopic`, `searchQuery`, `subjectFilter`, `notes`, `progress`, `theme`, `animParams`, `animPlaying`, `animSpeed`, `isLoading`, `animElapsedTime`, `lastFrameTime`, `activeTheoryTab`, `notifications`, `notifOpen`.

## 4. Firestore data model

```
users/{userId}
  - name, email, difficulty, createdAt
  users/{userId}/notes/{noteId}
  users/{userId}/progress/{topicId}
  users/{userId}/notifications/{notifId}   - { type, message, read, createdAt }
```

Security rules (not in this repo export, but referenced in the PRD) restrict every read/write to `request.auth.uid == userId`. Content itself (`TOPICS`, `REFERENCES`) is static, hardcoded in `config.js` — not stored in Firestore.

## 5. Animation engine

- `ANIMATIONS` is a plain object keyed by animation id (`limit`, `derivative`, `riemann`, `taylor`, `matrix`, `harmonic`, `fourier`, `vectorfield`, `doublependulum`). Each `TOPICS` entry references one of these by its `animation` field — several topics intentionally share the same animation.
- Each entry defines `title`, `description`, `params` (slider configs), and a `render(ctx, w, h, params, time, colors)` function that draws one frame directly with Canvas 2D calls (no charting library).
- `getCanvasColors()` returns a theme-aware palette so every animation redraws correctly on theme toggle without reinitializing.
- `startAnimation`/`stopAnimation` manage a single shared `requestAnimationFrame` handle (`currentAnimFrameId`); `router.js` calls `stopAnimation()` on every navigation to avoid leaked loops.

## 6. Auth

Firebase Authentication, three methods: email/password, Google OAuth, GitHub OAuth (all via `signInWithPopup`/`signInWithEmailAndPassword`/`createUserWithEmailAndPassword`). On first-time OAuth sign-in a `users/{uid}` profile doc is created if missing. All auth UI lives in a single modal in `index.html`, toggled between login/register views by `auth.js`.

## 7. PWA / offline

- `manifest.json` — standalone display, theme color `#8f43ee`, icons from `logo2.png`.
- `sw.js` — network-first for navigation/fetch, falls back to cache when offline; caches the exact list of `/js/*.js` + `/index.html` + `/styles.css` under a versioned `CACHE_NAME` (`animalearn-v3.01.01`). **The cached file list must be updated by hand whenever a script is added/removed**, and `CACHE_NAME` must be bumped on any meaningful change or clients will keep serving stale JS.
- Registered from an inline `<script>` in `index.html`, which also toasts the user when an update is installed.

## 8. Hosting / deployment

- Vercel, static hosting — no server-side code, no API routes.
- Firebase project: `animalearn-c9790` (Auth + Firestore only; no Storage/Functions currently used by the app code).

## 9. Known structural risk — duplicate JS files

This export contains **two copies** of every core script: one set at the project root (`app.js`, `auth.js`, `config.js`, `db.js`, `pages.js`, `router.js`, `sw.js`, `utils.js`, `animations.js`) and one set inside `js/`. `index.html` and `sw.js` only ever reference the `js/` copies — those are what actually ships. The root-level copies appear to be a stray duplicate (confirmed newer by file timestamp, meaning **recent edits may have been made to files that are not actually loaded by the app**). See `rules.md` for the mandatory fix/workflow. Treat `js/` as the single source of truth until this is resolved.
