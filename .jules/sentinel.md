## 2025-09-13 - [Fix Path Traversal in File Uploads]
**Vulnerability:** Found a Path Traversal vulnerability (CWE-22) in `app/backend/app/routers/ads/reports.py` where `file.filename` from an uploaded file was used directly in `os.path.join()` without sanitization.
**Learning:** Even though the filename was prepended with a UUID, a payload like `../../../etc/passwd` would still cause directory traversal, potentially overwriting arbitrary files.
**Prevention:** Always sanitize user-provided filenames using `os.path.basename()` before appending them to file paths, especially when handling `UploadFile` objects in FastAPI.
