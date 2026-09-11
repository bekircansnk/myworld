
## 2024-05-30 - Broken Authentication: Insecure Password Reset
**Vulnerability:** Found an unauthenticated `/reset-password` endpoint that allowed anyone to reset any user's password by simply providing a username and a new password.
**Learning:** Maintaining legacy endpoints for backward compatibility without proper security controls (like authentication or token verification) can lead to complete account takeover vulnerabilities.
**Prevention:** Always deprecate and remove insecure legacy endpoints. If backward compatibility is required, it must still enforce the same security constraints (e.g., token verification) as the new endpoints.
