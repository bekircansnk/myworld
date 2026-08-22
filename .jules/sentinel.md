## 2026-08-22 - SSRF Vulnerability in Link Preview
**Vulnerability:** The /api/link-preview endpoint accepted arbitrary URLs and fetched their content blindly, making it vulnerable to Server-Side Request Forgery (SSRF) where attackers could scan internal networks or access internal metadata services.
**Learning:** External URL fetching must always validate the resolved IP address against private/loopback address blocks before making the request, as relying solely on external URLs (like localhost or 169.254.169.254) poses a critical security risk.
**Prevention:** Implement strict URL parsing, resolve hostnames, and block private, loopback, link-local, and reserved IP ranges (using `ipaddress` module) before initializing HTTP clients.
