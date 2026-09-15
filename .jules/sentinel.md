
## 2025-01-20 - Unauthenticated Password Reset Endpoint Removed
**Vulnerability:** Found a legacy `/reset-password` endpoint in `auth.py` that allowed changing any user's password using only their username, without any authentication or token validation.
**Learning:** Legacy compatibility code must be strictly isolated and subjected to the same security standards as active code. Leaving unprotected "backward compatibility" endpoints exposes the system to critical risk.
**Prevention:** Always require cryptographic validation (like secure tokens) or valid sessions when performing sensitive actions like password resets, even for older app versions.
