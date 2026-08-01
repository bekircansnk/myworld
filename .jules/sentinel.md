## 2024-05-15 - Path Traversal in File Uploads
**Vulnerability:** User-provided `file.filename` from `UploadFile` was used directly in `os.path.join` to construct file paths on the server in multiple endpoints (e.g., `/api/ads/reports/ai-analysis`), allowing a potential path traversal vulnerability.
**Learning:** `FastAPI`'s `UploadFile` object exposes the raw client-provided filename. It cannot be trusted as it might contain traversal sequences like `../../` or absolute paths.
**Prevention:** Always sanitize user-provided filenames before using them in file system operations. Using `os.path.basename(file.filename.replace("\\", "/"))` safely extracts just the filename and prevents directory traversal attacks across operating systems.
