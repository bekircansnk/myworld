## 2024-05-18 - SSRF Vulnerability in Link Preview

**Vulnerability:** Server-Side Request Forgery (SSRF) risk in `/api/link-preview` endpoint (`app/backend/app/main.py`). The endpoint fetches HTML content from user-provided URLs using `httpx.AsyncClient` with `follow_redirects=True` and without validating if the destination IP is an internal/private address.
**Learning:** External URL fetching must always validate that the resolved IP address is not internal/private (loopback, private, link-local) to prevent attackers from port-scanning or accessing internal services. Also, redirect following should be handled manually, re-validating the IP at each step.
**Prevention:** Always validate the IP address resolved from the hostname before making outbound requests using a safe URL checker. Set `follow_redirects=False` in HTTP clients and handle redirects manually, checking the new URL against the IP blocklist at each redirect step.
## 2024-05-18 - SSRF DNS Rebinding in Link Preview

**Vulnerability:** Even when validating an IP before fetching, `httpx` resolving the domain again introduces a Time-of-Check to Time-of-Use (TOCTOU) DNS Rebinding vulnerability where an attacker can change the DNS record to an internal IP between the validation and fetch.
**Learning:** To fully mitigate SSRF in python when fetching URLs, the HTTP client must connect directly to the validated IP address while manually overriding the `Host` header, instead of allowing the HTTP client to resolve the hostname again.
**Prevention:** Construct the URL using the resolved and validated IP directly (e.g. `http://[ip]`) and pass the original domain in the `Host` header.
## 2024-05-18 - Blocking Async Event Loop during DNS resolution

**Vulnerability:** Blocking event loop with standard library networking.
**Learning:** Using `socket.getaddrinfo` directly in a FastAPI endpoint completely blocks the asynchronous event loop while waiting for DNS resolution, turning an async application into a slow synchronous one and leading to potential Denial of Service.
**Prevention:** Always wrap blocking operations (like `socket.getaddrinfo`) in `await asyncio.get_running_loop().run_in_executor(None, ...)` to ensure the I/O doesn't freeze the main loop.
## 2024-05-18 - SSRF IP Address Checks (0.0.0.0 bypass)

**Vulnerability:** Checking for `is_loopback`, `is_private`, `is_link_local` and `is_multicast` on an IP address still leaves out `is_unspecified` (0.0.0.0 or ::). On Unix systems, connecting to 0.0.0.0 routes to localhost, bypassing the previous SSRF mitigations.
**Learning:** Checking what an IP is NOT is dangerous. Instead, use `ip.is_global` in Python `ipaddress` module as an allowlist to ensure the IP is publicly routable, effectively blocking local and unspecified IPs safely.
**Prevention:** Use `ip.is_global` for IP address validation when mitigating SSRF risks instead of manually checking for specific local/private ranges.
