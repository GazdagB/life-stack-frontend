# Life Stack TODO

## Later

### Statutory invoice delivery

- [ ] Connect Gazd Systems to NAV Online Számla 3.0 using encrypted technical-user credentials, submission retries, and acceptance polling.
- [ ] Generate and validate EN 16931/XRechnung or an eligible hybrid e-invoice for applicable Gavod Gebäudeservice B2B invoices.
- [ ] Add outbound invoice email delivery and retain a delivery audit trail.

### AI movie recommendations

- [x] Recommend a movie from the user's 10 most recently rated films; do not include want-to-watch items without a rating.
- [x] Weight the user's personal scores and critiques more strongly than external ratings.
- [x] Send only the minimum movie metadata required to the model and document the privacy boundary.
- [x] Exclude movies already present in either personal movie list.
- [x] Return a concise explanation that connects the recommendation to specific preferences without inventing facts.
- [ ] Add feedback controls so accepted and rejected recommendations can improve later suggestions.

### Automatic bank transaction tracking

- [ ] Confirm the countries and exact banks that need to be supported.
- [ ] Evaluate a licensed read-only open-banking provider, starting with GoCardless Bank Account Data.
- [ ] Verify institution coverage, production access requirements, pricing, consent duration, and refresh limits.
- [ ] Add a secure **Connect bank** flow with institution selection, provider-hosted consent, and redirect handling.
- [ ] Never collect or store online-banking credentials in Life Stack.
- [ ] Add backend models for bank connections, bank accounts, synchronization state, and imported transactions.
- [ ] Store provider secrets only in backend environment variables and encrypt sensitive connection data at rest.
- [ ] Import booked debit transactions and balances through the provider API.
- [ ] Deduplicate imported transactions using stable provider transaction and account identifiers.
- [ ] Map imported transactions into expenses without overwriting manually entered expenses.
- [ ] Add merchant-based automatic categorization with editable rules and manual corrections.
- [ ] Add scheduled synchronization, manual refresh, last-synced status, and actionable error handling.
- [ ] Handle expired consent and account reconnection cleanly; expect periodic reauthorization.
- [ ] Support disconnecting a bank and revoking provider consent without deleting historical expenses unexpectedly.
- [ ] Add CSV import as a fallback for unsupported banks.
- [ ] Test the full flow in the provider sandbox before connecting a real account.
- [ ] Review PSD2/GDPR, retention, audit logging, and deletion requirements before any multi-user release.
