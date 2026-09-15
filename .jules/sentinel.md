## 2026-09-15 - Path Traversal in File Uploads
**Vulnerability:** Found `file.filename` being directly assigned to `file_name` and used in `os.path.join` during file uploads in `app/backend/app/routers/ads/reports.py`, allowing Path Traversal.
**Learning:** Uploaded file names must never be trusted. Directly using them in file paths without sanitization opens up arbitrary file write vulnerabilities.
**Prevention:** Always use `os.path.basename(file.filename)` or a secure utility to strip path characters before saving files to the filesystem.
