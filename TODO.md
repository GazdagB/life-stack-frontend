# Life Stack TODO

## Later

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
