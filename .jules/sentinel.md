## 2024-05-18 - Fix unauthenticated password reset vulnerability
**Vulnerability:** The `/api/auth/reset-password` endpoint allowed changing any user's password using just their username, without any authentication or authorization token.
**Learning:** Legacy endpoints (marked for backwards compatibility) can introduce severe security holes if left unauthenticated in production.
**Prevention:** Ensure all state-changing endpoints (especially password resets) either require authentication or validate a short-lived, secure token before proceeding.
