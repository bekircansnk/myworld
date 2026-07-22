## 2025-02-18 - Prevent Path Traversal on File Uploads
**Vulnerability:** The AI report upload endpoint allowed users to define the destination filename directly from `file.filename` which enabled writing files to arbitrary paths via directory traversal `../` payloads.
**Learning:** `file.filename` from the client is untrusted and should never be used without strict sanitization. Using `os.path.join(upload_dir, file.filename)` without `os.path.basename` is a classic vulnerability vector.
**Prevention:** Always sanitize uploaded file names using `os.path.basename(file.filename.replace("\\", "/"))` or generate a random internal filename (like just a UUID without retaining the original name on disk) to prevent malicious path traversal injections.
