## 2026-08-30 - Fix Critical Authorization Bypass in Password Reset
**Vulnerability:** The legacy `/reset-password` endpoint was completely unauthenticated, allowing account takeover for any user.
**Learning:** Legacy 'backwards compatibility' endpoints can silently introduce critical security holes if authentication/authorization checks are not ported.
**Prevention:** Ensure all state-mutating endpoints, especially those modifying credentials, require strong authentication unless specifically designed for public access (and protected by tokens).
