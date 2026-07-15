# Product Requirements Document: AnimaLearn

**Author:** Sharvil Mishra
**Status:** Live (MVP shipped, actively iterating)
**Last updated:** July 2026

---

## 1. Problem Statement

Students struggle with math and physics not because the concepts are inherently too hard, but because they're taught almost entirely through static symbols and equations. Ideas like limits, derivatives, wave interference, or eigenvectors are fundamentally *visual and dynamic* — what a curve does as a variable changes, how a wave behaves over time — but textbooks and lectures present them as fixed formulas. Without a way to see the concept move, students memorize procedures instead of building real intuition.

This is a firsthand problem: the founder experienced this gap directly as a student, and built AnimaLearn to fix it for himself and others in the same position.

## 2. Goal

Give students an interactive way to *see* math and physics concepts change in real time, paired with concise theory notes, so intuition builds alongside — rather than in place of — the formal math.

**Primary success signal:** students report that a specific animation made a concept "click" after the equation alone hadn't.

## 3. Target Users

- High school and early undergraduate students studying calculus, linear algebra, differential equations, and introductory-to-intermediate physics.
- Self-learners revisiting these topics outside a classroom (exam prep, review).
- Not initially targeting instructors or classroom/LMS integration — this is a self-directed study tool.

## 4. Non-Goals (for now)

- Not a full course platform (no video lectures, no structured curriculum path/enrollment).
- Not building a general-purpose graphing calculator (each animation is purpose-built per concept, not a blank canvas).
- Not currently targeting institutional/classroom adoption, grading, or teacher dashboards.
- No mobile native app — PWA covers the "installable on phone" need.

## 5. Current Feature Set (Shipped)

### 5.1 Animation Engine
- Custom HTML5 Canvas engine — not a third-party charting library — giving full control over pedagogy-first visuals.
- Each topic has a **purpose-built, interactive animation** (drag a point, adjust a slider) rather than a passive video, so students manipulate the concept rather than just watch it.
- Retina-aware rendering, theme-aware color palettes (adapts to dark/light mode), play/pause and speed controls.

### 5.2 Content Library
- **33 topics live**, spanning:
  - Mathematics: Calculus, Linear Algebra, Differential Equations, Sequences & Series
  - Physics: Mechanics, Waves & Oscillations, Electricity & Magnetism, Modern Physics
- Each topic pairs its animation with **LaTeX-rendered theory notes** (via KaTeX) and a **curated reference list** (books, papers, videos, websites) for deeper reading.
- Topics are tagged by difficulty (beginner/intermediate/advanced) and organized by subject in the sidebar.

### 5.3 Accounts & Personalization
- Email/password auth plus Google and GitHub OAuth (Firebase Authentication).
- Per-user **notes system** — students can write and save their own notes per topic.
- **Progress tracking** per topic, synced to the user's account.
- **Notifications** (e.g. account/session events), with unread badges.
- Difficulty preference set at registration, used to tailor experience.

### 5.4 Platform / Experience
- Installable **PWA** with offline support via service worker.
- Dark/light theming with a custom (non-default) color system.
- Global search across topics, notes, and references (Ctrl+K shortcut).
- Fully responsive, mobile-friendly sidebar navigation.
- Accessibility basics: `prefers-reduced-motion` respected, ARIA labels on key navigation.

## 6. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla JavaScript (no framework), Tailwind CSS, custom CSS design system |
| Rendering | HTML5 Canvas (animations), KaTeX (math notation) |
| Backend | Firebase Authentication + Firestore (no custom server) |
| Hosting | Vercel |
| Distribution | PWA (manifest + service worker) |

**Why no framework/backend server:** the app's complexity lives in the content (animations + theory) rather than in application architecture, so a lightweight vanilla JS + Firestore approach ships faster and is easier for a solo builder to maintain than a React + custom-backend stack would be at this stage.

## 7. Data Model (Firestore)

```
users/{userId}
  - name, email, difficulty, createdAt
  users/{userId}/notes/{noteId}
  users/{userId}/progress/{topicId}
  users/{userId}/notifications/{notifId}
```

Access is restricted via Firestore security rules so a user can only read/write documents under their own `userId`.

## 8. Risks & Open Issues

- **Content creation is the bottleneck.** Each new topic requires a hand-built animation, not just a data entry — this is high-quality but slow to scale. Worth deciding whether some future topics can share animation "families" (e.g. a generic wave-superposition engine reused across several wave topics) to speed up production.
- **No usage analytics yet.** There's no current way to see which animations students actually engage with vs. skip, or where they drop off. Without this, prioritizing the next 10 topics is guesswork.
- **Single-maintainer risk.** All code and content currently depend on one person; no tests exist to catch regressions as more topics are added.
- **No feedback loop from real students yet** on which animations actually produce the "click" moment vs. which ones look nice but don't teach.

## 9. Roadmap / Next Steps (Proposed)

1. **Instrument basic usage tracking** (which topics are opened, animation interaction, time spent) to replace guesswork with data.
2. **Get structured feedback from a small group of real students** — which topics confused them before/after, which animations helped, which didn't land.
3. **Expand topic coverage** based on the above, rather than by founder intuition alone.
4. **Surface progress more visibly** in the UI (e.g. "8/12 Calculus topics covered") to reinforce motivation, since the data already exists in Firestore.
5. **Add lightweight regression protection** (even basic smoke tests confirming each topic's animation key resolves and renders) as topic count grows past 33.

## 10. Success Metrics (Proposed, since none are tracked yet)

- Number of active students returning to complete additional topics (retention proxy for "this actually helps").
- Ratio of topics started vs. completed per user.
- Qualitative feedback: does a specific animation get mentioned as "the thing that made it click"?
