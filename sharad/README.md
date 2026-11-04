# Sharad Pandey Learning

A responsive learning platform for practical digital skills. The site combines a public course and resource experience with student accounts, lesson progress, and an admin dashboard.

**Live site:** https://sharad-pandey-learning.pinkflea512.chatgpt.site

## Product features

- Responsive education landing page with course, events, audience, and resource sections
- Student sign-in and learner dashboard
- Published course paths and lesson progress backed by Cloudflare D1
- Admin dashboard and student activity overview
- Analytics tracking API
- Animated freelancer project and sample USD payment feature with reduced-motion support
- GSAP and Locomotive Scroll page motion

## Stack

TypeScript, React, Vinext, Cloudflare Workers, Cloudflare D1, GSAP, and Locomotive Scroll.

## Local development

Use Node.js 22.13 or newer. Install dependencies with the repository's configured package manager, then run:

```bash
npm run dev
```

Create a local `.dev.vars` file only if your development setup requires local authentication or service values. Never commit credentials or production secrets.

Build the production Worker bundle with:

```bash
npm run build
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Public learning homepage |
| `/login` | Student sign-in |
| `/dashboard` | Student learning dashboard |
| `/learn/:slug` | Course lesson experience |
| `/admin` | Admin dashboard |

## Project layout

- `app/` — application routes, UI, and API handlers
- `app/components/` — reusable interface components, including scroll motion
- `db/` — D1 access and database helpers
- `worker/` — Cloudflare Worker entry point
- `.openai/hosting.json` — hosting project and database binding configuration

## Profile README draft

A polished GitHub profile README is available in [`github-profile/README.md`](github-profile/README.md). To publish it as a GitHub profile, create a public repository whose name exactly matches your GitHub username and place that content in its root `README.md`.
