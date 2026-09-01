# Life Stack Frontend Roadmap

> **Next product feature:** Socials — a private audience-growth dashboard across multiple social platforms.
>
> Railway deployment remains the immediate release/setup task, but Socials is the next application feature to design and implement.

## Status legend

- [ ] Planned
- [x] Implemented
- Items are ordered by dependency inside each section.

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

## Longer-term product ideas

- [ ] Income tracking and cash-flow forecasting.
- [ ] Goals, habits, workouts, and personal analytics.
- [ ] Notes and journaling.
- [ ] Unified notification centre for expiring bank consent, overdue invoices, upcoming commitments, and failed social syncs.
- [ ] Export and account-level data deletion tools.
