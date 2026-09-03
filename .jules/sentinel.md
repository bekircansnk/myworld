## 2024-05-18 - Prevent SSRF in LinkBreeze feature
**Vulnerability:** The `/api/link-preview` endpoint uses `httpx.AsyncClient` with `follow_redirects=True` to fetch a user-provided URL without any validation to prevent Server-Side Request Forgery (SSRF). This allows attackers to request internal IPs (e.g. `127.0.0.1`, `169.254.169.254`) directly or via redirects.
**Learning:** External fetch features must validate hostnames against internal IP ranges. The validation must resolve DNS and be wary of redirects circumventing validation.
**Prevention:** Disable automatic redirects in `httpx`, manually resolve hostnames using `socket.getaddrinfo`, validate the IPs to ensure they aren't private or local, and loop through redirects manually so each new URL gets the same validation.
