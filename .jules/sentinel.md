## 2024-05-18 - [Fix Unauthenticated Password Reset Endpoint]
**Vulnerability:** Unauthenticated password reset endpoint allows arbitrary account takeover via a simple API call specifying any username and a new password.
**Learning:** Legacy backward compatibility endpoints may conceal devastating security flaws if not properly audited when new, secure flows (e.g. token-based resets) are implemented.
**Prevention:** Always deprecate and fully remove insecure legacy authentication/authorization flows immediately after modernizing them. Do not keep them around "just in case" without rigorous security controls applied.
