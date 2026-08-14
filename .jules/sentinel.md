## 2026-08-14 - [Path Traversal in AI Report Uploads]
**Vulnerability:** The AI report upload endpoint at `app/backend/app/routers/ads/reports.py` allowed path traversal via `file.filename`, leading to potential arbitrary file write when saving uploaded reports.
**Learning:** Even when prepending a UUID, `os.path.join(dir, f"{uuid}_{filename}")` can still be traversed if the filename contains `../` due to how `os.path.join` and `os.path.abspath` process relative paths.
**Prevention:** Always sanitize `file.filename` using a strict function like `secure_filename` before using it in file operations, or avoid using the user-provided filename altogether.
