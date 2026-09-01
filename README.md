# Life Stack Frontend

The browser application for **Life Stack**, a private personal operating system for two owners. It brings expenses, recurring commitments, bank imports, tasks, movies, business invoicing, profile management, and account security into one responsive workspace.

> Status: active personal project. The application is being prepared for a private Railway deployment at `lifeos.gazdagbalazs.com`; it is not designed as a public multi-tenant SaaS product.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology](#technology)
- [Routes](#routes)
- [Local development](#local-development)
- [Configuration](#configuration)
- [Authentication model](#authentication-model)
- [Internationalisation](#internationalisation)
- [Project structure](#project-structure)
- [Production deployment](#production-deployment)
- [Security and privacy](#security-and-privacy)
- [Quality checks](#quality-checks)
- [Next feature: Socials](#next-feature-socials)

## Features

| Area | What the frontend provides |
| --- | --- |
| Dashboard | At-a-glance summaries for personal activity and finances. |
| Expenses | Add, describe, edit, inspect, delete, categorise, and chart one-time spending. |
| Recurring commitments | Forecast active subscriptions, insurance, taxes, instalments, and other commitments across daily, weekly, monthly, and yearly views. |
| Bank accounts | Connect supported German and Hungarian institutions through Enable Banking, synchronise read-only data, and review booked debits before importing them as expenses. |
| Tasks | Track all, today, and completed tasks with priority and status. |
| Movies | Search OMDb, maintain watch lists, rate watched films, write or AI-polish critiques, and request preference-aware recommendations. |
| Business | Manage multiple legal businesses and client segments, prepare invoices, apply branding and signatures, record payments, and download PDFs. |
| Profile | Edit account details, biography, and profile image. |
| Settings | Select English, German, or Hungarian; change passwords; inspect and revoke active browser sessions. |
| Legal | Public privacy and terms pages required by hosted integrations. |

## Architecture

```text
Browser
  │
  ├── /*       React single-page application
  └── /api/*   same-origin API requests with HttpOnly cookies
         │
         ▼
      Caddy
         │ strips /api
         ▼
FastAPI at backend.railway.internal:8000
```

During local development, Vite performs the same `/api` proxying to `http://127.0.0.1:8000`. In production, Caddy serves the built application, supplies the SPA fallback, and sends API traffic through Railway's private network. Secrets never belong in the frontend bundle.

## Technology

- React 19 and TypeScript 6
- Vite 8 with the React Compiler
- React Router 7
- Tailwind CSS 4
- shadcn-style components built on Radix UI
- Lucide for interface icons and Iconify for brand artwork
- Recharts for spending visualisations
- i18next and react-i18next for English, German, and Hungarian
- Caddy for production static serving and same-origin reverse proxying
- ESLint for static analysis

## Routes

Public routes:

| Route | Purpose |
| --- | --- |
| `/login` | Sign in. Signed-in users are redirected to the dashboard. |
| `/privacy` | Public privacy notice. |
| `/terms` | Public terms of use. |

Authenticated routes:

| Route group | Pages |
| --- | --- |
| `/dashboard` | Main dashboard. |
| `/todos/*` | All tasks, today, and completed tasks. |
| `/expenses/*` | Expenses, recurring commitments, coverage forecast, overview charts, bank connections, callback, and import inbox. |
| `/movies/*` | Discovery, want-to-watch, watched and rated, and AI suggestions. |
| `/business/*` | Business overview, clients, and invoices. |
| `/profile` | Profile and avatar editing. |
| `/settings` | Language and security settings. |

Routes are lazy-loaded. Unknown URLs return to `/dashboard`, while protected routes wait for the authentication check before rendering private content.

## Local development

### Prerequisites

- Node.js 22 or newer
- npm
- The [Life Stack backend](https://github.com/GazdagB/life-stack-backend) running on `127.0.0.1:8000`
- PostgreSQL is required by the backend, not by this repository

### Setup

```shell
git clone https://github.com/GazdagB/life-stack-frontend.git
cd life-stack-frontend
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api/*` to the local backend and removes the `/api` prefix before forwarding.

Do not use `VITE_*` for secrets. Vite embeds those values into downloadable browser JavaScript.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Browser-visible API prefix. Keep `/api` for local and Railway same-origin deployments. |
| `VITE_LEGAL_OPERATOR_NAME` | Placeholder | Public operator name displayed on legal pages. Replace it before deployment. |
| `VITE_LEGAL_CONTACT_EMAIL` | Empty | Public privacy/contact email displayed on legal pages. |

Restart the development server after changing environment values. Production values are build-time arguments declared in the frontend Dockerfile.

## Commands

```shell
npm run dev       # Vite development server with API proxy
npm run build     # Type-check and create the production bundle
npm run lint      # ESLint across the project
npm run preview   # Preview the Vite bundle without the Caddy proxy
```

`npm run preview` is useful for visual checks but is not a full production simulation because `/api` proxying belongs to Caddy in the deployed image.

## Authentication model

- Authentication uses backend-issued `HttpOnly` cookies, not tokens stored in JavaScript-accessible storage.
- Every API request includes credentials through the central authenticated fetch wrapper.
- A `401` triggers one coordinated refresh attempt; the Web Locks API prevents multiple tabs from rotating the refresh token simultaneously.
- A failed refresh emits a shared expiration event and returns the user to the login flow.
- Protected routes prevent private pages from rendering before session validation.
- Browser-profile device identity is managed by another long-lived `HttpOnly` cookie; the UI can revoke other sessions without accessing raw tokens.

## Internationalisation

The supported languages are:

- `en` — English
- `de` — German
- `hu` — Hungarian

Translations are divided by domain under `src/locales/`. The account preference is persisted by the backend and loaded across devices. When adding a feature:

1. Create or extend the relevant locale namespace.
2. Add all three language resources.
3. Register a new namespace in `src/i18n.ts` when necessary.
4. Use translation keys for headings, labels, validation, empty states, dialogs, and error messages—not only sidebar navigation.

## Project structure

```text
src/
├── components/       reusable application and UI components
│   └── ui/           shadcn/Radix primitives
├── hooks/            shared React hooks
├── lib/              API client, authentication, categories, and utilities
├── locales/          domain translations for en/de/hu
├── pages/            route-level feature pages
├── App.tsx           route definitions and lazy loading
├── i18n.ts           translation registration and language state
└── main.tsx          application bootstrap

Caddyfile             production SPA server and /api proxy
Dockerfile            Node build stage + minimal Caddy runtime
railway.json          Railway health and restart configuration
```

Keep network calls in `src/lib/api.ts` and feature pages focused on state and presentation. Reuse the existing UI primitives instead of creating slightly different controls in each page.

## Production deployment

The production image is a multi-stage build:

1. Node installs the locked npm dependencies.
2. TypeScript and Vite produce immutable static assets.
3. Only `/dist` and the Caddy configuration enter the runtime image.
4. Caddy listens on Railway's `PORT`, serves the SPA, and proxies `/api` to `BACKEND_UPSTREAM`.

Recommended Railway frontend variables:

```dotenv
PORT=8080
BACKEND_UPSTREAM=backend.railway.internal:8000
VITE_API_URL=/api
VITE_LEGAL_OPERATOR_NAME=<real operator name>
VITE_LEGAL_CONTACT_EMAIL=<public contact email>
```

Only the frontend receives a public domain. The backend and PostgreSQL remain private. The intended custom hostname is `lifeos.gazdagbalazs.com`.

The Caddy configuration also provides:

- `/healthz` for Railway deployment checks
- gzip and Zstandard compression
- immutable caching for fingerprinted assets
- clickjacking, MIME-sniffing, referrer, permissions, and HSTS headers
- `index.html` fallback for refreshed React routes

## Security and privacy

- Never commit `.env`; only `.env.example` belongs in Git.
- Never expose OMDb, OpenAI, Enable Banking, database, JWT, or encryption secrets through `VITE_*` variables.
- Keep the backend on Railway private networking.
- Preserve same-origin `/api` routing so secure cookies and origin checks remain predictable.
- Public legal pages must contain accurate operator/contact information before linking production accounts.
- Bank passwords, PINs, TANs, and social-platform passwords must never pass through Life Stack.
- Treat profile images, invoices, bank transactions, and future social metrics as personal data.
- Review any new third-party browser request before adding it to the application.

## Quality checks

Run these before committing:

```shell
npm run build
npm run lint
git diff --check
```

For deployment changes, also validate the Caddyfile with the current Caddy release and test:

- `/healthz`
- a deep-link refresh such as `/movies/watched`
- `/api/auth/me`
- login, refresh, and logout cookie behaviour
- all three languages at desktop and mobile widths

## Next feature: Socials

The next product implementation is a **Socials** workspace for tracking audience growth across multiple platforms. The first version should support manually managed accounts and daily snapshots, then add official provider adapters where API access is practical.

Planned UX:

- One overview card per social account with platform icon, handle, current audience, and recent change.
- Combined cross-platform audience total without pretending followers on different platforms are unique people.
- Seven-, 30-, and 90-day deltas and growth percentages.
- Per-account historical line charts and a cross-platform comparison chart.
- Connect, reconnect, disable, edit, and remove account actions.
- Manual metric entry and CSV import as fallbacks for restricted platforms.
- English, German, and Hungarian copy from the first implementation.

Use official OAuth/API integrations and backend-held credentials only. Do not scrape logged-in pages, ask for account passwords, or place provider tokens in the browser. The full acceptance checklist is maintained in [TODO.md](./TODO.md).

## Related repository

- Backend: [GazdagB/life-stack-backend](https://github.com/GazdagB/life-stack-backend)

This is a private personal application. No open-source licence has been granted unless a licence file is added explicitly.
