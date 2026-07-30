## 2025-02-14 - Prevent Path Traversal in AI Analysis File Uploads
**Vulnerability:** The AI analysis report upload endpoint (`/api/ads/reports/ai-analysis`) directly used the user-provided `file.filename` attribute in `os.path.join()` when saving uploaded files to `/tmp/venus_ai_uploads`.
**Learning:** This allowed for a potential Path Traversal vulnerability where an attacker could provide a malicious filename like `../../../etc/passwd` to overwrite arbitrary files on the server (depending on process permissions).
**Prevention:** User-provided filenames must never be trusted. They should be explicitly sanitized using `os.path.basename()` after replacing backslashes with forward slashes (to handle Windows-style paths sent from browsers).
