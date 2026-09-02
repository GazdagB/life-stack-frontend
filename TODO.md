# Life Stack Frontend Roadmap

> **Next product feature:** AI Task Assistant — scan TODOs, explain what AI can help with, and safely generate reviewed artifacts such as letters and PDFs.
>
> Socials remains planned after the AI Task Assistant foundation is stable.

## Status legend

- [ ] Planned
- [x] Implemented
- Items are ordered by dependency inside each section.

## Next: AI Task Assistant workspace

### Task assessment experience

- [x] Add an **AI Assistant** view under Tasks with an explicit “Assess my TODOs” action.
- [x] Display `Fully AI-actionable`, `AI can help`, and `Human action required` as distinct icon-and-text states that do not rely on colour alone.
- [x] Show confidence, a concise explanation, missing information, AI-capable steps, and human-required steps on every assessed task.
- [x] Add filters for assessment state and stale assessments.
- [ ] Add filters for due date and possible AI preparation type.
- [x] Make changed TODOs visibly stale until reassessed rather than silently showing an outdated decision.
- [ ] Let users correct an assessment and explain why without automatically training on private text.
- [x] Provide empty, loading, and conservative provider-fallback states.
- [ ] Add distinct quota and provider-unavailable retry states.

### Safe action and review flow

- [ ] Show only actions implemented by Life Stack, such as draft letter, improve text, create checklist, translate, summarise, or generate PDF.
- [ ] Require a deliberate user click before preparing any AI action.
- [ ] Show an editable draft and required-information checklist before PDF generation.
- [ ] Provide regenerate, compare, accept, download, delete, and cancel controls.
- [ ] Clearly separate completed AI work from remaining human work.
- [ ] Never show an action as completed merely because a draft was generated.
- [x] Never provide automatic send, signature, payment, cancellation submission, or account-login controls without a separately reviewed integration.

### Cancellation-letter MVP

- [ ] Add a guided German cancellation-letter flyout for tasks such as “Verdi subscription cancellation letter.”
- [ ] Collect sender and recipient addresses, membership/contract number, requested cancellation date, and optional notes.
- [ ] Preview the generated `Kündigungsschreiben` as editable text before creating the PDF.
- [ ] Show a printable PDF preview with address window layout, subject, body, place/date, and blank handwritten-signature area.
- [ ] Show the remaining human checklist: verify, print, sign, retain a copy, and send.
- [ ] Allow the accepted PDF and draft to be downloaded or deleted from the task.

### Accessibility, localization, and trust

- [x] Add every implemented assessment label, explanation, and warning in English, German, and Hungarian.
- [ ] Keep formal-letter content language separate from the application-interface language.
- [ ] Make assessment cards, forms, draft comparison, and PDF preview keyboard accessible.
- [x] Explain which TODO fields are sent to the AI provider and that model storage is disabled.
- [x] Never render raw model output as HTML; use typed structured fields and escaped text.
- [ ] Add responsive desktop, tablet, and mobile layouts plus clear print/download feedback.

## Next: Socials workspace

### Product and navigation

- [ ] Add a top-level **Socials** sidebar item with platform-aware iconography.
- [ ] Add `/socials` for the overview and `/socials/accounts/:accountId` for account details.
- [ ] Define the first supported platform identifiers: YouTube, Instagram, Facebook, TikTok, X, Twitch, LinkedIn, and GitHub.
- [ ] Treat “subscriber”, “follower”, and “audience” as platform-specific labels while using “audience” only for cross-platform summaries.
- [ ] Allow more than one account per platform.
- [ ] Clearly label automatic, manual, stale, disconnected, and error states.

### Overview experience

- [ ] Show combined audience count, seven-day change, 30-day change, and number of connected accounts.
- [ ] Explain that combined audience is a sum of platform counts, not deduplicated people.
- [ ] Add one card per account with platform icon/colour, display name, handle, current metric, last update, and recent delta.
- [ ] Add filters for platform, business/project label, connection status, and date range.
- [ ] Add a responsive historical chart with seven-, 30-, 90-, 365-day, and all-time ranges.
- [ ] Allow absolute-value and percentage-growth chart modes.
- [ ] Add empty, loading, stale-data, partial-failure, and no-history states.

### Account detail and management

- [ ] Add a detail drawer/page with account metadata, current metric, growth history, and synchronization history.
- [ ] Add account create/edit form with platform, handle, profile URL, display name, colour, labels, and tracking mode.
- [ ] Add a manual snapshot form with date, follower/subscriber count, and optional note.
- [ ] Add CSV import preview, validation, duplicate handling, and confirmation.
- [ ] Add connect and reconnect actions for official OAuth providers.
- [ ] Add disable tracking and delete confirmation flows; explain the difference between disconnecting credentials and deleting historical snapshots.
- [ ] Never request or render provider passwords or raw provider tokens.

### Visual design and accessibility

- [ ] Use Iconify/Simple Icons for official brand marks and Lucide for generic actions.
- [ ] Preserve recognisable platform colours without relying on colour alone to communicate state.
- [ ] Make charts keyboard-readable and provide a tabular data alternative.
- [ ] Use locale-aware compact-number and percentage formatting.
- [ ] Support desktop, tablet, collapsed-sidebar, and mobile layouts.
- [ ] Add all copy in English, German, and Hungarian before marking the feature complete.

