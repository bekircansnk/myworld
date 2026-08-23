## 2024-08-23 - Account Takeover via Insecure Password Reset
**Vulnerability:** Unauthenticated password reset endpoint allowed modifying any user's password.
**Learning:** Leaving insecure endpoints for 'backwards compatibility' creates critical security holes. Never compromise security for legacy support without robust authentication.
**Prevention:** Completely remove deprecated endpoints or wrap them in authentication/authorization logic.
