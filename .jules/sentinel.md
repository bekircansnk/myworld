## 2024-05-24 - File Upload Path Traversal Prevention
**Vulnerability:** Path Traversal via `file.filename` during FastAPI `UploadFile` operations. Even if prefixed with UUIDs, an attacker could use directory traversal sequences (like `../`) to save files to arbitrary paths on the server.
**Learning:** Never trust user-provided filenames (`file.filename`). In Python, they must be rigorously sanitized.
**Prevention:** Always use a sanitation function (e.g., `secure_filename`) to strip non-alphanumeric/path characters before joining file names to absolute paths, and handle the case where `filename` is `None`.
