## 2024-09-09 - Fix unauthenticated password reset vulnerability
**Vulnerability:** A legacy `/reset-password` endpoint in `app/backend/app/routers/auth.py` allowed anyone to reset any user's password using just their username, without any authentication or token verification.
**Learning:** Legacy endpoints kept for "backward compatibility" during authentication transitions (e.g., from username-only to email+token) can expose the entire system to authorization bypass if they are not properly deprecated, secured, or removed.
**Prevention:** Never leave unauthenticated state-mutating endpoints in production code, even for backward compatibility. Always ensure sensitive endpoints require proper authorization or valid secure tokens (e.g., UUID/JWT) for verification.
