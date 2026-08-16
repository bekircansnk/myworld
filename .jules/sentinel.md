
## 2024-08-16 - Prevent Path Traversal in File Uploads
**Vulnerability:** Path traversal in `UploadFile.filename` when saving uploaded files with `os.path.join(upload_dir, f"{prefix}_{file_name}")`. If `file_name` starts with `/` or contains `../`, it escapes `upload_dir`.
**Learning:** FastAPI's `UploadFile.filename` is user-provided and untrusted. `os.path.join` ignores earlier paths if a subsequent path is absolute (e.g. starts with `/`). Thus `os.path.join('/tmp', '/etc/passwd')` evaluates to `/etc/passwd`.
**Prevention:** Always extract `os.path.basename` and sanitize filenames to remove special characters using a utility like `secure_filename` before using them in file path concatenations.
