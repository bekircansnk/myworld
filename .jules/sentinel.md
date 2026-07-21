## 2025-02-14 - SSRF in Link Preview Endpoint
**Vulnerability:** Found a Server-Side Request Forgery (SSRF) vulnerability in the `/api/link-preview` endpoint (app/backend/app/main.py) which used `httpx.AsyncClient` without validating the target IP. It also had `follow_redirects=True`.
**Learning:** External URL fetching features without strict DNS/IP validation and redirect handling can easily lead to SSRF, allowing attackers to access internal services or cloud metadata APIs.
**Prevention:** Always perform DNS resolution and check the resolved IP against private, loopback, and link-local address spaces before making the HTTP request. Disable automatic redirect following in HTTP clients to prevent redirect-based SSRF bypass.
