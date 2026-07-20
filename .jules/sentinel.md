## 2024-07-20 - [Unauthenticated Password Reset Endpoint]
**Vulnerability:** Found an unauthenticated endpoint (`/reset-password`) that allowed arbitrary password resets just by providing a username and a new password, without any token or old password validation.
**Learning:** This endpoint was left in the codebase likely for backward compatibility ("Geriye uyumluluk"), but it posed a critical security risk by allowing unauthorized account takeovers.
**Prevention:** Avoid leaving legacy unauthenticated endpoints for critical actions like password resets. Always require a secure token, old password, or proper session authentication before allowing password changes.
