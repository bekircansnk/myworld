## 2026-08-31 - Fix SSRF Vulnerability in Link Preview Endpoint
**Vulnerability:** The `/api/link-preview` endpoint fetched URLs without validating the resolved IP address, making it vulnerable to Server-Side Request Forgery (SSRF).
**Learning:** In async applications, DNS resolution must be performed non-blockingly (using `asyncio.run_in_executor`) and the resulting IP must be validated against private, loopback, and local ranges to prevent internal network scanning or access.
**Prevention:** Always resolve the hostname using `socket.getaddrinfo` and validate the IP using `ipaddress.ip_address(...).is_private` etc. before making HTTP requests with `httpx`.
