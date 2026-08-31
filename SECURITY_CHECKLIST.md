# Life Stack security checklist

Last reviewed: 2026-08-30

Scope: the React frontend, FastAPI backend, PostgreSQL database, external APIs,
invoice/client data, deployment infrastructure, and the two intended users.

This is a living engineering checklist, not a claim of certification. A checked
item means the control exists in the current code or was verified locally. An
unchecked item still requires implementation, deployment configuration, or a
documented operational decision.

## Recommended target

Because Life Stack is intended for only two people but contains financial,
client, profile, and invoice data, the safest practical architecture is:

```text
Internet
  -> identity-aware access gateway with MFA/passkeys
  -> HTTPS reverse proxy (same origin for UI and /api)
  -> React static files + private FastAPI service
  -> private PostgreSQL network/database
```

The gateway is valuable defense in depth: an attacker should have to pass both
the gateway and Life Stack authentication before reaching private data.

## P0 — required before exposing the application to the internet

- [ ] Put the entire application behind an identity-aware access gateway with
  MFA/passkeys, or implement phishing-resistant WebAuthn/passkeys directly.
- [ ] Serve only HTTPS and redirect HTTP to HTTPS at the reverse proxy.
- [ ] Serve the frontend and `/api` from one public origin where practical.
- [ ] Set the production environment values from the deployment checklist below.
- [ ] Generate a unique, cryptographically random `JWT_SECRET_KEY` of at least
  32 bytes; store it in the deployment secret store, never in Git.
- [ ] Rotate the current database password, OMDb key, and OpenAI key before the
  first public deployment if any may have been copied, logged, or shared.
- [ ] Keep PostgreSQL off the public internet; allow connections only from the
  backend network/security group.
- [ ] Create a least-privilege production database role that cannot create roles,
  databases, or extensions and owns only what migrations require.
- [ ] Enable encrypted database backups and complete a real restore test.
- [ ] Add centralized error/security logging and alerts for repeated login
  failures, `429` responses, refresh-token reuse, and unexpected `5xx` spikes.
- [ ] Run the complete test suite and authorization tests against a production-like
  staging environment.
- [ ] Complete an OWASP ASVS 5.0 Level 1 review and record accepted risks.

## Authentication and passwords

- [x] New passwords are hashed with Argon2id through `pwdlib`.
- [x] Legacy bcrypt hashes are supported and upgraded after successful login.
- [x] Unknown-user login performs a dummy password hash verification to reduce
  username-enumeration timing differences.
- [x] Login errors do not reveal whether the username exists.
- [x] Login attempts are persistently limited per account and client IP.
- [x] Rate-limit identifiers are HMAC fingerprints rather than raw usernames/IPs.
- [x] Successful login clears the applicable failed-login counters.
- [x] Public registration is disabled by default.
- [x] Password input supports show/hide without storing the password.
- [x] Raise the single-factor password minimum from 12 to 15 characters, while
  continuing to allow long passphrases and avoiding arbitrary composition rules.
- [ ] Check new passwords against a compromised/common-password blocklist.
- [ ] Add MFA or passkeys. For only two users, passkeys are preferable to SMS OTP.
- [ ] Require recent re-authentication before changing email, password, MFA,
  recovery settings, or other security-sensitive account attributes.
- [x] Require the current password and apply persistent account/IP throttling
  before changing the password.
- [ ] Design a recovery procedure that cannot be triggered using security
  questions or email alone; document who can perform recovery.
- [ ] Add notification for password, email, MFA, and recovery changes.

## Sessions and cookies

- [x] Access and refresh credentials are stored in `HttpOnly` cookies, not browser
  local storage.
- [x] Cookies use `SameSite=Strict`.
- [x] Production configuration requires `Secure` cookies.
- [x] Access tokens expire after 60 minutes.
- [x] Access tokens require issuer, audience, subject, issued-at, and expiry claims.
- [x] Access tokens are bound to a server-side refresh-session family so device
  revocation invalidates API access immediately.
- [x] Refresh tokens are random, stored only as hashes, rotated on refresh, and
  revoked on logout.
- [x] Refresh sessions have both a 7-day idle limit and a 30-day absolute limit.
- [x] Add an account page listing active devices/sessions with “revoke” and
  “revoke all other sessions” actions.
- [x] Assign a random `HttpOnly` browser-profile identifier and keep at most one
  active session per account and recognized browser profile without fingerprinting.
- [ ] Revoke all sessions after password reset, suspected compromise, or account
  recovery.
- [ ] Record and alert on refresh-token replay/reuse rather than treating it only
  as an invalid session.

## Authorization and data isolation

