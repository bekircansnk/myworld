## 2026-09-02 - Prevent SSRF in Link Preview Endpoint
**Vulnerability:** The `/api/link-preview` endpoint accepted arbitrary URLs and automatically followed redirects (`follow_redirects=True`), which allowed attackers to fetch contents of internal services (SSRF) using loopback or private IPs.
**Learning:** Using `httpx.AsyncClient` with automatic redirects enabled circumvents initial URL validation if an external server redirects to an internal IP.
**Prevention:** Explicitly disable automatic redirects (`follow_redirects=False`) and manually validate the resolved IP address of every redirect target using `socket.getaddrinfo` and `ipaddress`. Asynchronous hostname resolution must be wrapped in `asyncio.get_running_loop().run_in_executor` to avoid blocking the event loop.
