## 2025-05-24 - File Upload Path Traversal Vulnerability
**Vulnerability:** Path traversal via `file.filename` in file upload endpoint in `app/backend/app/routers/ads/reports.py`.
**Learning:** The application was directly using the `filename` attribute provided by the client in `os.path.join`, allowing malicious users to upload files to arbitrary locations by injecting relative paths (e.g., `../../../etc/passwd`).
**Prevention:** Always sanitize client-provided filenames by explicitly replacing backslashes with forward slashes and extracting just the filename portion using `os.path.basename(raw_filename)` before joining with any directory path.