- [x] Expense, recurring expense, todo, movie, business, client, invoice, asset,
  and payment operations are scoped by authenticated `user_id`.
- [x] Uploaded logos, signatures, and avatars are fetched through authenticated,
  owner-scoped endpoints.
- [x] SQL values are passed as database parameters rather than interpolated into
  query strings.
- [ ] Add automated cross-user IDOR tests for every read, update, delete, download,
  logo, signature, PDF, and payment endpoint using two fixture users.
- [ ] Add role/permission checks before introducing any administrator or shared
  business functionality; do not infer authorization from hidden UI controls.
- [ ] Consider PostgreSQL row-level security as a second boundary if multi-user
  sharing or more users are introduced.

## CSRF, CORS, hosts, and browser boundaries

- [x] CORS uses explicit allowed origins and credentials; wildcard origins are
  not enabled.
- [x] Allowed methods and request headers are explicitly constrained.
- [x] `TrustedHostMiddleware` rejects unexpected `Host` headers.
- [x] State-changing requests reject disallowed `Origin` and cross-site Fetch
  Metadata requests.
- [x] `SameSite=Strict` cookies provide an additional CSRF barrier.
- [ ] Add a session-bound CSRF token or require a valid `Origin` on every browser
  state-changing request as defense in depth for clients without Fetch Metadata.
- [ ] Test the final proxy configuration to ensure it does not rewrite or discard
  `Origin`, `Host`, `X-Forwarded-Proto`, or client IP information incorrectly.
- [ ] Trust forwarded headers only from the known reverse-proxy IP, never from
  arbitrary internet clients.

## Security headers and frontend

- [x] API responses set `X-Content-Type-Options: nosniff`.
- [x] API responses deny framing with `X-Frame-Options: DENY`.
- [x] API responses use a restrictive `Referrer-Policy` and `Permissions-Policy`.
- [x] Authentication responses use `Cache-Control: no-store`.
- [x] Production API responses add HSTS and a restrictive API CSP.
- [x] Authentication tokens and personal data are not placed in `localStorage`;
  local storage currently contains only language and public icon cache data.
- [ ] Configure the frontend host/reverse proxy with a tested Content Security
  Policy, ideally without `unsafe-inline` or `unsafe-eval`.
- [ ] Add `Cache-Control: no-store` to sensitive authenticated financial, profile,
  client, invoice, and PDF responses where browser caching is unnecessary.
- [ ] Add `Cross-Origin-Opener-Policy` and an appropriate
  `Cross-Origin-Resource-Policy` after compatibility testing.
- [ ] Remove or generalize server/version headers at the public reverse proxy.
- [ ] Run Mozilla Observatory against the real HTTPS hostname after deployment.

## API validation, uploads, and abuse prevention

- [x] FastAPI/Pydantic validates structured request data and supported enums.
- [x] Avatar, logo, and signature uploads have size limits and file-signature/type
  validation.
- [x] Uploaded SVG is rejected for branding assets.
- [x] Movie AI requests minimize personal data and disable OpenAI response storage.
- [x] AI output is requested and parsed as structured data; the model cannot take
  autonomous actions in the application.
- [ ] Add global/per-user rate limits for expensive endpoints, especially movie
  search, AI recommendations, PDF generation, login refresh, and uploads.
- [ ] Enforce maximum request-body size at the reverse proxy and application.
- [ ] Decode and re-encode uploaded raster images, strip metadata, and enforce
  maximum pixel dimensions to mitigate malformed files/decompression bombs.
- [ ] Add explicit outbound HTTP connect/read timeouts and bounded retries for
  OMDb and OpenAI.
- [ ] Add spending/quota alerts and hard monthly limits for paid external APIs.
- [ ] Treat titles, critiques, OMDb data, and all model input as untrusted text;
  maintain structured-output validation and never give the recommendation model
  credentials or application tools.

## Database and data lifecycle

- [x] Foreign keys and owner columns protect core relationships.
- [x] Issued invoices preserve immutable seller/client/branding snapshots.
- [ ] Require TLS for PostgreSQL connections outside a private single-host setup
  and verify the database server certificate.
- [ ] Encrypt production disks, snapshots, and backups.
- [ ] Define backup frequency, retention, recovery-point objective, and
  recovery-time objective.
- [ ] Test restoration at least quarterly and record the result/date.
- [ ] Define retention and deletion rules for profiles, expenses, movie data,
  clients, draft invoices, issued invoices, logos, and signatures.
- [ ] Implement account data export and deletion procedures while preserving
  legally required invoice records.
- [ ] Document GDPR/privacy responsibilities for stored client and invoice data.

## Logging, monitoring, and incident response

