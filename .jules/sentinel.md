## 2026-08-19 - Path Traversal Vulnerability Fix
**Vulnerability:** Path traversal via os.path.join with unsanitized filename in app/backend/app/routers/ads/reports.py
**Learning:** os.path.join absolute path override issue allows attackers to write files to arbitrary locations.
**Prevention:** Use a secure_filename utility to sanitize file names before using them in os.path.join.
