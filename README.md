# AnimaLearn

A platform that turns math and physics theory into interactive animations, built for students who struggle with abstract concepts due to a lack of visual/graphical intuition.

**Live:** [anima-learn.vercel.app](https://anima-learn.vercel.app)

## What it does

- **Custom animation engine** — every topic has its own hand-built, interactive canvas animation (not a generic graphing widget), with adjustable parameters so students can explore the concept themselves rather than just watch a video.
- **33 topics** across Calculus, Linear Algebra, Differential Equations, Sequences & Series, Mechanics, Waves & Oscillations, Electricity & Magnetism, and Modern Physics.
- **Theory notes with LaTeX rendering** (via KaTeX) alongside each animation, plus a curated reference library per topic.
- **Personal notes system** — students can write and save their own notes per topic.
- **Progress tracking** — tracks which topics a user has covered.
- **Accounts** via email/password or Google/GitHub sign-in, with notes and progress synced per user.
- **Dark/light themes**, installable as a PWA (offline-capable via service worker), fully responsive.

## Tech stack

- **Frontend:** Vanilla JavaScript (no framework), Tailwind CSS, custom CSS design system
- **Backend:** Firebase (Authentication + Firestore) — no separate server
- **Rendering:** HTML5 Canvas for all animations, KaTeX for math notation
- **Hosting:** Vercel
- **Other:** PWA with service worker for offline support and installability

## Status

MVP is live with 33 topics implemented (originally planned 10-15) and Firestore security rules in place to keep each user's notes/progress/notifications private.
