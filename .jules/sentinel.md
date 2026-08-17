## 2024-08-17 - Path Traversal in File Uploads
**Vulnerability:** The AI analysis report upload endpoint (`/ai-analysis`) directly uses `file.filename` in `os.path.join`, allowing path traversal (e.g., `../../../etc/passwd`) where files could be written outside the intended `/tmp/venus_ai_uploads` directory.
**Learning:** `os.path.join` correctly evaluates absolute paths or traversal paths inside the filename if it is not sanitized, leading to Arbitrary File Write vulnerabilities even if the upload directory is restricted.
**Prevention:** Always use a sanitization function like `secure_filename` (which calls `os.path.basename` and strips dangerous characters) on any user-provided filename before using it in file system operations.