- [ ] Add structured JSON application logs with request/correlation IDs.
- [ ] Log authentication success/failure, authorization denial, rate-limit events,
  session revocation, security-setting changes, and invoice lifecycle changes.
- [ ] Never log passwords, cookies, JWTs, refresh tokens, API keys, database URLs,
  full request bodies, signatures, or unnecessary personal/financial data.
- [ ] Protect logs from modification and restrict log access.
- [ ] Synchronize server/database clocks and alert on significant clock drift.
- [ ] Define log retention and deletion periods.
- [ ] Create an incident runbook: contain, rotate secrets, revoke sessions,
  preserve evidence, restore service, notify affected parties, and document fixes.
- [ ] Test the incident runbook with a tabletop exercise before launch.

## Dependencies, CI/CD, and host hardening

- [x] A local `npm audit` and `pip-audit` completed without known vulnerabilities
  during the current security work.
- [x] Backend security tests cover headers, cross-site blocking, disabled public
  registration, authentication requirements, token claims, hashing, and login
  rate limiting.
- [ ] Run backend tests, frontend lint/build, `npm audit`, and `pip-audit` in CI for
  every pull request.
- [ ] Enable automated dependency update pull requests and review them promptly.
- [ ] Add secret scanning and block commits containing credentials.
- [ ] Add Python and TypeScript static analysis/security checks in CI.
- [ ] Pin deployment artifacts with a lockfile/image digest and generate an SBOM.
- [ ] Run the backend and proxy as non-root users with read-only containers/files
  where practical.
- [ ] Apply operating-system and container security updates regularly.
- [ ] Restrict deployment and CI credentials to least privilege and protect the
  production branch/environment with review rules.
- [ ] Separate development, staging, and production databases, keys, and secrets.

## Production environment checklist

Do not copy development secrets into production. Store sensitive values in the
hosting platform's secret manager and inject them at runtime.

- [ ] `ENVIRONMENT=production`
- [ ] `JWT_SECRET_KEY=<unique random secret of at least 32 bytes>`
- [ ] `JWT_ISSUER=life-stack-api` (or a documented production-specific value)
- [ ] `JWT_AUDIENCE=life-stack-web` (or a documented production-specific value)
- [ ] `SESSION_COOKIE_SECURE=true`
- [ ] `ALLOWED_ORIGINS=https://<exact-public-hostname>`
- [ ] `ALLOWED_HOSTS=<exact-public-hostname>`
- [ ] `REGISTRATION_ENABLED=false`
- [ ] `ENABLE_API_DOCS=false`
- [ ] `ENABLE_DB_HEALTH_ROUTE=false`
- [ ] `DATABASE_URL=<private TLS PostgreSQL connection>`
- [ ] `OMDB_API_KEY` and `OPENAI_API_KEY` loaded from the secret store
- [ ] Confirm no `VITE_*` frontend variable contains a secret; Vite variables are
  shipped to every browser.

## Verification before launch

- [ ] Run all automated backend/frontend tests from a clean checkout.
- [ ] Verify two-user horizontal-authorization tests cannot cross account data.
- [ ] Verify cookies are `Secure`, `HttpOnly`, `SameSite=Strict`, correctly scoped,
  and absent from JavaScript storage.
- [ ] Verify HTTP redirects to HTTPS and HSTS is present only after HTTPS works.
- [ ] Verify CORS rejects a malicious origin and accepts only the real frontend.
- [ ] Verify login throttling from the actual client IP through the proxy.
- [ ] Verify registration, API docs, OpenAPI JSON, and DB health endpoints are off.
- [ ] Run dependency, secret, and static-analysis scans.
- [ ] Run an authenticated dynamic scan against staging and manually verify IDOR,
  CSRF, upload, and session-revocation behavior.
- [ ] Restore the latest encrypted backup into an isolated environment.
- [ ] Record the deployed commit, migration version, dependency versions, and
  rollback procedure.

## Why these controls are layered

No individual control makes an internet application safe. For example:

- Rate limiting slows password guessing, but passkeys/gateway MFA make stolen
  passwords less useful.
- `HttpOnly` protects tokens from direct JavaScript access, while CSP reduces the
  chance that malicious JavaScript runs at all.
- Application `user_id` filters prevent cross-user reads, while authorization
  tests and optional database row-level security catch mistakes in those filters.
- Backups protect availability, but restore tests prove the backups are usable.

This is called **defense in depth**: independent controls limit the damage when
another control, configuration, or human process fails.

## Authoritative references

- [OWASP Application Security Verification Standard 5.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [NIST SP 800-63B-4: Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [FastAPI deployment concepts](https://fastapi.tiangolo.com/deployment/concepts/)
