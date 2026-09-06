## 2024-05-15 - Fix SSRF Vulnerability in link-preview endpoint
**Vulnerability:** The `/api/link-preview` endpoint allowed arbitrary URL fetching, leading to Server-Side Request Forgery (SSRF). Attackers could probe internal networks and access loopback addresses.
**Learning:** It existed because there was no validation of the resolved IP addresses and `httpx.AsyncClient` was configured to automatically follow redirects, which allows attackers to bypass initial URL checks by redirecting a public domain to a private IP.
**Prevention:** Always manually resolve domain names using `socket.getaddrinfo`, validate the IP against private/loopback/link-local ranges using `ipaddress`, and implement custom redirect handling (disabling `follow_redirects`) to re-validate IPs on every redirect.