### Frontend data layer

- [ ] Add typed social platform, account, snapshot, summary, and sync-status models to `src/lib/api.ts`.
- [ ] Add account CRUD, snapshot, chart-series, OAuth-start, OAuth-callback, sync, and CSV-import API methods.
- [ ] Keep OAuth callbacks on a protected route and display actionable provider errors.
- [ ] Prevent duplicate sync requests and stale responses in account search/connection flows.
- [ ] Cache only non-sensitive display state; never persist provider credentials in browser storage.

### Acceptance criteria

- [ ] A user can add at least one manual social account and record historical counts.
- [ ] A user can inspect accurate seven- and 30-day changes calculated from backend snapshots.
- [ ] At least one official API provider can connect, sync, reconnect, and disconnect end to end.
- [ ] A failed provider does not prevent other platform cards and charts from rendering.
- [ ] Deleting or disconnecting requires explicit confirmation and follows the selected history-retention behaviour.
- [ ] Build, lint, authentication expiry, responsive layout, and all three languages are verified.

## Railway release preparation

- [x] Add a production multi-stage frontend Dockerfile.
- [x] Serve the SPA and proxy `/api` through Caddy.
- [x] Add Railway health-check and restart configuration.
- [x] Add public privacy and terms pages.
- [ ] Replace the legal operator placeholder and add a public contact email.
- [ ] Create the Railway project, frontend, private backend, and PostgreSQL services in one EU region.
- [x] Configure build-time frontend variables and private `BACKEND_UPSTREAM`.
- [x] Attach `lifeos.gazdagbalazs.com` and verify Railway-managed TLS.
- [ ] Test SPA deep links, secure cookies, API proxying, mobile navigation, and legal pages on the production hostname.

## Automatic bank transaction tracking

- [x] Support German and Hungarian institution discovery.
- [x] Add institution selection, hosted consent, callback, manual sync, disconnect, and import-inbox screens.
- [x] Keep bank credentials outside Life Stack and expose only read-only account/transaction data.
- [x] Review booked debits before creating expenses.
- [x] Add initial merchant category suggestions with user correction.
- [ ] Test the complete provider sandbox flow.
- [ ] Add scheduled synchronization and visible next-sync information.
- [ ] Add expired-consent and reconnection guidance.
- [ ] Add CSV import for unsupported institutions.
- [ ] Complete PSD2/GDPR retention and deletion review before broader use.

## Movie intelligence

- [x] Search and save OMDb movies.
- [x] Track want-to-watch and watched/rated lists.
- [x] Recommend four unseen films from recent ratings and critiques.
- [x] Add AI-assisted critique rewriting with preview, rephrase, accept, and cancel.
- [x] Add watched-movie categorisation using normalized genres, with category chips, filtering, grouping, and per-category counts.
- [x] Add a movie statistics/superlatives section powered by backend aggregates: longest watched movie, highest personal rating, oldest release, newest release, and most recently watched.
- [x] Show ties instead of silently choosing one movie when multiple watched movies share a winning value.
- [x] Add useful empty and incomplete-metadata states when runtime, release year, rating, genre, or watched date is unavailable.
- [ ] Add recommendation accept/reject feedback controls.
- [ ] Show why feedback changed later recommendations without exposing prompt internals.

## Private access control

- [ ] Add clear login messaging for accounts rejected by the private email allowlist without revealing whether an email is registered.
- [ ] Add an owner-only settings view that shows the configured allowed email addresses and explains that changes are made through protected server configuration.
- [ ] Prevent profile email changes to addresses outside the backend-enforced allowlist.
- [ ] Add English, German, and Hungarian copy for allowlist-related states and errors.

## Business and invoicing

- [x] Manage multiple businesses and segmented clients.
- [x] Create, inspect, edit, issue, credit, pay, delete, and export invoices.
- [x] Support logos, signatures, modern/classic templates, and selectable line-item units.
- [ ] Add outbound invoice email with a delivery audit trail.
- [ ] Add NAV Online Számla status and retry views.
- [ ] Add EN 16931/XRechnung validation and delivery status views.

## Net worth tracking

- [x] Add a top-level **Net worth** workspace separate from day-to-day expenses.
- [x] Show total net worth, total assets, and total liabilities in clear summary cards.
- [x] Add asset and liability management for cash, linked bank accounts, investments, property, vehicles, businesses, loans, credit cards, and custom items.
- [x] Make linked balances visually distinct from manual valuations and prevent accidental double-counting.
- [ ] Add monthly and all-time net-worth charts with asset-versus-liability breakdowns.
- [ ] Add category, ownership, currency, liquidity, and data-source filters.
- [x] Support daily valuation snapshots, editing, active/inactive state, and delete confirmation flows.
- [ ] Explain stale valuations and show when each account or asset was last updated.
- [x] Add responsive empty, loading, and per-currency states in English, German, and Hungarian.
- [ ] Provide an accessible table alternative for every chart and locale-aware currency formatting.

## Longer-term product ideas

- [ ] Income tracking and cash-flow forecasting.
- [ ] Goals, habits, workouts, and personal analytics.
- [ ] Notes and journaling.
- [ ] Unified notification centre for expiring bank consent, overdue invoices, upcoming commitments, and failed social syncs.
- [ ] Export and account-level data deletion tools.
