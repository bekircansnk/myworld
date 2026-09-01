## 2024-05-24 - SSRF in link-preview endpoint
**Vulnerability:** Unrestricted URL fetching in `/api/link-preview` using `httpx.AsyncClient` with `follow_redirects=True`.
**Learning:** Attackers could bypass basic hostname checks via 3xx redirects to internal IPs or cloud metadata endpoints.
**Prevention:** Resolve hostnames to IPs using `socket.getaddrinfo` (in an executor to avoid blocking the async event loop), check against `ipaddress` properties (private, loopback, etc.), and manually handle redirects (`follow_redirects=False`) to re-validate IPs on every step.
